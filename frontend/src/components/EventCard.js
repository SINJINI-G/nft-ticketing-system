import React from "react";
import { Link } from "react-router-dom";

export default function EventCard({ event, role }) {
  return (
    /* Added max-w-xs to restrict width and h-[450px] to keep height consistent */
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-50 overflow-hidden flex flex-col transition-transform hover:scale-[1.02] max-w-[280px] h-[350px] mx-auto">
      
      {/* Fixed height image container */}
      <div className="relative h-40 w-60">
        <img 
          src={event.image} 
          alt={event.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
          <p className="text-[10px] font-bold text-indigo-600">{event.price} ETH</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-2">
          <h3 className="text-lg font-bold text-slate-900 truncate">{event.name}</h3>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span>📅</span> {event.date}
          </p>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-50 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <p className="text-[10px] uppercase font-bold text-slate-300">Sold</p>
            <p className="text-xs font-semibold text-slate-700">{event.sold}</p>
          </div>

          {role === "organiser" ? (
            <Link 
              to={`/event/${event.id}`}
              className="w-full py-2 bg-slate-900 text-white text-center text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Scan Tickets
            </Link>
          ) : (
            <Link 
              to={`/buy/${event.id}`}
              className="w-full py-2 bg-indigo-500 text-white text-center text-xs font-bold rounded-xl hover:bg-indigo-600 transition-colors"
            >
              Buy Ticket
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}