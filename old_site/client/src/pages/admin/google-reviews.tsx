import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, ImageIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

interface ReviewImage {
  id: number;
  imageUrl: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function GoogleReviews() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const { data: reviewImagesData, isLoading } = useQuery<{ reviewImages: ReviewImage[] }>({
    queryKey: ["/api/review-images"],
  });

  const uploadImage = async (file: File): Promise<string> => {
    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    const response = await fetch("/api/upload/review-image", {
      method: "POST",
      body: uploadFormData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao fazer upload da imagem");
    }

    const data = await response.json();
    return data.filePath;
  };

  const createReviewImageMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      const response = await fetch("/api/review-images", {
        method: "POST",
        body: JSON.stringify({
          imageUrl,
          active: true,
          order: 0
        }),
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
      queryClient.invalidateQueries({ queryKey: ["/api/review-images"] });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setSelectedFiles(files);

    // Create preview URLs
    const urls: string[] = [];
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      urls.push(url);
    });
    setPreviewUrls(urls);
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhuma imagem selecionada",
        description: "Por favor, selecione pelo menos uma imagem para enviar.",
      });
      return;
    }

    setIsUploading(true);

    try {
      const files = Array.from(selectedFiles);

      for (const file of files) {
        const imageUrl = await uploadImage(file);
        await createReviewImageMutation.mutateAsync(imageUrl);
      }

      toast({
        title: "Imagens enviadas com sucesso!",
        description: `${files.length} imagem(ns) adicionada(s).`,
      });

      // Clear selection
      setSelectedFiles(null);
      setPreviewUrls([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar imagens",
        description: error.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const response = await fetch(`/api/review-images/${id}`, {
        method: "PUT",
        body: JSON.stringify({ active }),
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
      queryClient.invalidateQueries({ queryKey: ["/api/review-images"] });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/review-images/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/review-images"] });
      toast({
        title: "Imagem removida com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao remover imagem",
        description: error.message,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Carregando imagens...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-brand-blue mb-2">Avaliações dos Clientes</h2>
        <p className="text-gray-600">Gerencie as imagens de avaliações dos clientes</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Enviar Imagens
        </h3>

        <div className="space-y-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-opacity-90 cursor-pointer"
            />
            <p className="text-sm text-gray-500 mt-2">
              Selecione uma ou mais imagens (JPG, PNG, GIF). Máximo 5MB por imagem.
            </p>
          </div>

          {previewUrls.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Preview ({previewUrls.length} imagens selecionadas):</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!selectedFiles || isUploading}
            className="bg-brand-blue hover:bg-opacity-90"
          >
            {isUploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-pulse" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Enviar Imagens
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Images List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Imagens Cadastradas
        </h3>

        {reviewImagesData?.reviewImages && reviewImagesData.reviewImages.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagem</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="text-center">Ativa</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviewImagesData.reviewImages.map((image) => (
                <TableRow key={image.id}>
                  <TableCell>
                    <div className="w-20 h-20 rounded-lg overflow-hidden border">
                      <img
                        src={image.imageUrl}
                        alt="Review"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{image.imageUrl}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={image.active}
                      onCheckedChange={(checked) =>
                        toggleActiveMutation.mutate({ id: image.id, active: checked })
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("Deseja realmente remover esta imagem?")) {
                          deleteImageMutation.mutate(image.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma imagem cadastrada ainda.</p>
            <p className="text-sm">Envie suas primeiras imagens de avaliações acima.</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-brand-blue mb-2">Como usar?</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Clique em "Escolher arquivos" e selecione uma ou mais imagens de avaliações</li>
          <li>Visualize o preview das imagens selecionadas</li>
          <li>Clique em "Enviar Imagens" para adicionar ao site</li>
          <li>Use o switch "Ativa" para mostrar/ocultar imagens na página inicial</li>
          <li>As imagens ativas aparecerão automaticamente na seção de avaliações do site</li>
        </ol>
      </div>
    </div>
  );
}
