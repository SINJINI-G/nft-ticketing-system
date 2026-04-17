import { useParams } from "react-router-dom";
import { useState } from "react";
import { ethers } from "ethers";
import { QRCodeCanvas } from "qrcode.react";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

const abi = [
  "function createEvent(string,string,uint256)",
  "function buyTicket(uint256) payable",
  "function getEvent(uint256) view returns (tuple(string name, string date, uint256 price, uint256 ticketsSold))",
  "function eventCounter() view returns (uint256)",
  "function getTicketEvent(uint256) view returns (uint256)",
  "function tokenCounter() view returns (uint256)",
  "function getUserTickets(address) view returns (uint256[])" 
];

export default function TicketPage() {
  const { id } = useParams();
  const [qr, setQr] = useState("");
  const [loading, setLoading] = useState(false);

  async function buyTicket(eventId) {
  if (loading) return;
  setLoading(true);

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    const event = await contract.getEvent(eventId);
    const price = event.price;

    const tx = await contract.buyTicket(eventId, {
      value: price
    });

    await tx.wait();

    // ✅ GET NEW TOKEN ID
    const tokenCounter = await contract.tokenCounter();
    const newTokenId = tokenCounter - 1;

    // ✅ SET QR
    setQr(`TicketID:${newTokenId}`);

    alert("Ticket Purchased!");
  } catch (err) {
    console.error(err);
  }

  setLoading(false);
}

  return (
    <div>
      <h2>Buy Ticket</h2>

        <button onClick={() => buyTicket(id)} disabled={loading}>
        {loading ? "Processing..." : "Confirm Purchase"}
        </button>
      {qr && (
        <>
          <h3>Your Ticket QR</h3>
          <div style={{ padding: 20, background: "white" }}>
            <QRCodeCanvas value={qr} size={256} />
        </div>
        </>
      )}
    </div>
  );
}