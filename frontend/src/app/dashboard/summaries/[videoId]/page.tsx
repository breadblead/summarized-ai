import { getSummaryById } from "@/data/loaders";
import { extractYouTubeID } from "@/lib/utils";
import { SummaryCardForm } from "@/components/forms/SummaryCardForm";

interface ParamsProps {
  params: Promise<{ videoId: string }>;
}

export default async function SummaryCardRoute({
  params,
}: Readonly<ParamsProps>) {
  try {
    const awaitedParams = await params;
    const data = await getSummaryById(awaitedParams.videoId);

    console.log("DATA FROM API:", data);
    console.log("Summary field:", data?.summary);

    if (data?.error?.status === 404) return <p>No Items Found</p>;
    if (!data) return <p>No data available</p>;

    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Video Summary</h1>

        {/* ✅ ДОБАВЬ ЭТУ СТРОЧКУ - форма редактирования */}
        <SummaryCardForm item={data} />
      </div>
    );
  } catch (error) {
    console.error("Error in page:", error);
    return <p>Error loading summary</p>;
  }
}
