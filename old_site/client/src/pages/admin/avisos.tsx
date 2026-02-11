import { useState } from "react";
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
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface Aviso {
  id: number;
  texto: string;
  imagemUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AvisosPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAviso, setEditingAviso] = useState<Aviso | null>(null);
  const [formData, setFormData] = useState({
    texto: "",
    imagemUrl: "" as string | null,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: avisosData, isLoading } = useQuery<{ avisos: Aviso[] }>({
    queryKey: ["/api/avisos"],
  });

  const uploadImage = async (file: File): Promise<string> => {
    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    const response = await fetch("/api/upload/aviso", {
      method: "POST",
      body: uploadFormData,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Erro ao fazer upload da imagem");
    }

    const data = await response.json();
    return data.filePath;
  };

  const createAvisoMutation = useMutation({
    mutationFn: async (avisoData: { texto: string; imagemUrl?: string | null }) => {
      const response = await fetch("/api/avisos", {
        method: "POST",
        body: JSON.stringify(avisoData),
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
      queryClient.invalidateQueries({ queryKey: ["/api/avisos"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Aviso criado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar aviso",
        description: error.message,
      });
    },
  });

  const updateAvisoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<{ texto: string; imagemUrl: string | null }> }) => {
      const response = await fetch(`/api/avisos/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/avisos"] });
      setIsDialogOpen(false);
      setEditingAviso(null);
      resetForm();
      toast({
        title: "Aviso atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar aviso",
        description: error.message,
      });
    },
  });

  const deleteAvisoMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/avisos/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/avisos"] });
      toast({
        title: "Aviso deletado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao deletar aviso",
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setFormData({
      texto: "",
      imagemUrl: null,
    });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Arquivo inválido",
          description: "Apenas imagens são permitidas (JPG, PNG, GIF)",
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

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData({ ...formData, imagemUrl: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((!formData.texto || formData.texto.trim() === "") && !selectedFile && !formData.imagemUrl) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha o texto ou envie uma imagem",
      });
      return;
    }

    try {
      let imagemUrl = formData.imagemUrl;

      if (selectedFile) {
        setUploading(true);
        imagemUrl = await uploadImage(selectedFile);
        setUploading(false);
      }

      const dataToSend = {
        texto: formData.texto || null,
        imagemUrl: imagemUrl || null,
      };

      if (editingAviso) {
        updateAvisoMutation.mutate({ id: editingAviso.id, data: dataToSend });
      } else {
        createAvisoMutation.mutate(dataToSend);
      }
    } catch {
      setUploading(false);
      toast({
        variant: "destructive",
        title: "Erro ao fazer upload da imagem",
      });
    }
  };

  const handleEdit = (aviso: Aviso) => {
    setEditingAviso(aviso);
    setFormData({
      texto: aviso.texto,
      imagemUrl: aviso.imagemUrl,
    });
    if (aviso.imagemUrl) {
      setPreviewUrl(aviso.imagemUrl);
    }
    setIsDialogOpen(true);
  };

  const handleDelete = (aviso: Aviso) => {
    if (confirm(`Tem certeza que deseja deletar este aviso?`)) {
      deleteAvisoMutation.mutate(aviso.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Carregando avisos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold text-brand-blue mb-2">
            Avisos
          </h2>
          <p className="text-gray-600">
            Total de avisos: {avisosData?.avisos.length || 0}
          </p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingAviso(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-brand-blue hover:bg-opacity-90">
              + Novo Aviso
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingAviso ? "Editar Aviso" : "Novo Aviso"}
              </DialogTitle>
              <DialogDescription>
                {editingAviso
                  ? "Atualize as informações do aviso abaixo."
                  : "Preencha os dados para criar um novo aviso."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Texto do Aviso
                </label>
                <textarea
                  value={formData.texto}
                  onChange={(e) =>
                    setFormData({ ...formData, texto: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold min-h-[150px]"
                  placeholder="Digite o texto do aviso aqui (opcional)..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem (opcional)
                </label>

                {previewUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-48 rounded-md border border-gray-300 object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-brand-gold hover:bg-gray-50 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      Clique para enviar uma imagem
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      JPG, PNG ou GIF (máx. 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingAviso(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-blue hover:bg-opacity-90"
                  disabled={
                    createAvisoMutation.isPending ||
                    updateAvisoMutation.isPending ||
                    uploading
                  }
                >
                  {uploading
                    ? "Enviando imagem..."
                    : editingAviso
                      ? "Atualizar"
                      : "Criar"}
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
              <TableHead>Imagem</TableHead>
              <TableHead>Texto</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {avisosData?.avisos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Nenhum aviso encontrado
                </TableCell>
              </TableRow>
            ) : (
              avisosData?.avisos.map((aviso) => (
                <TableRow key={aviso.id}>
                  <TableCell>{aviso.id}</TableCell>
                  <TableCell>
                    {aviso.imagemUrl ? (
                      <img
                        src={aviso.imagemUrl}
                        alt="Imagem do aviso"
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="line-clamp-2">{aviso.texto}</div>
                  </TableCell>
                  <TableCell>
                    {new Date(aviso.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(aviso)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(aviso)}
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
