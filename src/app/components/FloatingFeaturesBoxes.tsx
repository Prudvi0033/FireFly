"use client";
import Image from "next/image";
import React from "react";

const FloatingFeatureBoxes = () => {
  const features = [
    {
      ref: "/stream.svg",
      position: "right-180 z-50 bottom-8 -rotate-[30deg]",
      delay: "0.2s",
    },
    {
      ref: "/socket.svg",
      position: "right-40 top-2 z-50 rotate-[15deg]",
      delay: "0.6s",
    },
  ];

  return (
    <>
      {features.map((feature, index) => {
        const ref = feature.ref;
        return (
          <div
            key={index}
            className={`absolute ${feature.position} hidden lg:block`}
          >
            {/* Outer glass-like floating card */}
            <div
              className="relative backdrop-blur-xl bg-white/25 p-1 rounded-2xl border/40
      shadow-[0_10px_25px_rgba(0,0,0,0.15),0_4px_4px_rgba(0,0,0,0.1),inset_1px_1px_3px_rgba(255,255,255,0.4)] 
      before:absolute before:inset-0 before:rounded-2xl before:border-t-[1.5px] before:border-l-[1.5px] before:border-white/60 
      after:absolute after:inset-0 after:rounded-2xl after:border-b-[1.5px] after:border-r-[1.5px] after:border-black/20 
      transition-all duration-500 ease-out scale-[1]"
              style={{
                animationDelay: feature.delay,
              }}
            >
              {/* Inner 3D inset box */}
              <div
                className="relative rounded-xl bg-white/30 p-2.5
        shadow-[inset_2px_2px_6px_rgba(0,0,0,0.1),inset_-2px_-2px_6px_rgba(255,255,255,0.5)]
        before:absolute before:inset-0 before:rounded-xl before:border-t before:border-l before:border-white/50
        after:absolute after:inset-0 after:rounded-xl after:border-b after:border-r after:border-black/20"
              >
                <Image src={ref} alt="ref" width={45} height={45} />
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default FloatingFeatureBoxes;
