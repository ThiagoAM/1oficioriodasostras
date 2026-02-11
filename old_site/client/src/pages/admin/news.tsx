import { useState, useEffect } from "react";
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
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface News {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NewsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageUrl: "",
    active: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: newsData, isLoading } = useQuery<{ news: News[] }>({
    queryKey: ["/api/news"],
  });

  const createNewsMutation = useMutation({
    mutationFn: async (newsData: typeof formData) => {
      const response = await fetch("/api/news", {
        method: "POST",
        body: JSON.stringify(newsData),
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
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Notícia criada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar notícia",
        description: error.message,
      });
    },
  });

  const updateNewsMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof formData> }) => {
      const response = await fetch(`/api/news/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
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
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      setIsDialogOpen(false);
      setEditingNews(null);
      resetForm();
      toast({
        title: "Notícia atualizada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar notícia",
        description: error.message,
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const response = await fetch(`/api/news/${id}/toggle`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({
        title: "Status atualizado com sucesso!",
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

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/news/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({
        title: "Notícia deletada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao deletar notícia",
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      imageUrl: "",
      active: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate content is not empty
    if (!formData.content || formData.content.trim() === '' || formData.content === '<p><br></p>') {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O conteúdo não pode estar vazio",
      });
      return;
    }

    if (editingNews) {
      updateNewsMutation.mutate({ id: editingNews.id, data: formData });
    } else {
      createNewsMutation.mutate(formData);
    }
  };

  const handleEdit = (news: News) => {
    setEditingNews(news);
    setFormData({
      title: news.title,
      content: news.content,
      imageUrl: news.imageUrl || "",
      active: news.active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (news: News) => {
    if (confirm(`Tem certeza que deseja deletar a notícia "${news.title}"?`)) {
      deleteNewsMutation.mutate(news.id);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    try {
      const response = await fetch("/api/upload/news", {
        method: "POST",
        body: formDataUpload,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer upload da imagem");
      }

      const data = await response.json();
      setFormData({ ...formData, imageUrl: data.filePath });
      toast({
        title: "Imagem enviada com sucesso!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar imagem",
        description: error.message,
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link"],
      ["clean"],
    ],
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Carregando notícias...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold text-brand-blue mb-2">
            Notícias
          </h2>
          <p className="text-gray-600">
            Total de notícias: {newsData?.news.length || 0}
          </p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingNews(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-brand-blue hover:bg-opacity-90">
              + Nova Notícia
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingNews ? "Editar Notícia" : "Nova Notícia"}
              </DialogTitle>
              <DialogDescription>
                {editingNews
                  ? "Atualize as informações da notícia abaixo."
                  : "Preencha os dados para criar uma nova notícia."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conteúdo
                </label>
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={(content) =>
                    setFormData({ ...formData, content })
                  }
                  modules={modules}
                  className="bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                  disabled={uploadingImage}
                />
                {uploadingImage && (
                  <p className="text-sm text-gray-500 mt-1">Enviando imagem...</p>
                )}
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="mt-2 max-w-xs rounded-md"
                  />
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="h-4 w-4 text-brand-blue focus:ring-brand-gold border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                  Ativa
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingNews(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-blue hover:bg-opacity-90"
                  disabled={createNewsMutation.isPending || updateNewsMutation.isPending}
                >
                  {editingNews ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Imagem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {newsData?.news.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Nenhuma notícia encontrada
                </TableCell>
              </TableRow>
            ) : (
              newsData?.news.map((news) => (
                <TableRow key={news.id}>
                  <TableCell>{news.id}</TableCell>
                  <TableCell className="font-medium">{news.title}</TableCell>
                  <TableCell>
                    {news.imageUrl ? (
                      <img
                        src={news.imageUrl}
                        alt={news.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-400">Sem imagem</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() =>
                        toggleActiveMutation.mutate({
                          id: news.id,
                          active: !news.active,
                        })
                      }
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        news.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {news.active ? "Ativa" : "Inativa"}
                    </button>
                  </TableCell>
                  <TableCell>
                    {new Date(news.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(news)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(news)}
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
    </div>
  );
}
