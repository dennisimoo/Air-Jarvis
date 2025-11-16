"use client";

import { useState } from "react";

export default function FlightInput() {
  const [flightNumber, setFlightNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (flightNumber.trim()) {
      console.log("Flight number submitted:", flightNumber);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6 text-blue-950/70 text-sm font-medium tracking-wider">
        &gt; AWAITING FLIGHT CREDENTIALS
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative group">
          <input
            type="text"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            placeholder="Enter flight number"
            className="w-full px-8 py-6 bg-white/30 backdrop-blur-2xl border border-white/40 rounded-2xl text-blue-950 placeholder-blue-900/40 focus:outline-none focus:border-white/60 focus:bg-white/40 transition-all duration-300 text-center text-xl font-medium shadow-lg"
          />
        </div>

        <button
          type="submit"
          className="relative w-full px-8 py-6 bg-blue-600/80 backdrop-blur-2xl border border-blue-500/50 rounded-2xl text-white hover:bg-blue-600/90 hover:border-blue-400/60 hover:shadow-xl transition-all duration-300 font-medium tracking-wide text-lg uppercase shadow-lg"
        >
          <span className="relative z-10">INITIALIZE FLIGHT PROTOCOL</span>
        </button>
      </form>

      {/* Status indicators */}
      <div className="mt-8 flex justify-center gap-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/30">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400/50"></div>
          <span className="text-xs text-blue-950/70 font-medium">NEURAL LINK</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/30">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400/50"></div>
          <span className="text-xs text-blue-950/70 font-medium">DATABASE</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/30">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400/50"></div>
          <span className="text-xs text-blue-950/70 font-medium">QUANTUM CORE</span>
        </div>
      </div>
    </div>
  );
}
