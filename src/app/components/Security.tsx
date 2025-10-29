import React from "react";
import { FaLock } from "react-icons/fa6";
import { IoShield } from "react-icons/io5";

const Security = () => {
  return (
    <div className="flex relative overflow-hidden items-center justify-center h-full bg-white rounded-xl">
      <div className="flex absolute right-18 top-4 flex-col text-center max-w-sm z-20">
        <h1 className="text-xl font-semibold text-gray-800 mb-2">
          Privacy by Design
        </h1>
        <p className="text-gray-400 font-medium text-[10px] max-w-[16rem]">
          No data storage, no tracking — all chats and sessions vanish when the
          meeting ends.
        </p>
      </div>
      <div>
        <div className="relative">
          {/* Back shield (gray glow) */}
          <IoShield
            size={114}
            className="text-neutral-300/60 absolute -top-3 -right-2.5 z-5"
          />

          <IoShield
            size={92}
            className="text-emerald-500 drop-shadow-[0_4px_8px_rgba(16,185,129,0.4)] relative z-10"
          />

          <div className="h-10 w-10 flex items-center justify-center bg-white rounded-full absolute top-6 right-6.5 z-50">
            <FaLock className="text-gray-600" size={20} />
          </div>
        </div>
      </div>

      <div className="flex h-96 absolute top-42 w-[38rem] overflow-hidden bg-gradient-to-b from-gray-200 rounded-t-full p-8 justify-center items-end">
        <div className="relative w-full h-72 rounded-full flex items-center justify-center">
          {/* Outer Circle */}
          <div className="w-96 h-96 rounded-full border-2 border-gray-300/40 relative">
            {/* Red Dots */}
            <div className="absolute top-2 left-1/4 w-4 h-4 bg-red-500 rounded-full shadow-[0_0_8px_4px_rgba(239,68,68,0.3),_inset_4px_-4px_6px_rgba(1,1,1,0.1)] animate-ping-slow"></div>
          </div>

          {/* Middle Circle */}
          <div className="w-80 h-80 rounded-full border-2 border-gray-300/40 absolute">
            {/* Red Dots */}
            <div className="absolute top-2 right-1/4 w-4 h-4 bg-red-500 rounded-full shadow-[0_0_8px_4px_rgba(239,68,68,0.3),_inset_4px_-4px_6px_rgba(1,1,1,0.1)] animate-out"></div>
          </div>

          {/* Inner Circle */}
          <div className="w-60 h-60 rounded-full border-2 border-gray-300/40 absolute">
            {/* Red Dots */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_8px_4px_rgba(239,68,68,0.3),_inset_4px_-4px_6px_rgba(1,1,1,0.1)] animate-ping-slow"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
