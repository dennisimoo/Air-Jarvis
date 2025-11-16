"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [flightNumber, setFlightNumber] = useState("");
  const [userName, setUserName] = useState("");
  const [time, setTime] = useState(new Date());
  const [activated, setActivated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (flightNumber.trim()) {
      router.push(`/questionnaire?flight=${encodeURIComponent(flightNumber)}&name=${encodeURIComponent(userName)}`);
    }
  };

  const handleActivate = () => {
    setActivated(true);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-sky-200 overflow-hidden">
      {/* Cloud background image - blurred initially */}
      <div
        className={`absolute inset-0 opacity-70 transition-all duration-1000 ${
          !activated ? 'blur-2xl' : 'blur-0'
        }`}
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>

      {/* Light overlay for better contrast - blurred initially */}
      <div className={`absolute inset-0 bg-linear-to-b from-sky-300/30 to-sky-100/30 transition-all duration-1000 ${
        !activated ? 'blur-2xl' : 'blur-0'
      }`}></div>

      {/* Status bar top - hidden initially */}
      <div
        className={`absolute top-4 left-4 right-4 p-4 flex justify-between items-center rounded-2xl bg-white/20 backdrop-blur-2xl border border-white/30 shadow-lg transition-all duration-1000 delay-300 ${
          !activated ? 'opacity-0 scale-95 blur-xl' : 'opacity-100 scale-100 blur-0'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            <span className="text-xs text-blue-950/80 font-medium">SYSTEM ONLINE</span>
          </div>
          <div className="text-xs text-blue-900/60 font-medium">v3.14.159</div>
        </div>
        <div className="text-xs text-blue-950/80 font-medium">
          {time.toLocaleTimeString()}
        </div>
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center text-center px-8 max-w-4xl w-full">
        {/* JARVIS title with complex spinning loader - always visible and clickable */}
        <div className={`mb-8 relative w-[350px] h-[350px] flex items-center justify-center transition-all duration-700 ${
          !activated ? 'cursor-pointer hover:scale-110' : ''
        }`}
        onClick={!activated ? handleActivate : undefined}
        >
          {/* Main outer loader */}
          <div className="loader-outer-small-home" style={{ width: '100%', height: '100%', margin: '-175px 0 0 -175px' }}></div>

          {/* Inner loader with pseudo elements */}
          <div className="loader-inner-small-home" style={{ width: '100%', height: '100%', margin: '-175px 0 0 -175px' }}></div>

          {/* Pulsating center rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-cyan-400/40 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-36 h-36 border-2 border-blue-400/50 rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.3s' }}></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 border-2 border-cyan-500/60 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '0.6s' }}></div>
          </div>

          {/* Center glowing orb */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-cyan-400/30 rounded-full animate-pulse" style={{
              boxShadow: '0 0 30px rgba(0, 217, 255, 0.6), 0 0 60px rgba(0, 217, 255, 0.4)',
              animationDuration: '2s'
            }}></div>
          </div>

          {/* AIR JARVIS text */}
          <h1 className="relative z-10 text-3xl font-light tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white/90 to-white/60" style={{
            WebkitTextStroke: '1px rgba(255, 255, 255, 0.3)',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
          }}>
            AIR JARVIS
          </h1>
        </div>

        {/* Flight input section - hidden initially, pops up from center */}
        <div
          className={`w-full max-w-2xl transition-all duration-1000 delay-500 ${
            !activated
              ? 'opacity-0 scale-50 blur-2xl pointer-events-none'
              : 'opacity-100 scale-100 blur-0'
          }`}
        >
          <div className="mb-6 text-blue-950/70 text-sm font-medium tracking-wider">
            &gt; AWAITING USER CREDENTIALS
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-6 py-4 bg-white/30 backdrop-blur-2xl border border-white/40 rounded-2xl text-blue-950 placeholder-blue-900/40 focus:outline-none focus:border-white/60 focus:bg-white/40 transition-all duration-300 text-center text-lg font-medium shadow-lg"
              />
            </div>

            <div className="relative group">
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="Enter flight number"
                className="w-full px-6 py-4 bg-white/30 backdrop-blur-2xl border border-white/40 rounded-2xl text-blue-950 placeholder-blue-900/40 focus:outline-none focus:border-white/60 focus:bg-white/40 transition-all duration-300 text-center text-lg font-medium shadow-lg"
                required
              />
            </div>

            <button
              type="submit"
              className="relative w-full px-6 py-4 bg-blue-600/80 backdrop-blur-2xl border border-blue-500/50 rounded-2xl text-white hover:bg-blue-600/90 hover:border-blue-400/60 hover:shadow-xl transition-all duration-300 font-medium tracking-wide text-base uppercase shadow-lg"
            >
              <span className="relative z-10">INITIALIZE FLIGHT PROTOCOL</span>
            </button>
          </form>

          {/* Status indicators */}
          <div className="mt-8 flex justify-center gap-8 text-xs text-blue-950/70 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400/50"></div>
              <span>NEURAL LINK</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400/50"></div>
              <span>DATABASE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400/50"></div>
              <span>QUANTUM CORE</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom info bar - hidden initially */}
      <div
        className={`absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/20 backdrop-blur-2xl border border-white/30 shadow-lg flex justify-between items-center text-xs text-blue-950/70 font-medium transition-all duration-1000 delay-300 ${
          !activated ? 'opacity-0 scale-95 blur-xl' : 'opacity-100 scale-100 blur-0'
        }`}
      >
        <div>STARK INDUSTRIES © 2025</div>
        <div>PROTOCOL: FLIGHT-TRACK-ALPHA</div>
      </div>
    </div>
  );
}
