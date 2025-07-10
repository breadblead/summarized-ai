import qs from "qs";
import { HeroSection } from "@/components/custom/HeroSection";
import { flattenAttributes } from "@/lib/utils";

const homePageQuery = qs.stringify(
  {
    populate: {
      blocks: {
        on: {
          "layout.hero-section": {
            populate: {
              image: {
                fields: ["url", "alternativeText"],
              },
              link: {
                populate: true,
              },
            },
          },
        },
      },
    },
  },
  { encodeValuesOnly: true }
);

async function getStrapiData(path: string) {
  const baseUrl = "http://localhost:1337";

  const url = new URL(path, baseUrl);
  url.search = homePageQuery;

  console.log(url.href);

  try {
    const response = await fetch(url.href, { cache: "no-store" });
    const data = await response.json();
    console.dir(data, { depth: null });
    const flattenedData = flattenAttributes(data);
    console.dir(flattenedData, { depth: null });
    return flattenedData;
  } catch (error) {
    console.error(error);
  }
}
// reply comment
export default async function Home() {
  const strapiData = await getStrapiData("/api/home-page");

  const { title, description, blocks } = strapiData;

  return (
    <main>
      <HeroSection data={blocks[0]} />
    </main>
  );
}
