import { extractYouTubeID } from "@/lib/utils";
import { getSummaryById } from "@/data/loaders";
import YouTubePlayerClient from "@/components/custom/YouTubePlayerClient";

interface LayoutProps {
  params: Promise<{ videoId: string }>;
  children: React.ReactNode;
}

export default async function SummarySingleLayout({
  params,
  children,
}: LayoutProps) {
  try {
    const awaitedParams = await params;
    const data = await getSummaryById(awaitedParams.videoId);

    if (data?.error?.status === 404) {
      return (
        <div className="p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">No Items Found</p>
          </div>
        </div>
      );
    }

    if (!data) {
      return (
        <div className="p-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-600">No data available</p>
          </div>
        </div>
      );
    }

    if (!data.videoId) {
      return (
        <div className="p-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-600">Video ID not found in data</p>
          </div>
          {children}
        </div>
      );
    }

    const youtubeVideoId = extractYouTubeID(data.videoId);

    return (
      <div>
        <div className="h-full grid gap-4 grid-cols-5 p-4">
          <div className="col-span-3">{children}</div>
          <div className="col-span-2">
            <div className="sticky top-4">
              <YouTubePlayerClient videoId={youtubeVideoId} />
              {/* Убрал отладочный блок с надписью */}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in layout:", error);
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">Error loading summary data</p>
          <p className="text-sm text-red-500 mt-2">Please try again later</p>
        </div>
      </div>
    );
  }
}
