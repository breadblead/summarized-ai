import { extractYouTubeID } from "@/lib/utils";
import { getSummaryById } from "@/data/loaders";

interface ParamsProps {
  params: Promise<{ videoId: string }>;
}

export default async function SummaryCardRoute({
  params,
}: Readonly<ParamsProps>) {
  try {
    const awaitedParams = await params;
    const data = await getSummaryById(awaitedParams.videoId);

    if (data?.error?.status === 404) return <p>No Items Found</p>;
    if (!data) return <p>No data available</p>;

    if (!data.videoId) {
      return <p>Video ID not available</p>;
    }

    const videoId = extractYouTubeID(data.videoId);

    if (!videoId) {
      return (
        <div>
          <p>Invalid video ID format</p>
          <p className="text-sm text-gray-500">ID: {data.videoId}</p>
        </div>
      );
    }

    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">
          Summary for video: {videoId}
        </h1>

        {/* Отображаем summary content */}
        {data.summaryContent ? (
          <div className="prose max-w-none bg-white p-6 rounded-lg shadow-md">
            <div
              dangerouslySetInnerHTML={{
                __html: data.summaryContent.replace(/\n/g, "<br/>"),
              }}
            />
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-600">No summary content available</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error in page:", error);
    return <p>Error loading summary</p>;
  }
}
