import { Sparkles, Play } from "lucide-react";
import { Montserrat } from "next/font/google";
import React from "react";

const monte = Montserrat({ subsets: ["latin"] });

const Home = () => {
  return (
    <div className="relative">
      <div
        className={`min-h-screen flex items-center justify-center bg-neutral-50/70 rounded-md px-4 ${monte.className}`}
      >
        <div></div>
        {/* Centered Content Box */}
        <div className="max-w-[48rem] w-full flex flex-col items-center justify-center text-center">
          {/* Main Heading */}
          <h1 className="text-6xl font-bold text-neutral-900 leading-tight mb-2">
            Watch together, <br />
            feel the{" "}
            <span className="relative inline-block px-3 py-1 rotate-[1deg]">
              <span className="absolute inset-0 bg-gradient-to-br from-emerald-200 via-emerald-300 to-emerald-400 rounded-xl shadow-[inset_0_2px_12px_rgba(0,0,0,0.15)] border border-emerald-300/50"></span>
              <span className="relative z-10 text-emerald-700 font-bold">
                moment
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-neutral-600 max-w-lg mb-10 text-sm">
            Great moments deserve a system that does it all — from creating
            rooms and smooth syncing to helping you connect and track watch
            sessions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 rounded-full font-medium transition-colors ">
              <Play className="w-4 h-4 fill-white" />
              Create a Room
            </button>
            <button className="inline-flex items-center gap-2 bg-white hover:bg-neutral-50 text-neutral-900 px-6 py-3 rounded-full font-medium border border-neutral-200 transition-colors">
              <Sparkles className="w-4 h-4" />
              Join a Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
