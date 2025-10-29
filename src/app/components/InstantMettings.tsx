import { Zap } from "lucide-react";
import React from "react";

const InstantMeetings = () => {
  return (
    <div className="relative flex flex-col items-center justify-center h-full">
      <div className="absolute top-21 right-28">
        <svg
          width="236"
          height="68"
          viewBox="0 0 236 68"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="hidden md:block rotate-90"
        >
          <path d="M0.5 0.5H89C90.6569 0.5 92 1.84315 92" stroke="#d1d5db" />
          <defs>
            <linearGradient
              id="paint0_linear"
              gradientUnits="userSpaceOnUse"
              x1="-100"
              y1="0"
              x2="-100"
              y2="0"
            >
              <stop stopColor="#2EB9DF" stopOpacity="0" />
              <stop stopColor="#2EB9DF" />
              <stop offset="1" stopColor="#9E00FF" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="bg-gradient-to-br absolute top-22 from-emerald-400 to-transparent border flex items-center rounded-full  shadow-2xl h-24 w-24">
        <div className="flex-1 h-20 flex items-center justify-center">
          <div className="border-2 border-white rounded-full p-3">
            <div className="border border-white/60 rounded-full p-2">
              <Zap strokeWidth={1} size={54} className="text-white font-thin" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div>
          <svg
            width="236"
            height="68"
            viewBox="0 0 236 68"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="hidden md:block absolute -right-22 top-35"
          >
            <path
              d="M0.5 0.5H89C90.6569 0.5 92 1.84315 92 3.5V29C92 30.6569 93.3431 32 95 32H148.5C150.157 32 151.5"
              stroke="#d1d5db"
            />
            <defs>
              <linearGradient
                id="paint0_linear"
                gradientUnits="userSpaceOnUse"
                x1="-100"
                y1="0"
                x2="-100"
                y2="0"
              >
                <stop stopColor="#2EB9DF" stopOpacity="0" />
                <stop stopColor="#2EB9DF" />
                <stop offset="1" stopColor="#9E00FF" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="text-center mt-auto py-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          Instant Meetings
        </h3>
        <p className="text-gray-400 font-medium text-[10px] max-w-[15rem]">
          Start a call instantly — no sign-up or setup required. Just create a
          room and share the link.
        </p>
      </div>
    </div>
  );
};

export default InstantMeetings;
