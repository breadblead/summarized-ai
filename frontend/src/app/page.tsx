async function getStrapiData(url: string) {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL!;
  try {
    const response = await fetch(baseUrl + url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

export default async function Home() {
  const strapiData = await getStrapiData("/api/home-page");
  const { title, description } = strapiData.data;
  return (
    <main className="container mx-auto py-6">
      <h1 className="text-5x1 font-bold">{title}</h1>
      <p className="text-xl mt-4">{description}</p>
    </main>
  );
}
