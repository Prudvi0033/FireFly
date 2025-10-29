'use client'
import Image from "next/image";
import React from "react";
import { HiVideoCamera } from "react-icons/hi2";
import { BiSolidMicrophone } from "react-icons/bi";

const VideoAndAudio = () => {
  return (
    <div className="flex items-end justify-end h-full bg-white rounded-xl">
        <div className="relative -translate-y-1/2 text-left">
          <div className=" absolute -left-20 -top-72 w-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Video & Audio</h2>
          <p className="text-gray-400 font-medium text-[10px] max-w-[16rem]">Connect with multiple users in real time through smooth video and lag-free audio for a natural, high-quality calling experience.</p>
          </div>
        </div>
      <div className="flex relative justify-center items-center gap-8 bg-gradient-to-b from-gray-300 rounded-tl-4xl rounded-l-4xl p-8">
        
        <div className="absolute -top-7 h-14 w-14 rounded-full bg-white flex items-center justify-center left-8 shadow-[inset_2px_-3px_12px_rgba(0,0,0,0.2),_-4px_4px_6px_rgba(0,0,0,0.2)] border border-neutral-300">
                <HiVideoCamera size={28} className="text-emerald-400" />
        </div>
        <div className="absolute -top-4 h-10 w-10 rounded-full bg-white flex items-center justify-center right-8 shadow-[inset_2px_-3px_12px_rgba(0,0,0,0.2),_-4px_4px_6px_rgba(0,0,0,0.2)] border border-neutral-300">
                <BiSolidMicrophone size={18} className="text-emerald-400" />
        </div>

        {/* Image 1 - Top Right */}
        <div className="w-12 h-12 rounded-full overflow-hidden border-4 border-neutral-100 shadow-[_4px_4px_6px_rgba(0,0,0,0.2)]">
          <Image src="/banner1.png" width={300} height={300} alt="Person 1" className="w-full h-full object-cover" />
        </div>

        {/* Image 2 - Bottom Left */}
        <div className="w-18 h-18 rounded-full overflow-hidden border-4 border-emerald-50 shadow-[_4px_4px_8px_rgba(0,0,0,0.2)]">
          <Image src="/banner2.png" width={300} height={300} alt="Person 2" className="w-full h-full object-cover" />
        </div>

        {/* Image 3 - Bottom Right */}
        <div className="w-12 h-12 rounded-full overflow-hidden border-4 border-neutral-100 shadow-[_4px_4px_8px_rgba(0,0,0,0.2)]">
          <Image src="/banner3.png" width={300} height={300} alt="Person 3" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
};

export default VideoAndAudio;