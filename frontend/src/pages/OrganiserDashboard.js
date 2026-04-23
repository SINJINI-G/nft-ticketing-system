import { useState, useEffect } from "react";
import { ethers } from "ethers";
import EventCard from "../components/EventCard";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

const abi = [
  "function getEvent(uint256) view returns (tuple(string name, string date, uint256 price, uint256 totalTickets, uint256 ticketsSold, string image))",
  "function createEvent(string,string,uint256,uint256,string)",
  "function eventCounter() view returns (uint256)"
];

export default function OrganiserDashboard() {
  const [events, setEvents] = useState([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalTickets, setTotalTickets] = useState("");

  async function createEvent() {
    if (!name || !date || !price || !image) {
      alert("Please fill all fields!");
      return;
    }
    const selectedDate = new Date(date).getTime();
    const today = new Date().setHours(0, 0, 0, 0); // Reset time to midnight for fair comparison

    if (selectedDate < today) {
      alert("You cannot create an event for a past date!");
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const tx = await contract.createEvent(
  name,
  date,
  ethers.utils.parseEther(price),
  totalTickets,
  image
);
      await tx.wait();
      alert("Event Created Successfully!");
      loadEvents();
    } catch (err) {
      console.error(err);
      alert("Failed to create event.");
    }
    setLoading(false);
  }

  async function loadEvents() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const count = await contract.eventCounter();

      let arr = [];
      for (let i = 0; i < count; i++) {
        const e = await contract.getEvent(i);
        arr.push({
  id: i.toString(),
  name: e.name,
  date: e.date,
  price: ethers.utils.formatEther(e.price),
  sold: e.ticketsSold.toString(),
  total: e.totalTickets.toString(),
  image: e.image
});
      }
      setEvents(arr);
    } catch (err) {
      console.error("Error loading events:", err);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <main className="max-w-6xl mx-auto py-12 px-8">
      {/* Header Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-slate-900">Organiser Panel</h2>
        <p className="text-slate-500 mt-2">Manage your events and mint new ticketing experiences.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Creation Form Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-50 sticky top-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-500 mb-6">Create New Event</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase ml-1">Event Name</label>
                <input 
                  className="w-full mt-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="e.g. Summer Music Fest" 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase ml-1">Event Date</label>
                <input 
                  type="date"
                  className="w-full mt-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-600"
                  onChange={(e) => setDate(e.target.value)} 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase ml-1">Ticket Price (ETH)</label>
                <input 
                  className="w-full mt-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="0.05" 
                  onChange={(e) => setPrice(e.target.value)} 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase ml-1">
                  Total Tickets
                </label>
                <input
                  type="number"
                  className="w-full mt-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="e.g. 100"
                  onChange={(e) => setTotalTickets(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase ml-1">Cover Image URL</label>
                <input 
                  className="w-full mt-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="https://images.unsplash.com/..." 
                  onChange={(e) => setImage(e.target.value)} 
                />
              </div>

              <button 
                onClick={createEvent}
                disabled={loading}
                className="w-full mt-4 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
              >
                {loading ? "Creating on Chain..." : "Publish Event"}
              </button>
            </div>
          </div>
        </div>

        {/* List of Created Events */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-800">Your Live Events</h3>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-tighter">
              {events.length} Total
            </span>
          </div>

          {events.length === 0 ? (
            <div className="h-64 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-400">
              <p>No events created yet.</p>
              <p className="text-xs mt-1">Fill the form to host your first experience.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {events.map((e) => (
                <EventCard key={e.id} event={e} role="organiser" />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}