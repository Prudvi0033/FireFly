"use client";
import { ArrowUpRight } from "lucide-react";
import { Montserrat, Niconne } from "next/font/google";
import React, { useState } from "react";
import FloatingFeatureBoxes from "./FloatingFeaturesBoxes";
import CreateRoomModal from "./CreateRoomModal";
import FeaturesBoxes from "./FeaturesBoxes";

const monte = Montserrat({ subsets: ["latin"] });
const luga = Niconne({ subsets: ["latin"], weight: ["400"] });

const Home = () => {
  const [showRoomModal, setShowroomModal] = useState(false);
  return (
    <div className="relative">
      <FloatingFeatureBoxes />

      <div
        className={`min-h-screen flex  justify-center bg-neutral-50/70 rounded-md px-4 ${monte.className}`}
      >
        {/* Centered Content Box */}
        {showRoomModal && (
          <CreateRoomModal
            isActive={showRoomModal}
            onClose={() => setShowroomModal(false)} // close modal callback
          />
        )}
        <div className="max-w-[52rem] mt-18 w-full flex flex-col items-center justify-center text-center">
          <h1 className="text-[5.8rem] font-semibold text-neutral-900 leading-[1.1] mb-4">
            Watch together, <br />
            <span
              className={`text-neutral-600/60 ${luga.className} text-[7rem]`}
            >
              feel the{" "}
            </span>
            <span className="relative inline-block px-3 py-1 rotate-[1deg]">
              <span className="absolute text-[5rem] inset-0 bg-gradient-to-br from-emerald-200 via-emerald-300 to-emerald-400 rounded-xl shadow-[inset_0_2px_12px_rgba(0,0,0,0.15)] border border-emerald-300/50"></span>
              <span className={`relative z-10 text-emerald-700 font-semibold`}>
                moment
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-neutral-600 max-w-2xl mb-6 text-[16px]">
            Great moments deserve a{" "}
            <span className="font-semibold">system that does it all</span> —
            from
            <span className="font-semibold"> creating rooms</span> and{" "}
            <span className="font-semibold">smooth syncing</span>
            to helping you{" "}
            <span className="font-bold">connect and track watch sessions</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex mb-12 flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setShowroomModal(!showRoomModal)}
              className="inline-flex cursor-pointer items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-4xl border-2 border-neutral-300 font-medium
  shadow-[0_8px_18px_rgba(0,0,0,0.35),inset_2px_2px_6px_rgba(255,255,255,0.6),inset_-3px_-3px_8px_rgba(0,0,0,0.6)]
  active:scale-[0.97] active:shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_3px_3px_6px_rgba(255,255,255,0.12),inset_-3px_-3px_8px_rgba(0,0,0,0.6)]
  transition-all duration-300 ease-out"
            >
              <span>Create a Room</span>
              <ArrowUpRight size={20} className="text-white" />
            </button>
          </div>

        {/* video here */}
          <div
            className="relative w-full h-[30rem] p-2 flex items-center justify-center rounded-2xl 
  bg-white border-2 border-neutral-300/70
  shadow-[8px_8px_16px_rgba(0,0,0,0.12),-8px_-8px_16px_rgba(255,255,255,0.8)]
  backdrop-blur-md transition-all duration-300"
          >
            {/* Inner box */}
            <div
              className="w-full h-full rounded-2xl bg-white 
    border-2 border-neutral-200/70
    shadow-[inset_4px_4px_8px_rgba(0,0,0,0.08),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]
    backdrop-blur-sm transition-all duration-300"
            ></div>
          </div>
        </div>
      </div>

      <div className="min-h-screen flex items-center justify-center bg-neutral-50/70">
        <div className={`min-h-screen max-w-[52rem] flex items-center justify-center ${monte.className}`}>
        <FeaturesBoxes/>
      </div>
      </div>
    </div>
  );
};

export default Home;
