"use client";
import { Poppins } from "next/font/google";
import React, { useState } from "react";
import ImageBox from "./ImageBox";
import CreateRoomModal from "./CreateRoomModal";

const pop = Poppins({ subsets: ["latin"], weight: ["500"] });
const pop2 = Poppins({ subsets: ["latin"], weight: ["400"] });
const pop3 = Poppins({ subsets: ["latin"], weight: ["600"] });

const Home = () => {
  const [showmodal, setShowmodal] = useState(false)

  return (
    <div className="w-full flex h-screen p-2.5 relative bg-white overflow-hidden">
      {/* Dark 3D background grid */}
      {showmodal && (
        <div className={`${pop3.className}`}>
          <CreateRoomModal
            isActive={showmodal}
            onClose={() => setShowmodal(false)} // close modal callback
          />
        </div>
      )}
      <div
        style={{
          backgroundImage: `
          linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px),
          linear-gradient(to right, rgba(0,0,0,0.07) 2px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)
  `,
          backgroundSize: "100px",
          backgroundBlendMode: "overlay",
          boxShadow:
            "inset 0 0 30px rgba(0,0,0,0.08), inset 0 0 15px rgba(255,255,255,0.25)",
        }}
        className="h-[100%] flex items-end justify-start w-full relative bg-neutral-300 rounded-3xl"
      >
        {/* Top and bottom blurred gradients */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-neutral-300/80 via-neutral-300/60 to-transparent backdrop-blur-[2px] rounded-t-2xl z-20" />
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-neutral-300/80 via-neutral-300/60 to-transparent backdrop-blur-[2px] rounded-b-2xl z-20" />

        {/* Left content */}
        <div className="flex flex-col relative pb-32 px-16 z-30">
          <div className="absolute -top-24 bg-white/50 shadow-[4px_4px_8px_rgba(0,0,0,0.04),-4px_-4px_8px_rgba(0,0,0,0.03)] px-0.5 py-2 left-16 rounded-2xl">
            <div className="px-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="52px"
                height="52px"
                viewBox="0 0 20 20"
              >
                <polygon
                  points="11 3 9 9 16 9 9 17 11 11 4 11 11 3"
                  stroke="#1c1f21"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  fill="#1c1f21"
                ></polygon>
              </svg>
            </div>
          </div>

          <h1
            className={`text-[4rem] pb-4 leading-[4rem] ${pop.className} font-extrabold`}
          >
            Connect Instantly. <br />
            No Strings Attached.
          </h1>

          <p className={`${pop2.className} text-sm`}>
            Create a room in seconds and invite anyone —{" "}
            <span className={`${pop3.className}`}>no signups</span>, no hassle.
            <br />
            Enjoy{" "}
            <span className={`${pop3.className}`}>
              real-time video calls, screen sharing, and chat
            </span>
            , all powered by lightning-fast Redis.
          </p>

          <div className={`mt-6 ${pop2.className} text-sm`}>
            <button
            onClick={() => setShowmodal(!showmodal)}
              className="inline-flex cursor-pointer items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-lg
    border border-neutral-800 font-medium
    shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_2px_2px_6px_rgba(255,255,255,0.25),inset_-3px_-3px_8px_rgba(0,0,0,0.8)]
    active:scale-[0.97] active:shadow-[0_2px_6px_rgba(0,0,0,0.5),inset_3px_3px_8px_rgba(255,255,255,0.15),inset_-3px_-3px_10px_rgba(0,0,0,0.85)]
    transition-all duration-300 ease-out"
            >
              <span>Create a Room</span>
            </button>
          </div>
        </div>    

        <div className="absolute right-0 h-[15rem] bottom-[23rem] w-[50%] z-20">
          <ImageBox />
          
        </div>    
      </div>
    </div>
  );
};

export default Home;
