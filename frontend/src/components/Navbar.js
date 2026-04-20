import { useNavigate } from "react-router-dom";

export default function Navbar({ role, setRole }) {
  const navigate = useNavigate();

  function switchRole(newRole) {
    setRole(newRole);
    navigate("/");
  }

  return (
    <nav className="flex justify-between items-center px-10 py-5 bg-white border-b border-slate-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        </div>
        <span className="text-lg font-medium tracking-tight text-slate-900">NFT Based Event Ticketing</span>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => switchRole("organiser")}
          className={`text-sm font-medium transition-colors ${role === 'organiser' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
        >
          Organizer
        </button>
        <button 
          onClick={() => switchRole("user")}
          className={`text-sm font-medium transition-colors ${role === 'user' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
        >
          User
        </button>
        <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>
        <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all shadow-md shadow-slate-200">
          Connected Wallet
        </button>
      </div>
    </nav>
  );
}