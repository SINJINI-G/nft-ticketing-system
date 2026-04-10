import React, { useState } from "react";
import { ethers } from "ethers";
import { QRCodeSVG } from "qrcode.react";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const abi = [
  "function mintTicket(address to) public",
  "function ownerOf(uint256 tokenId) view returns (address)"
];

function App() {
  const [account, setAccount] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  async function connectWallet() {
    if (!window.ethereum) return alert("MetaMask not found");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x7A69" }],
      });
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    } catch (err) { console.error(err); }
  }

  async function mintTicket() {
    if (!account) return alert("Connect wallet first!");
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract.mintTicket(account);
      await tx.wait();
      alert("Ticket successfully minted!");
    } catch (err) {
      console.error(err);
      alert("Minting failed.");
    }
    setLoading(false);
  }

  async function checkToken() {
    if (!tokenId) return;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      await contract.ownerOf(tokenId);
      setIsValid(true);
    } catch (error) {
      setIsValid(false);
      alert("Invalid Token ID.");
    }
  }

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-slate-800">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-10 py-5 bg-white border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <span className="text-lg font-medium tracking-tight text-slate-900">NFT Based Event Ticketing</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            className="px-5 py-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
            onClick={() => alert("Organizer Dashboard coming soon!")}
          >
            Organizer
          </button>
          <button 
            onClick={connectWallet}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all shadow-md shadow-slate-200"
          >
            {account ? `${account.slice(0,6)}...${account.slice(-4)}` : "Connect Wallet"}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-16 px-6">
        {/* Main Content Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Side: Info & Minting */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-semibold text-slate-900 leading-tight">
                Claim your digital entry <br/> 
                <span className="text-indigo-500">to the future.</span>
              </h2>
              <p className="mt-4 text-slate-500 text-lg max-w-md">
                Securely mint your event tickets as NFTs to ensure authenticity and seamless transfers.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-50">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-400 mb-6">Mint Ticket</h3>
              <div className="flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">🎫</div>
                <div>
                  <p className="font-semibold text-slate-800">Summer Music Expo 2026</p>
                  <p className="text-sm text-slate-400 font-light">Price: 0.05 ETH</p>
                </div>
              </div>
              <button 
                onClick={mintTicket}
                disabled={loading}
                className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-semibold hover:bg-indigo-600 transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                {loading ? "Confirming Transaction..." : "Mint Ticket Now"}
              </button>
            </div>
          </div>

          {/* Right Side: Verification/QR */}
          <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-50">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Access Gate</h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-2">Search Token ID</label>
                <div className="flex gap-3">
                  <input 
                    type="text"
                    placeholder="e.g. 101" 
                    className="flex-1 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    onChange={(e) => { setTokenId(e.target.value); setIsValid(false); }}
                  />
                  <button 
                    onClick={checkToken}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-medium hover:bg-slate-800 transition-all"
                  >
                    Check
                  </button>
                </div>
              </div>

              {/* Dynamic QR Display */}
              <div className="flex justify-center mt-6">
                {isValid ? (
                  <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
                    <div className="p-6 bg-white border border-indigo-50 rounded-[2rem] shadow-inner">
                      <QRCodeSVG value={`TicketID:${tokenId}`} size={200} />
                    </div>
                    <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-widest">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      Verified Access Grant
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-64 flex flex-col items-center justify-center bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[2rem]">
                    <div className="text-slate-300 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <p className="text-slate-400 text-sm">Enter a valid ID to see QR</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;