import { QrReader } from "react-qr-reader";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useParams } from "react-router-dom";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const abi = [
  "function getTicketEvent(uint256) view returns (uint256)",
  "function getEvent(uint256) view returns (tuple(string name, string date, uint256 price, uint256 totalTickets, uint256 ticketsSold, string image))",
  "function ticketScanned(uint256) view returns (bool)", // 🔥 Added
  "function checkIn(uint256) public"
];

let activeStream = null;
let isProcessing = false;

export default function EventDetails() {
  const { id } = useParams();
  const currentEventId = Number(id);

  const [eventStats, setEventStats] = useState(null);
  const [scanned, setScanned] = useState("");
  const [result, setResult] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);

  async function loadEventData() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const data = await contract.getEvent(currentEventId);
      setEventStats({
        name: data.name,
        date: data.date,
        price: ethers.utils.formatEther(data.price),
        sold: data.ticketsSold.toString()
      });
    } catch (err) { console.error("Error loading stats:", err); }
  }

  useEffect(() => {
    loadEventData();
    const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
    navigator.mediaDevices.getUserMedia = async function (constraints) {
      const stream = await originalGetUserMedia.call(this, constraints);
      activeStream = stream;
      return stream;
    };
    return () => { navigator.mediaDevices.getUserMedia = originalGetUserMedia; };
  }, [currentEventId]);

  function stopCamera() {
    if (activeStream) {
      activeStream.getTracks().forEach((track) => track.stop());
      activeStream = null;
    }
  }

  async function verifyTicket(data) {
    if (isProcessing) return;
    isProcessing = true;
    try {
      const tokenId = data.split(":")[1];
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      // const contract = new ethers.Contract(contractAddress, abi, provider);
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const ticketEventId = await contract.getTicketEvent(tokenId);
  //     setResult(ticketEventId.toString() === currentEventId.toString() ? "✅ VALID ACCESS" : "❌ WRONG EVENT");
  //   } catch { setResult("❌ INVALID TICKET"); }
  // }

  // Check if it's the right event first
    // const ticketEventId = await contract.getTicketEvent(tokenId);
    if (ticketEventId.toString() !== currentEventId.toString()) {
      setResult("❌ WRONG EVENT");
      isProcessing = false;
      return;
    }

    // Check if already scanned
    const isAlreadyScanned = await contract.ticketScanned(tokenId);
    if (isAlreadyScanned) {
      setResult("⚠️ ALREADY SCANNED");
      isProcessing = false;
      return;
      setTimeout(() => {
      window.location.reload();
    }, 5000);
    }

    // Mark as scanned on blockchain
    const tx = await contract.checkIn(tokenId);
    setIsScanning(false);
    await tx.wait();
    
    setResult("✅ VALID ACCESS");
    // return;
    setTimeout(() => {
      // window.location.reload();
      window.location.href = `/`
    }, 5000);
  } catch (err) { 
    console.error(err);
    setResult("❌ INVALID TICKET"); 
    // isProcessing = false;
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  }
}

  return (
    <main className="max-w-4xl mx-auto py-12 px-6">
      {/* Horizontal Stats Bar */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl">📊</div>
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">Live Event Stats</h3>
            <p className="text-xl font-semibold text-slate-800 mt-1">{eventStats ? eventStats.name : "Loading..."}</p>
          </div>
        </div>
        
        <div className="flex gap-10">
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Tickets Sold</p>
            <p className="text-xl font-bold text-indigo-600">{eventStats ? eventStats.sold : "--"}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Price</p>
            <p className="text-xl font-bold text-slate-800">{eventStats ? `${eventStats.price} ETH` : "--"}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Event ID</p>
            <p className="text-xl font-bold text-slate-300">#{currentEventId}</p>
          </div>
        </div>
      </div>

      {/* Large Center Scanner Card */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl p-12 flex flex-col items-center justify-center min-h-[500px]">
        {!isScanning ? (
          <div className="text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Gate Control</h2>
            <p className="text-slate-400 mb-10">Scan visitor QR code to verify entry</p>
            <button 
              onClick={() => { setResult(""); setScanned(""); setIsScanning(true); setScannerKey(prev => prev + 1); isProcessing = false; }}
              className="px-12 py-5 bg-indigo-500 text-white rounded-2xl font-bold text-lg hover:bg-indigo-600 transition-all hover:scale-105 shadow-xl shadow-indigo-100"
            >
              Start Scanning
            </button>
          </div>
        ) : (
          <div className="w-full max-w-sm flex flex-col items-center">
            <div className="w-full aspect-square rounded-[2.5rem] overflow-hidden border-8 border-indigo-50 shadow-inner bg-black">
              <QrReader
                key={scannerKey}
                constraints={{ facingMode: "environment" }}
                onResult={(res) => {
                  if (res) {
                    verifyTicket(res.text);
                    // stopCamera();
                    setIsScanning(false);
                    setScannerKey(prev => prev + 1);
                  }
                }}
                videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <button 
              onClick={() => { stopCamera(); setIsScanning(false); }}
              className="mt-8 text-slate-400 font-medium hover:text-rose-500 transition-colors"
            >
              Cancel & Close Camera
            </button>
          </div>
        )}

        {/* Verification Alert Overlay */}
        {result && (
          <div className={`mt-10 w-full max-w-sm p-6 rounded-2xl border-2 text-center animate-in zoom-in duration-300 ${
            result.includes("✅") ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-700"
          }`}>
            <span className="text-xl font-black uppercase tracking-[0.2em]">{result}</span>
          </div>
        )}
      </div>
    </main>
  );
}