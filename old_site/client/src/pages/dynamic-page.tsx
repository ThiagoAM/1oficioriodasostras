import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import NotFound from "@/pages/not-found";

interface Page {
  id: number;
  name: string;
  slug: string;
  content: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DynamicPage() {
  const [, params] = useRoute("/:slug");
  const slug = params?.slug;

  const { data, isLoading, error } = useQuery<{ page: Page }>({
    queryKey: [`/api/pages/${slug}`],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Carregando...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !data?.page || !data.page.active) {
    return <NotFound />;
  }

  const page = data.page;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-brand-light-gray py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-serif font-bold text-brand-blue mb-6">
              {page.name}
            </h1>
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
