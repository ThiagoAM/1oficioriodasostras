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

interface Link {
  id: number;
  name: string;
  url: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Links() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    order: 0,
    active: true,
  });

  const { data: linksData, isLoading } = useQuery<{ links: Link[] }>({
    queryKey: ["/api/links"],
  });

  const createLinkMutation = useMutation({
    mutationFn: async (linkData: typeof formData) => {
      const response = await fetch("/api/links", {
        method: "POST",
        body: JSON.stringify(linkData),
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
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Link criado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar link",
        description: error.message,
      });
    },
  });

  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof formData> }) => {
      const response = await fetch(`/api/links/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      setIsDialogOpen(false);
      setEditingLink(null);
      resetForm();
      toast({
        title: "Link atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar link",
        description: error.message,
      });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/links/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({
        title: "Link deletado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao deletar link",
        description: error.message,
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const response = await fetch(`/api/links/${id}/toggle`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
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

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      order: 0,
      active: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLink) {
      updateLinkMutation.mutate({ id: editingLink.id, data: formData });
    } else {
      createLinkMutation.mutate(formData);
    }
  };

  const handleEdit = (link: Link) => {
    setEditingLink(link);
    setFormData({
      name: link.name,
      url: link.url,
      order: link.order,
      active: link.active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (link: Link) => {
    if (confirm(`Tem certeza que deseja deletar o link "${link.name}"?`)) {
      deleteLinkMutation.mutate(link.id);
    }
  };

  const handleToggleActive = (link: Link) => {
    toggleActiveMutation.mutate({ id: link.id, active: !link.active });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-blue">
            Gerenciar Links
          </h1>
          <p className="text-gray-600 mt-1">
            Total de links: {linksData?.links.length || 0}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingLink(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button
              className="bg-brand-blue hover:bg-opacity-90"
              data-testid="button-new-link"
            >
              + Novo Link
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingLink ? "Editar Link" : "Novo Link"}
              </DialogTitle>
              <DialogDescription>
                {editingLink
                  ? "Atualize as informações do link abaixo."
                  : "Preencha os dados para criar um novo link."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-link">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Site
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                  required
                  data-testid="input-name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Site
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                  required
                  placeholder="https://exemplo.com"
                  data-testid="input-url"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordem
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                  required
                  data-testid="input-order"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-brand-blue focus:ring-brand-gold border-gray-300 rounded"
                  data-testid="checkbox-active"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                  Ativo
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingLink(null);
                    resetForm();
                  }}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-blue hover:bg-opacity-90"
                  data-testid="button-save-link"
                >
                  {editingLink ? "Atualizar" : "Criar"}
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
              <TableHead>URL</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Carregando links...
                </TableCell>
              </TableRow>
            ) : linksData?.links.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Nenhum link encontrado
                </TableCell>
              </TableRow>
            ) : (
              linksData?.links.map((link) => (
                <TableRow key={link.id} data-testid={`row-link-${link.id}`}>
                  <TableCell>{link.id}</TableCell>
                  <TableCell className="font-medium">{link.name}</TableCell>
                  <TableCell>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">
                      {link.url}
                    </a>
                  </TableCell>
                  <TableCell>{link.order}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleActive(link)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        link.active
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      {link.active ? "Ativo" : "Inativo"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(link)}
                      data-testid={`button-edit-${link.id}`}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(link)}
                      data-testid={`button-delete-${link.id}`}
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
    </>
  );
}
