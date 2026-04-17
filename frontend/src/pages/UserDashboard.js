import { useEffect, useState } from "react";
import { ethers } from "ethers";
import EventCard from "../components/EventCard";
import { useNavigate } from "react-router-dom";


const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

const abi = [
  "function getEvent(uint256) view returns (tuple(string name, string date, uint256 price, uint256 ticketsSold, string image))",
  "function eventCounter() view returns (uint256)"
];

export default function UserDashboard() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  async function loadEvents() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const count = await contract.eventCounter();

    let arr = [];

    for (let i = 0; i < count; i++) {
      const e = await contract.getEvent(i);

      arr.push({
        id: i,
        name: e.name,
        date: e.date,
        price: ethers.utils.formatEther(e.price),
        sold: e.ticketsSold,
        image: e.image
      });
    }

    setEvents(arr);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Available Events</h2>
        <button onClick={() => navigate("/my-tickets")}>
        My Tickets
      </button>
      {events.map((e) => (
        <EventCard key={e.id} event={e} role="user" />
      ))}
    </div>
  );
}