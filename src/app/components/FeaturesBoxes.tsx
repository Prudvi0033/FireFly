import React from "react";
import InstantMettings from "./InstantMettings";

const FeaturesBoxes = () => {
  return (
    <div className="grid grid-cols-2 gap-8 py-20 min-h-screen">
      <div className="relative h-80 w-[26rem] rounded-2xl border-4 border-neutral-300/20 p-1  shadow-[2px_-2px_4px_rgba(107,114,128,0.2),-2px_2px_4px_rgba(107,114,128,0.1)]">
        <div className="flex-1 bg-white  border border-neutral-200 h-full rounded-xl">
          <InstantMettings/>
        </div>
      </div>
      <div className="relative h-96 w-[26rem] rounded-2xl border-4 border-neutral-300/20 p-1  shadow-[2px_-2px_4px_rgba(107,114,128,0.2),-2px_2px_4px_rgba(107,114,128,0.1)]">
        <div className="flex-1 bg-white  border border-neutral-200 h-full rounded-xl"></div>
      </div>
      
    </div>
  );
};

export default FeaturesBoxes;
