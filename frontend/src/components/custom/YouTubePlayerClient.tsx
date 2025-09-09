"use client";

import dynamic from "next/dynamic";

const YouTubePlayer = dynamic(() => import("./YouTubePlayer"), {
  ssr: false,
  loading: () => (
    <div className="relative aspect-video rounded-md overflow-hidden bg-gray-200 flex items-center justify-center">
      <div className="animate-pulse text-gray-600">Loading video...</div>
    </div>
  ),
});

interface YouTubePlayerClientProps {
  videoId: string | null;
}

export default function YouTubePlayerClient({
  videoId,
}: YouTubePlayerClientProps) {
  return <YouTubePlayer videoId={videoId} />;
}
