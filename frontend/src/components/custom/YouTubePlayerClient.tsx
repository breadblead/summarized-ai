"use client";

import dynamic from "next/dynamic";

const YouTubePlayer = dynamic(() => import("./YouTubePlayer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="animate-pulse text-gray-600">Loading the player...</div>
    </div>
  ),
});

interface YouTubePlayerClientProps {
  videoId: string;
}

export default function YouTubePlayerClient({
  videoId,
}: YouTubePlayerClientProps) {
  if (!videoId) {
    return (
      <div className="w-full h-96 bg-red-100 rounded-lg flex items-center justify-center">
        <p className="text-red-600">Error: Video ID not found</p>
      </div>
    );
  }

  return <YouTubePlayer videoId={videoId} />;
}
