import React, { useState } from "react";
import {
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  Upload,
  Phone,
} from "lucide-react";
import Image from "next/image";
import { HiOutlineVideoCamera, HiOutlineVideoCameraSlash } from "react-icons/hi2";

const VideoCallComponent = () => {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  return (
    <div className="w-full h-full flex flex-col z-10 items-center justify-center px-16 relative">
      {/* Grid of participants - stretched width */}
      <div className="w-[42rem] ml-20 relative -top-6 overflow-hidden h-[24rem] z-0 rounded-bl-2xl">
        <Image src="/image.png" alt="img" fill className="object-cover pointer-events-none select-none" />
        <div className=" absolute left-4 bottom-4 w-52 h-32 bg-white rounded-2xl shadow-[_inset_6px_6px_18px_rgba(0,0,0,0.2),_inset_-6px_-6px_18px_rgba(0,0,0,0.2),_8px_8px_24px_rgba(255,255,255,0.4)]">
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-300 to-emerald-600 shadow-[_inset_6px_6px_6px_rgba(255,255,255,0.5)] absolute top-6 left-16 rounded-full p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="52px"
              height="52px"
              viewBox="0 0 18 18"
            >
              <path
                d="M2.60518 13.1674C3.69058 10.7157 6.14168 9 8.99999 9C11.7634 9 14.1462 10.6037 15.2822 12.9257C15.3564 13.0774 15.4289 13.2326 15.4797 13.3894C15.8649 14.5805 15.1811 15.8552 13.9874 16.2313C12.705 16.6354 11.0072 17 8.99999 17C6.99283 17 5.29503 16.6354 4.01259 16.2313C2.74425 15.8317 2.05162 14.4186 2.60518 13.1674Z"
                fill="rgba(255, 255, 255, 1)"
              ></path>{" "}
              <path
                d="M9 7.50049C10.7952 7.50049 12.25 6.04543 12.25 4.25049C12.25 2.45554 10.7952 1.00049 9 1.00049C7.20482 1.00049 5.75 2.45554 5.75 4.25049C5.75 6.04543 7.20482 7.50049 9 7.50049Z"
                fill="rgba(255, 255, 255, 1)"
                data-color="color-2"
              ></path>
            </svg>

          </div>
            <div className="flex w-full items-start justify-end p-3">
                <div className="flex gap-2 h-4 w-12 opacity-75">
                    <MicOff size={20} className="bg-neutral-200 border border-neutral-300/80 p-1 rounded-full text-neutral-600" />
                    <VideoOff size={20} className="bg-neutral-200 p-1 rounded-full border border-neutral-300/80 text-neutral-600"/>
                </div>
            </div>
        </div>
      </div>

      {/* Control buttons - larger and more spaced */}
      <div className="flex items-center ml-32 justify-center gap-4 bg-white/30 px-6 py-2 rounded-full border-2 border-neutral-300/40">
        {/* Microphone button */}
        <button
          onClick={() => setIsMicOn(!isMicOn)}
          className="w-14 h-14 hover:scale-95 rounded-full bg-white/25 backdrop-blur-xl shadow-xl flex items-center justify-center transition-all duration-300 border border-white/40 hover:bg-white/35"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 2px 0 rgba(255, 255, 255, 0.4)",
          }}
        >
          {isMicOn ? (
            <Mic size={22} className="text-gray-800" />
          ) : (
            <MicOff size={22} className="text-gray-800" />
          )}
        </button>

        {/* Video button with green indicator */}
        <button
          onClick={() => setIsVideoOn(!isVideoOn)}
          className="relative w-14 h-14 rounded-full hover:scale-95 bg-white/25 backdrop-blur-xl shadow-xl flex items-center justify-center transition-all duration-300 border border-white/40 hover:bg-white/35"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 2px 0 rgba(255, 255, 255, 0.4)",
          }}
        >
          {isVideoOn ? (
            <HiOutlineVideoCamera size={22} className="text-gray-800" />
          ) : (
            <HiOutlineVideoCameraSlash size={22} className="text-gray-800" />
          )}
        </button>

        {/* Screen share button (wider) */}
        <button
          className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-xl shadow-xl flex items-center justify-center gap-2 hover:scale-95 transition-all duration-300 border border-white/40 hover:bg-white/35"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 2px 0 rgba(255, 255, 255, 0.4)",
          }}
        >
          <Monitor size={22} className="text-gray-800" />
        </button>

        {/* Upload button */}
        <button
          className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-xl shadow-xl flex items-center justify-center hover:scale-95 transition-all duration-300 border border-white/40 hover:bg-white/35"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 2px 0 rgba(255, 255, 255, 0.4)",
          }}
        >
          <Upload size={22} className="text-gray-800" />
        </button>

        {/* End call button (red) */}
        <button
          className="w-14 h-14 rounded-full bg-red-500/90 backdrop-blur-xl shadow-xl flex items-center justify-center hover:scale-110 transition-all duration-300 hover:bg-red-600/90 border border-red-400/30"
          style={{
            boxShadow: "0 8px 32px 0 rgba(239, 68, 68, 0.3)",
          }}
        >
          <Phone size={22} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default VideoCallComponent;
