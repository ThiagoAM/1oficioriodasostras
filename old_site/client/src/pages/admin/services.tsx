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

interface Service {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function Services() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const { data: servicesData, isLoading } = useQuery<{ services: Service[] }>({
    queryKey: ["/api/services"],
  });

  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: typeof formData) => {
      const response = await fetch("/api/services", {
        method: "POST",
        body: JSON.stringify(serviceData),
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
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Serviço criado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar serviço",
        description: error.message,
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const response = await fetch(`/api/services/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setIsDialogOpen(false);
      setEditingService(null);
      resetForm();
      toast({
        title: "Serviço atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar serviço",
        description: error.message,
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/services/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Serviço deletado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao deletar serviço",
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data: formData });
    } else {
      createServiceMutation.mutate(formData);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (service: Service) => {
    if (confirm(`Tem certeza que deseja deletar o serviço "${service.name}"?`)) {
      deleteServiceMutation.mutate(service.id);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-blue">
            Gerenciar Serviços
          </h1>
          <p className="text-gray-600 mt-1">
            Total de serviços: {servicesData?.services.length || 0}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingService(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button
              className="bg-brand-blue hover:bg-opacity-90"
              data-testid="button-new-service"
            >
              + Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Editar Serviço" : "Novo Serviço"}
              </DialogTitle>
              <DialogDescription>
                {editingService
                  ? "Atualize as informações do serviço abaixo."
                  : "Preencha os dados para criar um novo serviço."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-service">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Serviço *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                  required
                  data-testid="input-service-name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold min-h-[100px]"
                  rows={4}
                  data-testid="input-service-description"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingService(null);
                    resetForm();
                  }}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-blue hover:bg-opacity-90"
                  disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                  data-testid="button-save-service"
                >
                  {editingService ? "Atualizar" : "Criar"}
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
              <TableHead>Última Atualização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Carregando serviços...
                </TableCell>
              </TableRow>
            ) : servicesData?.services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Nenhum serviço encontrado
                </TableCell>
              </TableRow>
            ) : (
              servicesData?.services.map((service) => (
                <TableRow key={service.id} data-testid={`row-service-${service.id}`}>
                  <TableCell>{service.id}</TableCell>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {service.description || "-"}
                  </TableCell>
                  <TableCell>
                    {new Date(service.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    {new Date(service.updatedAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                      data-testid={`button-edit-${service.id}`}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(service)}
                      data-testid={`button-delete-${service.id}`}
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