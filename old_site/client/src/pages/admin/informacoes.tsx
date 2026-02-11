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
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface Informacao {
  id: number;
  nome: string;
  descricao: string | null;
  conteudo: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function Informacoes() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInformacao, setEditingInformacao] = useState<Informacao | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    conteudo: "",
  });

  const { data: informacoesData, isLoading } = useQuery<{ informacoes: Informacao[] }>({
    queryKey: ["/api/informacoes"],
  });

  const createInformacaoMutation = useMutation({
    mutationFn: async (informacaoData: typeof formData) => {
      const response = await fetch("/api/informacoes", {
        method: "POST",
        body: JSON.stringify(informacaoData),
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
      queryClient.invalidateQueries({ queryKey: ["/api/informacoes"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Informação criada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar informação",
        description: error.message,
      });
    },
  });

  const updateInformacaoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof formData> }) => {
      const response = await fetch(`/api/informacoes/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/informacoes"] });
      setIsDialogOpen(false);
      setEditingInformacao(null);
      resetForm();
      toast({
        title: "Informação atualizada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar informação",
        description: error.message,
      });
    },
  });

  const deleteInformacaoMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/informacoes/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/informacoes"] });
      toast({
        title: "Informação deletada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao deletar informação",
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      descricao: "",
      conteudo: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInformacao) {
      updateInformacaoMutation.mutate({ id: editingInformacao.id, data: formData });
    } else {
      createInformacaoMutation.mutate(formData);
    }
  };

  const handleEdit = (informacao: Informacao) => {
    setEditingInformacao(informacao);
    setFormData({
      nome: informacao.nome,
      descricao: informacao.descricao || "",
      conteudo: informacao.conteudo || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (informacao: Informacao) => {
    if (confirm(`Tem certeza que deseja deletar "${informacao.nome}"?`)) {
      deleteInformacaoMutation.mutate(informacao.id);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
      ["link", "image", "video"],
      [{ align: [] }],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-blue">
            Gerenciar Informações
          </h1>
          <p className="text-gray-600 mt-1">
            Total de informações: {informacoesData?.informacoes.length || 0}
          </p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingInformacao(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-brand-blue hover:bg-opacity-90">
              + Nova Informação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingInformacao ? "Editar Informação" : "Nova Informação"}
              </DialogTitle>
              <DialogDescription>
                {editingInformacao
                  ? "Atualize as informações abaixo."
                  : "Preencha os dados para criar uma nova informação."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conteúdo
                </label>
                <ReactQuill
                  theme="snow"
                  value={formData.conteudo}
                  onChange={(value) => setFormData({ ...formData, conteudo: value })}
                  modules={modules}
                  className="bg-white"
                  style={{ height: "300px", marginBottom: "50px" }}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingInformacao(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-brand-blue hover:bg-opacity-90">
                  {editingInformacao ? "Atualizar" : "Criar"}
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
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Carregando informações...
                </TableCell>
              </TableRow>
            ) : informacoesData?.informacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Nenhuma informação encontrada
                </TableCell>
              </TableRow>
            ) : (
              informacoesData?.informacoes.map((informacao) => (
                <TableRow key={informacao.id}>
                  <TableCell>{informacao.id}</TableCell>
                  <TableCell className="font-medium">{informacao.nome}</TableCell>
                  <TableCell>{informacao.descricao || "-"}</TableCell>
                  <TableCell>
                    {new Date(informacao.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(informacao)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(informacao)}
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
