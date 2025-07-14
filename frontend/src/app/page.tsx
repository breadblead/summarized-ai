import qs from "qs";
import { HeroSection } from "@/components/custom/HeroSection";
import { flattenAttributes } from "@/lib/utils";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

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
  const baseUrl = STRAPI_URL;

  const url = new URL(path, baseUrl);
  url.search = homePageQuery;

  try {
    const response = await fetch(url.href, { cache: "no-store" });
    const data = await response.json();

    const flattenedData = flattenAttributes(data);

    return flattenedData;
  } catch (error) {
    console.error(error);
  }
}
export default async function Home() {
  const strapiData = await getStrapiData("/api/home-page");

  const { title, description, blocks } = strapiData;

  return (
    <main>
      <HeroSection data={blocks[0]} />
    </main>
  );
}
