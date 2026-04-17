import { useState, useEffect } from "react";
import { ethers } from "ethers";
import EventCard from "../components/EventCard";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

const abi = [
  "function getEvent(uint256) view returns (tuple(string name, string date, uint256 price, uint256 ticketsSold, string image))",
  "function eventCounter() view returns (uint256)",
  "function createEvent(string,string,uint256,string)"
];

export default function OrganiserDashboard() {
  const [events, setEvents] = useState([]);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");

  // CREATE EVENT
  async function createEvent() {
    if (!name || !date || !price || !image) {
    alert("Please fill all fields!");
    return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    await contract.createEvent(name, date, ethers.utils.parseEther(price), image);
    alert("Event Created!");
    loadEvents();
  }

  // LOAD EVENTS
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
      <h2>Organiser Panel</h2>

      <h3>Create Event</h3>
      <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
      <input
        type="date"
        onChange={(e) => setDate(e.target.value)}
        />
        {/* <input palceholder="Price in ETH" onChange={(e) => setPrice(e.target.value)} /> */}
        <input placeholder="Price in ETH" onChange={(e) => setPrice(e.target.value)} />
      <input
  type="text"
  placeholder="Enter Image URL"
  onChange={(e) => setImage(e.target.value)}
/>
      <button onClick={createEvent}>Create</button>

      <h3>Your Events</h3>

      {events.map((e) => (
        <EventCard key={e.id} event={e} role="organiser" />
      ))}
    </div>
  );
}