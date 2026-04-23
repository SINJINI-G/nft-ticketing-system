import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { QRCodeCanvas } from "qrcode.react";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

const abi = [
  "function buyTicket(uint256) payable",
  "function getEvent(uint256) view returns (tuple(string name, string date, uint256 price, uint256 totalTickets, uint256 ticketsSold, string image))",
  "function tokenCounter() view returns (uint256)"
];

export default function TicketPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qr, setQr] = useState("");
  // const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  // const [selectedEventId, setSelectedEventId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [eventName, setEventName] = useState("Loading...");

  // Fetch Event Name on load
  useEffect(() => {
    async function getEventDetails() {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, abi, provider);
        const event = await contract.getEvent(id);
        setEventName(event.name);
      } catch (err) {
        console.error("Failed to fetch event name:", err);
        setEventName(`Event #${id}`);
      }
    }
    getEventDetails();
  }, [id]);

  // async function buyTicket(eventId) {
  //   if (loading) return;
  //   setLoading(true);

  //   try {
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const signer = provider.getSigner();
  //     const contract = new ethers.Contract(contractAddress, abi, signer);

  //     const event = await contract.getEvent(eventId);
  //     const price = event.price;

  //     const userAddress = await signer.getAddress();
  //     const balance = await provider.getBalance(userAddress);

  //     if (balance.lt(price)) {
  //       alert(`Insufficient Funds! You need ${ethers.utils.formatEther(price)} ETH, but you have ${ethers.utils.formatEther(balance)} ETH.`);
  //       navigate("/"); 
  //       return;
  //     }

  //     const tx = await contract.buyTicket(eventId, { value: price });
  //     await tx.wait();

  //     const tokenCounter = await contract.tokenCounter();
  //     const newTokenId = tokenCounter.sub(1).toString();

  //     setQr(`TicketID:${newTokenId}`);
  //     alert("Ticket Purchased!");
  //   } catch (err) {
  //     console.error(err);
  //     if (err.code === 4001) {
  //       alert("Transaction cancelled by user.");
  //     } else {
  //       alert("An error occurred during purchase.");
  //     }
  //     navigate("/"); 
  //   } finally {
  //     setLoading(false);
  //   }
  // }

 const buyTicket = async (eventId) => {
  if (loading) return;

  if (!email) {
    alert("Please enter email");
    return;
  }

  try {
    setLoading(true);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    // 🔥 get event details again
    const event = await contract.getEvent(eventId);

    const tx = await contract.buyTicket(eventId, {
  value: event.price,
});

await tx.wait();

// ✅ SAFE WAY
const tokenCounter = await contract.tokenCounter();
const tokenId = tokenCounter.sub(1).toString();

    // 🔥 send email
    await fetch("http://localhost:5000/send-ticket", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        tokenId,
        eventName: event.name,
        eventDate: event.date,
      }),
    });

    // 🔥 show QR
    setQr(`TICKET:${tokenId}`);

    alert("Ticket bought & email sent!");

    // setShowEmailForm(false);
    setEmail("");

  } catch (err) {
    console.error(err);
    alert("Transaction failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-md mx-auto py-20 px-6">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-10 text-center">
        
        {/* Header section: Only shows if QR is NOT yet generated */}
        {!qr ? (
  <>
    <h2 className="text-2xl font-bold text-slate-900 mb-2">
      Complete Purchase
    </h2>

    <p className="text-slate-500 mb-8 font-light">
      Confirm your transaction to mint your NFT ticket for{" "}
      <span className="font-semibold text-indigo-600">
        {eventName}
      </span>.
    </p>

    {/* ✅ EMAIL INPUT */}
    <input
      type="email"
      placeholder="Enter your email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full mb-4 p-3 border rounded-xl"
    />

    {/* ✅ BUTTON */}
    <button
      onClick={() => buyTicket(id)}
      disabled={loading}
      className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
    >
      {loading ? "Processing Transaction..." : "Confirm & Mint"}
    </button>
  </>
) : (
          /* Success section: Replaces the header and button entirely */
          <div className="animate-in fade-in zoom-in duration-500">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Ticket</h2>
            <p className="text-slate-500 mb-8 font-light">Scan this at the gate for {eventName}</p>
            
            <div className="inline-block p-6 bg-slate-50 rounded-[2rem] border border-slate-100 mb-6">
              <QRCodeCanvas value={qr} size={200} />
            </div>
            
            <div className="bg-emerald-50 text-emerald-600 py-3 rounded-xl font-bold text-sm uppercase tracking-widest">
              Success! Ticket Minted
            </div>
            
            <button 
              onClick={() => navigate("/my-tickets")} 
              className="mt-6 w-full py-3 text-slate-400 hover:text-indigo-500 font-medium transition-colors"
            >
              View in My Collection
            </button>
          </div>
        )}
      </div>
      {/* {showEmailForm && (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }}>
    <div style={{
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      width: "300px",
      textAlign: "center"
    }}>
      <h3>Enter Email</h3>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />

      <button
        onClick={() => buyTicket(selectedEventId)}
        style={{ marginRight: "10px" }}
      >
        Confirm
      </button>

      <button onClick={() => setShowEmailForm(false)}>
        Cancel
      </button>
    </div>
  </div>
)} */}
    </div>
  );
}