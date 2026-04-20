import { useParams } from "react-router-dom";
import { useState } from "react";
import { ethers } from "ethers";
import { QRCodeCanvas } from "qrcode.react";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

const abi = [
  "function buyTicket(uint256) payable",
  "function getEvent(uint256) view returns (tuple(string name, string date, uint256 price, uint256 ticketsSold))",
  "function tokenCounter() view returns (uint256)"
];

export default function TicketPage() {
  const { id } = useParams();
  const [qr, setQr] = useState("");
  const [loading, setLoading] = useState(false);

  // Restored function to fix "buyTicket is not defined"
  async function buyTicket(eventId) {
    if (loading) return;
    setLoading(true);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      // Fetch event price from contract
      const event = await contract.getEvent(eventId);
      const price = event.price;

      const tx = await contract.buyTicket(eventId, {
        value: price
      });

      await tx.wait();

      // Get the new Token ID (tokenCounter - 1)
      const tokenCounter = await contract.tokenCounter();
      const newTokenId = tokenCounter.sub(1).toString();

      setQr(`TicketID:${newTokenId}`);
      alert("Ticket Purchased!");
    } catch (err) {
      console.error(err);
      alert("Purchase failed. Check console for details.");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto py-20 px-6">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-10 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete Purchase</h2>
        <p className="text-slate-500 mb-8 font-light">
          Confirm your transaction to mint your NFT ticket for Event #{id}.
        </p>
        
        {!qr ? (
          <button 
            onClick={() => buyTicket(id)} 
            disabled={loading}
            className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
          >
            {loading ? "Processing Transaction..." : "Confirm & Mint"}
          </button>
        ) : (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="inline-block p-6 bg-slate-50 rounded-[2rem] border border-slate-100 mb-6">
              <QRCodeCanvas value={qr} size={200} />
            </div>
            <div className="bg-emerald-50 text-emerald-600 py-3 rounded-xl font-bold text-sm uppercase tracking-widest">
              Success! Ticket Minted
            </div>
            <p className="mt-4 text-xs text-slate-400 font-mono">{qr}</p>
          </div>
        )}
      </div>
    </div>
  );
}