"use client";

interface YouTubePlayerProps {
  videoId: string | null;
}

export default function YouTubePlayer({
  videoId,
}: Readonly<YouTubePlayerProps>) {
  if (!videoId) {
    return (
      <div className="relative aspect-video rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Video ID not provided</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video rounded-md overflow-hidden bg-black shadow-lg">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full"
        frameBorder="0"
        loading="lazy"
      />
    </div>
  );
}
