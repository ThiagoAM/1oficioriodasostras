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

interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  link: string | null;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function Banners() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    link: "",
    active: true,
    order: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const { data: bannersData, isLoading } = useQuery<{ banners: Banner[] }>({
    queryKey: ["/api/banners"],
  });

  const uploadImage = async (file: File): Promise<string> => {
    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    const response = await fetch("/api/upload/banner", {
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

  const createBannerMutation = useMutation({
    mutationFn: async (bannerData: typeof formData) => {
      let imageUrl = bannerData.imageUrl;

      if (selectedFile) {
        setIsUploading(true);
        try {
          imageUrl = await uploadImage(selectedFile);
        } finally {
          setIsUploading(false);
        }
      }

      const response = await fetch("/api/banners", {
        method: "POST",
        body: JSON.stringify({ ...bannerData, imageUrl }),
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
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Banner criado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar banner",
        description: error.message,
      });
    },
  });

  const updateBannerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      let imageUrl = data.imageUrl;

      if (selectedFile) {
        setIsUploading(true);
        try {
          imageUrl = await uploadImage(selectedFile);
        } finally {
          setIsUploading(false);
        }
      }

      const response = await fetch(`/api/banners/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ...data, imageUrl }),
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
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      setIsDialogOpen(false);
      setEditingBanner(null);
      resetForm();
      toast({
        title: "Banner atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar banner",
        description: error.message,
      });
    },
  });

  const deleteBannerMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/banners/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      toast({
        title: "Banner deletado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao deletar banner",
        description: error.message,
      });
    },
  });

  const toggleBannerStatus = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const response = await fetch(`/api/banners/${id}/toggle`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      toast({
        title: "Status do banner atualizado!",
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
      imageUrl: "",
      link: "",
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

    if (!selectedFile && !formData.imageUrl && !editingBanner) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione uma imagem para o banner",
      });
      return;
    }

    if (editingBanner) {
      updateBannerMutation.mutate({ id: editingBanner.id, data: formData });
    } else {
      createBannerMutation.mutate(formData);
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      imageUrl: banner.imageUrl,
      link: banner.link || "",
      active: banner.active,
      order: banner.order,
    });
    setPreviewUrl(banner.imageUrl);
    setIsDialogOpen(true);
  };

  const handleDelete = (banner: Banner) => {
    if (confirm(`Tem certeza que deseja deletar o banner "${banner.title}"?`)) {
      deleteBannerMutation.mutate(banner.id);
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

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-blue">
            Gerenciar Banners
          </h1>
          <p className="text-gray-600 mt-1">
            Total de banners: {bannersData?.banners.length || 0} |
            Ativos: {bannersData?.banners.filter(b => b.active).length || 0}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingBanner(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button
              className="bg-brand-blue hover:bg-opacity-90"
              data-testid="button-new-banner"
            >
              + Novo Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? "Editar Banner" : "Novo Banner"}
              </DialogTitle>
              <DialogDescription>
                {editingBanner
                  ? "Atualize as informações do banner abaixo."
                  : "Preencha os dados para criar um novo banner."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-banner">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título do Banner *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                  required
                  data-testid="input-banner-title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem do Banner *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                  data-testid="input-banner-image"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link (opcional)
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://exemplo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                  data-testid="input-banner-link"
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
                  data-testid="input-banner-order"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-brand-blue focus:ring-brand-gold border-gray-300 rounded"
                  data-testid="checkbox-banner-active"
                />
                <label htmlFor="active" className="text-sm text-gray-700">
                  Banner ativo
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingBanner(null);
                    resetForm();
                  }}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-blue hover:bg-opacity-90"
                  disabled={createBannerMutation.isPending || updateBannerMutation.isPending || isUploading}
                  data-testid="button-save-banner"
                >
                  {isUploading ? "Enviando imagem..." : editingBanner ? "Atualizar" : "Criar"}
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
              <TableHead>Imagem</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Carregando banners...
                </TableCell>
              </TableRow>
            ) : bannersData?.banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Nenhum banner encontrado
                </TableCell>
              </TableRow>
            ) : (
              bannersData?.banners
                .sort((a, b) => a.order - b.order)
                .map((banner) => (
                  <TableRow key={banner.id} data-testid={`row-banner-${banner.id}`}>
                    <TableCell className="text-center">{banner.order}</TableCell>
                    <TableCell>
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-20 h-12 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{banner.title}</TableCell>
                    <TableCell>
                      {banner.link ? (
                        <a
                          href={banner.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-blue hover:underline text-sm"
                        >
                          {banner.link.substring(0, 30)}...
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={banner.active}
                        onCheckedChange={(checked) =>
                          toggleBannerStatus.mutate({ id: banner.id, active: checked })
                        }
                        className="data-[state=checked]:bg-brand-blue"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(banner.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(banner)}
                        data-testid={`button-edit-${banner.id}`}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(banner)}
                        data-testid={`button-delete-${banner.id}`}
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