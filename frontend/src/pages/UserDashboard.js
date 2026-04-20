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
      arr.push({ id: i.toString(), name: e.name, date: e.date, price: ethers.utils.formatEther(e.price), sold: e.ticketsSold.toString(), image: e.image });
    }
    setEvents(arr);
  }

  useEffect(() => { loadEvents(); }, []);

  return (
    <main className="max-w-7xl mx-auto py-12 px-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] p-12 text-white mb-16 shadow-2xl shadow-indigo-100 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-4">Discover Extraordinary Events</h2>
          <p className="text-indigo-100 text-lg mb-8 opacity-90">Secure, verifiable NFT tickets for your next big experience.</p>
          <button 
            onClick={() => navigate("/my-tickets")}
            className="px-8 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg"
          >
            My Purchased Tickets
          </button>
        </div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-semibold text-slate-800">Available Experiences</h3>
        <div className="text-sm text-slate-400 font-medium uppercase tracking-widest">{events.length} Events Found</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((e) => (
          <EventCard key={e.id} event={e} role="user" />
        ))}
      </div>
    </main>
  );
}