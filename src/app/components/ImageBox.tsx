import { AppWindow, ChevronLeft, ChevronRight} from "lucide-react";
import { Bellefair, Poppins } from "next/font/google";
import React from "react";
import VideoCallComponent from "./VideoCallComponent";

const bella = Poppins({subsets: ['latin'], weight: ['300']})
const ImageBox = () => {
  return (
    <div className="h-[34rem] rounded-l-2xl border-2 border-white bg-neutral-100 overflow-hidden">
      {/* Top Header (Macbook style) */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-300 bg-neutral-200/80 backdrop-blur-sm">
        {/* Mac-style buttons */}
        <div className="flex gap-2 items-center">
          <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] border border-neutral-400"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] border border-neutral-400"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f] border border-neutral-400"></div>
          <div><AppWindow size={18} className="text-neutral-600 mx-3" /></div>
          <div><ChevronLeft size={18} /></div>
          <div><ChevronRight size={18} /></div>
        </div>

        {/* App Name */}
        <div className="absolute left-3/5 transform  -translate-x-1/2">
          <span className={`text-[16px] ${bella.className} bg-neutral-400/15 border border-neutral-300 px-30 py-1 rounded-4xl font-semibold tracking-wide text-neutral-900 select-none`}>
            Fire Fly
          </span>
        </div>
      </div>

      {/* Content area (half box) */}
      <div className="flex items-center justify-center relative h-[calc(34rem-2.5rem)] bg-gradient-to-br from-neutral-100 to-neutral-200">
        <span className="text-neutral-500 text-sm font-medium">
          <VideoCallComponent/>
        </span>
      </div>
    </div>
  );
};

export default ImageBox;
