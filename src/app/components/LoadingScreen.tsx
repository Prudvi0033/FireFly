import { Poppins } from 'next/font/google';
import React from 'react'

const pop = Poppins({subsets: ['latin'], weight: ['400']})

const LoadingScreen = ({ error }: { error: string | null }) => {
  return (
    <div
      className={`min-h-screen w-full ${pop.className} flex bg-gray-100 relative overflow-hidden p-4 sm:p-6`}
    >
      {/* Main Content Area - mimics the video call layout */}
      <div className="w-7/10 flex flex-col gap-4">
        {/* Video Area with Skeleton */}
        <div className="flex gap-4 items-start flex-1 min-h-0">
          {/* Main Video Skeleton */}
          <div className="flex-shrink-0 h-full w-[50rem]">
            <div className="relative w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl shadow-[8px_8px_24px_#d0d0d0,-8px_-8px_24px_#ffffff] border-4 border-white overflow-hidden">
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              
              {/* Centered loading content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10">
                {/* Rocket launching animation */}
                <div className="relative animate-bounce" style={{ animationDuration: '1.5s' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="100px" height="100px" viewBox="0 0 18 18" className="drop-shadow-2xl">
                    <path d="M15 2.5C15.552 2.5 16 2.052 16 1.5C16 0.948 15.552 0.5 15 0.5C14.448 0.5 14 0.948 14 1.5C14 2.052 14.448 2.5 15 2.5Z" fill="rgba(16, 185, 129, 1)"></path>
                    <path d="M3.86902 1.894L2.92202 1.579L2.60701 0.632004C2.50401 0.326004 1.99802 0.326004 1.89502 0.632004L1.58002 1.579L0.633011 1.894C0.480011 1.945 0.377014 2.088 0.377014 2.25C0.377014 2.412 0.481011 2.555 0.633011 2.606L1.58002 2.921L1.89502 3.868C1.94602 4.021 2.08903 4.124 2.25103 4.124C2.41303 4.124 2.55601 4.02 2.60701 3.868L2.92202 2.921L3.86902 2.606C4.02202 2.555 4.12502 2.412 4.12502 2.25C4.12502 2.088 4.02102 1.945 3.86902 1.894Z" fill="rgba(52, 211, 153, 1)"></path>
                    <path d="M12.7621 8.58512L11.7282 6.76359C11.0525 5.85816 6.48208 6.58629 6.25284 7.67221L6.01717 9.67778C4.98801 9.69517 4.06511 9.62629 3.32668 9.46811C2.85674 9.36745 2.41799 9.22169 2.06778 9.00804C1.72108 8.79652 1.36838 8.45766 1.28173 7.95037C1.16915 7.29113 1.56556 6.75626 1.94 6.40795C2.34149 6.03447 2.90611 5.69267 3.55565 5.38728C4.86465 4.77182 6.68219 4.22874 8.70277 3.8837C10.7233 3.53867 12.6181 3.44774 14.0573 3.59383C14.7714 3.66633 15.4175 3.80134 15.9202 4.02035C16.3891 4.22463 16.9407 4.59773 17.0533 5.257C17.1448 5.79378 16.8938 6.2501 16.6151 6.57154C16.3306 6.89964 15.9303 7.19365 15.4789 7.45521C14.7685 7.86677 13.8345 8.25292 12.7621 8.58512Z" fill="rgba(110, 231, 183, 0.4)"></path>
                    <path d="M7.25188 6.88551C6.70546 7.10324 6.31574 7.37425 6.25284 7.67221L6.01717 9.67778L5.25513 16.1625C5.23014 16.3752 5.29726 16.5884 5.43958 16.7484C5.5819 16.9084 5.78585 17 6 17H16.25C16.517 17 16.7638 16.8581 16.8981 16.6274C17.0325 16.3967 17.034 16.112 16.9023 15.8798L11.7281 6.76344C11.5284 6.49602 10.9888 6.37115 10.3217 6.35594L7.25188 6.88551Z" fill="rgba(167, 243, 208, 0.3)"></path>
                    <path d="M5.23926 4.7279C6.26597 4.38997 7.44501 4.09847 8.70273 3.8837C9.72264 3.70954 10.7105 3.60012 11.6239 3.55325C11.0434 2.49356 9.91812 1.775 8.62501 1.775C6.89542 1.775 5.46574 3.06039 5.23926 4.7279Z" fill="rgba(16, 185, 129, 1)"></path>
                    <path d="M9.16588 8.30735C10.6934 8.07105 11.8646 7.43653 11.7802 6.89102C11.6958 6.34551 10.3876 6.09456 8.86012 6.33086C7.33261 6.56716 6.16139 7.20168 6.24578 7.74719C6.33016 8.2927 7.63837 8.54365 9.16588 8.30735Z" fill="rgba(16, 185, 129, 1)"></path>
                  </svg>
                </div>

                <div className="text-center">
                  <p className="text-gray-700 text-xl font-semibold mb-2">
                    Preparing Launch...
                  </p>
                  <p className="text-gray-500 text-sm">Connecting to mission control</p>
                  
                  {/* Loading dots */}
                  <div className="flex gap-2 justify-center mt-4">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Participant Skeletons */}
          <div className="flex flex-col gap-4 mt-4 flex-1">
            <div className="w-50 h-38 rounded-2xl border-4 border-gray-300/40 bg-gray-200 animate-pulse shadow-lg"></div>
            <div className="w-50 h-38 rounded-2xl border-4 border-gray-300/40 bg-gray-200 animate-pulse shadow-lg" style={{ animationDelay: '150ms' }}></div>
          </div>
        </div>

        {/* Control Bar Skeleton */}
        <div className="flex items-center ml-54 justify-start">
          <div className="flex gap-4 items-center bg-white px-8 py-6 rounded-full shadow-[8px_8px_24px_#e0e0e0,-8px_-8px_24px_#ffffff] border-4 border-gray-100">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-full bg-gray-200 animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Box Skeleton */}
      <div className="w-3/10 rounded-2xl overflow-hidden">
        <div className="h-full bg-white rounded-2xl p-4 shadow-lg">
          {/* Chat header skeleton */}
          <div className="h-12 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
          
          {/* Chat messages skeleton */}
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`h-16 bg-gray-200 rounded-lg animate-pulse`}
                style={{ 
                  animationDelay: `${i * 100}ms`,
                  width: i % 2 === 0 ? '80%' : '60%',
                  marginLeft: i % 2 === 0 ? 'auto' : '0'
                }}
              ></div>
            ))}
          </div>
          
        </div>
      </div>

      {error && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
            <p className="text-red-500 text-sm text-center">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoadingScreen