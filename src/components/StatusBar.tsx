"use client";

import { useEffect, useState } from "react";

export default function StatusBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute top-4 left-4 right-4 p-4 flex justify-between items-center rounded-2xl bg-white/20 backdrop-blur-2xl border border-white/30 shadow-lg">
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
  );
}
