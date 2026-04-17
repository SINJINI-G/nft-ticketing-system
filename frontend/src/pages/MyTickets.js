import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { QRCodeCanvas } from "qrcode.react";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

const abi = [
  "function getUserTickets(address) view returns (uint256[])",
  "function getTicketEvent(uint256) view returns (uint256)"
];

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [showQR, setShowQR] = useState(null);

  async function loadTickets() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    const address = await signer.getAddress();
    const userTickets = await contract.getUserTickets(address);

    setTickets(userTickets);
  }

  useEffect(() => {
    loadTickets();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>My Tickets</h2>

      {tickets.map((t, i) => (
        <div key={i} style={{ border: "1px solid", padding: 10, margin: 10 }}>
          <p>Token ID: {t.toString()}</p>

          <button onClick={() => setShowQR(t)}>
            Show QR
          </button>
        </div>
      ))}

      {/* POPUP */}
      {showQR && (
        <div style={{
          position: "fixed",
          top: "30%",
          left: "40%",
          background: "white",
          padding: 20
        }}>
          <QRCodeCanvas value={`TicketID:${showQR}`} />
          <br />
          <button onClick={() => setShowQR(null)}>Close</button>
        </div>
      )}
    </div>
  );
}