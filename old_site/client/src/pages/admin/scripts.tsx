import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface Scripts {
  id?: number;
  googleTagManager?: string;
  facebookPixel?: string;
  googleAnalytics?: string;
}

export default function Scripts() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    googleTagManager: "",
    facebookPixel: "",
    googleAnalytics: "",
  });

  const { data: scriptsData, isLoading } = useQuery<{ scripts: Scripts }>({
    queryKey: ["/api/scripts"],
  });

  useEffect(() => {
    if (scriptsData?.scripts) {
      setFormData({
        googleTagManager: scriptsData.scripts.googleTagManager || "",
        facebookPixel: scriptsData.scripts.facebookPixel || "",
        googleAnalytics: scriptsData.scripts.googleAnalytics || "",
      });
    }
  }, [scriptsData]);

  const updateScriptsMutation = useMutation({
    mutationFn: async (scripts: Partial<Scripts>) => {
      const response = await fetch("/api/scripts", {
        method: "PUT",
        body: JSON.stringify(scripts),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      toast({
        title: "Scripts salvos com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao salvar scripts",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateScriptsMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Carregando scripts...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Scripts de Rastreamento</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div>
          <label className="block text-sm font-medium mb-2">
            Google Tag Manager
          </label>
          <textarea
            value={formData.googleTagManager}
            onChange={(e) => setFormData({ ...formData, googleTagManager: e.target.value })}
            placeholder="Cole aqui o código do Google Tag Manager (GTM)"
            className="w-full h-32 p-3 border rounded-md font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Exemplo: &lt;script&gt;(function(w,d,s,l,i)&#123;...&#125;)(window,document,'script','dataLayer','GTM-XXXXXX');&lt;/script&gt;
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Facebook Pixel
          </label>
          <textarea
            value={formData.facebookPixel}
            onChange={(e) => setFormData({ ...formData, facebookPixel: e.target.value })}
            placeholder="Cole aqui o código do Facebook Pixel"
            className="w-full h-32 p-3 border rounded-md font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Exemplo: &lt;script&gt;!function(f,b,e,v,n,t,s)&#123;...&#125;(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');&lt;/script&gt;
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Google Analytics
          </label>
          <textarea
            value={formData.googleAnalytics}
            onChange={(e) => setFormData({ ...formData, googleAnalytics: e.target.value })}
            placeholder="Cole aqui o código do Google Analytics (GA4)"
            className="w-full h-32 p-3 border rounded-md font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Exemplo: &lt;script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"&gt;&lt;/script&gt;
          </p>
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={updateScriptsMutation.isPending}
          >
            {updateScriptsMutation.isPending ? "Salvando..." : "Salvar Scripts"}
          </Button>
        </div>
      </form>
    </div>
  );
}
