import React from "react";
import InstantMettings from "./InstantMettings";
import VideoAndAudio from "./VideoAndAudio";
import Security from "./Security";
import MessgaesFlow from "./MessgaesFlow";

const FeaturesBoxes = () => {
  return (
    <div className="grid lg:grid-cols-2 grid-cols-1 gap-x-8 gap-y-4 py-20 min-h-screen">
      <div className="relative h-80 w-[26rem] rounded-2xl p-1  shadow-[2px_-2px_4px_rgba(107,114,128,0.2),-2px_2px_4px_rgba(107,114,128,0.1)]">
        <div className="flex-1 bg-white  border border-neutral-200 h-full rounded-xl">
          <InstantMettings/>
        </div>
      </div>
      <div className="relative h-80 w-[26rem] rounded-2xl p-1  shadow-[2px_-2px_4px_rgba(107,114,128,0.2),-2px_2px_4px_rgba(107,114,128,0.1)]">
        <div className="flex-1 bg-white border border-neutral-200 h-full rounded-xl">
          <VideoAndAudio/>
        </div>
      </div>
      <div className="relative h-80 w-[26rem] rounded-2xl p-1  shadow-[2px_-2px_4px_rgba(107,114,128,0.2),-2px_2px_4px_rgba(107,114,128,0.1)]">
        <div className="flex-1 bg-white  border border-neutral-200 h-full rounded-xl">
          <Security/>
        </div>
      </div>
      <div className="relative h-80 w-[26rem] rounded-2xl p-1  shadow-[2px_-2px_4px_rgba(107,114,128,0.2),-2px_2px_4px_rgba(107,114,128,0.1)]">
        <div className="flex-1 bg-white  border border-neutral-200 h-full rounded-xl">
          <MessgaesFlow/>
        </div>
      </div>
      
      
    </div>
  );
};

export default FeaturesBoxes;
