import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { QRCodeCanvas } from "qrcode.react";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

const abi = [
  "function getUserTickets(address) view returns (uint256[])",
  "function getTicketEvent(uint256) view returns (uint256)",
  "function getEvent(uint256) view returns (tuple(string name, string date, uint256 price, uint256 ticketsSold, string image))"
];

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [showQR, setShowQR] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadTickets() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const address = await signer.getAddress();
      
      // 1. Get all token IDs owned by user
      const userTicketIds = await contract.getUserTickets(address);
      
      // 2. Map each ID to its event details
      const ticketDetails = await Promise.all(
        userTicketIds.map(async (tokenId) => {
          const eventId = await contract.getTicketEvent(tokenId);
          const eventData = await contract.getEvent(eventId);
          return {
            tokenId: tokenId.toString(),
            eventName: eventData.name,
            eventDate: eventData.date,
            eventImage: eventData.image
          };
        })
      );

      setTickets(ticketDetails);
    } catch (err) {
      console.error("Error loading tickets:", err);
    }
    setLoading(false);
  }

  useEffect(() => { loadTickets(); }, []);

  return (
    <main className="max-w-6xl mx-auto py-12 px-8">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-slate-900">My Collection</h2>
        <p className="text-slate-500">Your verified event access tokens.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 italic">Syncing with blockchain...</div>
      ) : tickets.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-slate-400">
          No tickets found in this wallet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {tickets.map((ticket, i) => (
            <div key={i} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-50 overflow-hidden flex flex-col">
              {/* Event Image as Header */}
              <div className="h-32 w-full relative">
                <img 
                  src={ticket.eventImage} 
                  alt={ticket.eventName} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                  {/* <span className="text-white text-xs font-bold uppercase tracking-widest bg-indigo-500 px-2 py-1 rounded-md">
                    Ticket #{ticket.tokenId}
                  </span> */}
                </div>
              </div>

              <div className="p-6 text-center">
                <h4 className="text-xl font-bold text-slate-800 truncate">{ticket.eventName}</h4>
                <p className="text-sm text-slate-400 mt-1 mb-6 flex items-center justify-center gap-2">
                  📅 {ticket.eventDate}
                </p>
                
                <button 
                  onClick={() => setShowQR(ticket.tokenId)}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all"
                >
                  Show Access QR
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR MODAL */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl text-center">
            {/* <h3 className="text-xl font-bold text-slate-900 mb-6 font-mono">Token ID: {showQR}</h3> */}
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 inline-block mb-8">
              <QRCodeCanvas value={`TicketID:${showQR}`} size={200} />
            </div>
            <button 
              onClick={() => setShowQR(null)}
              className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}