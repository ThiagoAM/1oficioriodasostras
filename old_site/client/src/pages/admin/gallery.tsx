import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GalleryItem {
  id: number;
  title: string;
  type: string;
  mediaUrl: string;
  description: string | null;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function Gallery() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "image",
    mediaUrl: "",
    description: "",
    active: true,
    order: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const { data: galleryData, isLoading } = useQuery<{ gallery: GalleryItem[] }>({
    queryKey: ["/api/gallery"],
  });

  const uploadImage = async (file: File): Promise<string> => {
    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    const response = await fetch("/api/upload/gallery", {
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

  const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const formatYouTubeUrl = (url: string): string => {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const createGalleryMutation = useMutation({
    mutationFn: async (itemData: typeof formData) => {
      let mediaUrl = itemData.mediaUrl;

      if (itemData.type === "image" && selectedFile) {
        setIsUploading(true);
        try {
          mediaUrl = await uploadImage(selectedFile);
        } finally {
          setIsUploading(false);
        }
      } else if (itemData.type === "video") {
        mediaUrl = formatYouTubeUrl(mediaUrl);
      }

      const response = await fetch("/api/gallery", {
        method: "POST",
        body: JSON.stringify({ ...itemData, mediaUrl }),
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
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Item da galeria criado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar item",
        description: error.message,
      });
    },
  });

  const updateGalleryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      let mediaUrl = data.mediaUrl;

      if (data.type === "image" && selectedFile) {
        setIsUploading(true);
        try {
          mediaUrl = await uploadImage(selectedFile);
        } finally {
          setIsUploading(false);
        }
      } else if (data.type === "video" && !mediaUrl.includes("embed")) {
        mediaUrl = formatYouTubeUrl(mediaUrl);
      }

      const response = await fetch(`/api/gallery/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ...data, mediaUrl }),
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
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      resetForm();
      toast({
        title: "Item da galeria atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar item",
        description: error.message,
      });
    },
  });

  const deleteGalleryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/gallery/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({
        title: "Item da galeria deletado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao deletar item",
        description: error.message,
      });
    },
  });

  const toggleItemStatus = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const response = await fetch(`/api/gallery/${id}/toggle`, {
        method: "PATCH",
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
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({
        title: "Status do item atualizado!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      type: "image",
      mediaUrl: "",
      description: "",
      active: true,
      order: 0,
    });
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.type === "image" && !selectedFile && !formData.mediaUrl && !editingItem) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione uma imagem",
      });
      return;
    }

    if (formData.type === "video" && !formData.mediaUrl) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, insira a URL do vídeo do YouTube",
      });
      return;
    }

    if (editingItem) {
      updateGalleryMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createGalleryMutation.mutate(formData);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      type: item.type,
      mediaUrl: item.mediaUrl,
      description: item.description || "",
      active: item.active,
      order: item.order,
    });
    if (item.type === "image") {
      setPreviewUrl(item.mediaUrl);
    }
    setIsDialogOpen(true);
  };

  const handleDelete = (item: GalleryItem) => {
    if (confirm(`Tem certeza que deseja deletar "${item.title}"?`)) {
      deleteGalleryMutation.mutate(item.id);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Arquivo inválido",
          description: "Por favor, selecione apenas arquivos de imagem",
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTypeChange = (newType: string) => {
    setFormData({ ...formData, type: newType, mediaUrl: "" });
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
    return "";
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-blue">
            Gerenciar Galeria
          </h1>
          <p className="text-gray-600 mt-1">
            Total de itens: {galleryData?.gallery.length || 0} |
            Ativos: {galleryData?.gallery.filter(item => item.active).length || 0} |
            Imagens: {galleryData?.gallery.filter(item => item.type === 'image').length || 0} |
            Vídeos: {galleryData?.gallery.filter(item => item.type === 'video').length || 0}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingItem(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button
              className="bg-brand-blue hover:bg-opacity-90"
              data-testid="button-new-gallery-item"
            >
              + Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Editar Item da Galeria" : "Novo Item da Galeria"}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Atualize as informações do item abaixo."
                  : "Adicione uma nova imagem ou vídeo à galeria."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-gallery">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Mídia *
                </label>
                <Select
                  value={formData.type}
                  onValueChange={handleTypeChange}
                  disabled={!!editingItem}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Imagem</SelectItem>
                    <SelectItem value="video">Vídeo do YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                  required
                  data-testid="input-gallery-title"
                />
              </div>

              {formData.type === "image" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagem *
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                    data-testid="input-gallery-image"
                  />
                  {previewUrl && (
                    <div className="mt-2">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL do YouTube *
                  </label>
                  <input
                    type="url"
                    value={formData.mediaUrl}
                    onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                    required={formData.type === "video"}
                    data-testid="input-gallery-youtube"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Suporta links do YouTube: youtube.com/watch?v=... ou youtu.be/...
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                  rows={3}
                  data-testid="input-gallery-description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordem de Exibição
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                  min="0"
                  data-testid="input-gallery-order"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-brand-blue focus:ring-brand-gold border-gray-300 rounded"
                  data-testid="checkbox-gallery-active"
                />
                <label htmlFor="active" className="text-sm text-gray-700">
                  Item ativo
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-blue hover:bg-opacity-90"
                  disabled={createGalleryMutation.isPending || updateGalleryMutation.isPending || isUploading}
                  data-testid="button-save-gallery"
                >
                  {isUploading ? "Enviando..." : editingItem ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Ordem</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Carregando galeria...
                </TableCell>
              </TableRow>
            ) : galleryData?.gallery.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Nenhum item na galeria
                </TableCell>
              </TableRow>
            ) : (
              galleryData?.gallery
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <TableRow key={item.id} data-testid={`row-gallery-${item.id}`}>
                    <TableCell className="text-center">{item.order}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.type === 'image'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.type === 'image' ? 'Imagem' : 'Vídeo'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.type === 'image' ? (
                        <img
                          src={item.mediaUrl}
                          alt={item.title}
                          className="w-20 h-12 object-cover rounded"
                        />
                      ) : (
                        <img
                          src={getYouTubeThumbnail(item.mediaUrl)}
                          alt={item.title}
                          className="w-20 h-12 object-cover rounded"
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={item.active}
                        onCheckedChange={(checked) =>
                          toggleItemStatus.mutate({ id: item.id, active: checked })
                        }
                        className="data-[state=checked]:bg-brand-blue"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        data-testid={`button-edit-${item.id}`}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item)}
                        data-testid={`button-delete-${item.id}`}
                      >
                        Deletar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-8 text-center">
        <a
          href="/"
          className="text-brand-blue hover:text-brand-gold transition-colors"
          data-testid="link-back-to-site"
        >
          ← Voltar para o site
        </a>
      </div>
    </>
  );
}