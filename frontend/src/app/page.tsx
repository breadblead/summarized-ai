import { getHomePageData } from "@/data/loaders";
import { HeroSection } from "@/components/custom/HeroSection";
import { FeatureSection } from "@/components/custom/FeaturesSection";

export default async function Home() {
  const strapiData = await getHomePageData();

  const blocks = (strapiData?.blocks ??
    strapiData?.data?.blocks ??
    []) as unknown as Array<any>;

  return <main>{Array.isArray(blocks) ? blocks.map(renderBlock) : null}</main>;
}

const blockComponents = {
  "layout.hero-section": HeroSection,
  "layout.features-section": FeatureSection,
} as const;

function renderBlock(block: any, index: number) {
  const type = block.__component ?? block.component;
  const Component = blockComponents[type as keyof typeof blockComponents];

  if (!Component) return null;

  const key = block.id ?? `${type}-${index}`;

  return <Component key={key} data={block} />;
}
