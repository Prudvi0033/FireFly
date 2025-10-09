import React from "react";

const Home = () => {
  return (
    <div className="min-h-screen w-full relative">
      {/* Indigo Dream Flow Gradient with Top Shine Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            /* Base Indigo Flow */
            linear-gradient(135deg,
              #FFFFFF 0%,           /* Shine start */
              #E8EAF6 25%,          /* Soft lavender haze */
              #C5CAE9 40%,          /* Gentle indigo */
              #7986CB 60%,          /* Mid indigo */
              #5C6BC0 75%,          /* Deeper tone */
              #3F51B5 90%,          /* Rich indigo */
              #311B92 100%          /* Deep violet */
            ),
            /* Top White Glow Overlay */
            radial-gradient(circle at 50% -10%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 25%, transparent 70%)
          `,
          backgroundBlendMode: "screen",
        }}
      />
      {/* Your Content/Components */}
    </div>
  );
};

export default Home;
