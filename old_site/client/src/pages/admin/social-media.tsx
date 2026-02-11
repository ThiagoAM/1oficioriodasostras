import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface SocialMedia {
  id?: number;
  youtube?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
}

export default function SocialMedia() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    youtube: "",
    instagram: "",
    facebook: "",
    tiktok: "",
  });

  const { data: socialMediaData, isLoading } = useQuery<{ socialMedia: SocialMedia }>({
    queryKey: ["/api/social-media"],
  });

  useEffect(() => {
    if (socialMediaData?.socialMedia) {
      setFormData({
        youtube: socialMediaData.socialMedia.youtube || "",
        instagram: socialMediaData.socialMedia.instagram || "",
        facebook: socialMediaData.socialMedia.facebook || "",
        tiktok: socialMediaData.socialMedia.tiktok || "",
      });
    }
  }, [socialMediaData]);

  const updateSocialMediaMutation = useMutation({
    mutationFn: async (socialMedia: Partial<SocialMedia>) => {
      const response = await fetch("/api/social-media", {
        method: "PUT",
        body: JSON.stringify(socialMedia),
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
      queryClient.invalidateQueries({ queryKey: ["/api/social-media"] });
      toast({
        title: "Redes sociais salvas com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao salvar redes sociais",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSocialMediaMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Carregando redes sociais...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-serif font-bold text-brand-blue mb-6">
          Redes Sociais
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            YouTube
          </label>
          <input
            type="url"
            value={formData.youtube}
            onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
            placeholder="https://www.youtube.com/@seucanal"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instagram
          </label>
          <input
            type="url"
            value={formData.instagram}
            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
            placeholder="https://www.instagram.com/seuperfil"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Facebook
          </label>
          <input
            type="url"
            value={formData.facebook}
            onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
            placeholder="https://www.facebook.com/suapagina"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            TikTok
          </label>
          <input
            type="url"
            value={formData.tiktok}
            onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
            placeholder="https://www.tiktok.com/@seuperfil"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={updateSocialMediaMutation.isPending}
            className="bg-brand-blue hover:bg-opacity-90"
          >
            {updateSocialMediaMutation.isPending ? "Salvando..." : "Salvar Redes Sociais"}
          </Button>
        </div>
      </form>
    </div>
  );
}
