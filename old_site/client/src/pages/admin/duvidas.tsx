import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface ContactMessage {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
  anexos?: string;
  lido: boolean;
  createdAt: string;
}

export default function Duvidas() {
  const { toast } = useToast();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: messagesData, isLoading } = useQuery<{ messages: ContactMessage[] }>({
    queryKey: ["/api/contact-messages"],
  });

  const toggleReadMutation = useMutation({
    mutationFn: async ({ id, lido }: { id: number; lido: boolean }) => {
      const response = await fetch(`/api/contact-messages/${id}/toggle-read`, {
        method: "PATCH",
        body: JSON.stringify({ lido }),
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
      queryClient.invalidateQueries({ queryKey: ["/api/contact-messages"] });
      toast({
        title: "Status atualizado!",
      });
    },
  });

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);

    // Marcar como lida quando abrir
    if (!message.lido) {
      toggleReadMutation.mutate({ id: message.id, lido: true });
    }
  };

  const handleToggleRead = (message: ContactMessage) => {
    toggleReadMutation.mutate({ id: message.id, lido: !message.lido });
  };

  const unreadCount = messagesData?.messages.filter(m => !m.lido).length || 0;

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-blue">
            Dúvidas e Mensagens de Contato
          </h1>
          <p className="text-gray-600 mt-1">
            Total de mensagens: {messagesData?.messages.length || 0} | Não lidas: {unreadCount}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Mensagem</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Carregando mensagens...
                </TableCell>
              </TableRow>
            ) : messagesData?.messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Nenhuma mensagem encontrada
                </TableCell>
              </TableRow>
            ) : (
              messagesData?.messages.map((message) => (
                <TableRow
                  key={message.id}
                  className={!message.lido ? "bg-blue-50" : ""}
                >
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleRead(message)}
                      className={message.lido ? "text-gray-400" : "text-blue-600 font-semibold"}
                    >
                      {message.lido ? "Lida" : "Nova"}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">{message.nome}</TableCell>
                  <TableCell>
                    <a
                      href={`mailto:${message.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {message.email}
                    </a>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`https://wa.me/55${message.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {message.telefone}
                    </a>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {message.mensagem}
                  </TableCell>
                  <TableCell>
                    {new Date(message.createdAt).toLocaleDateString("pt-BR")} às{" "}
                    {new Date(message.createdAt).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewMessage(message)}
                    >
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Mensagem de {selectedMessage?.nome}</DialogTitle>
            <DialogDescription>
              Recebida em {selectedMessage && new Date(selectedMessage.createdAt).toLocaleDateString("pt-BR")} às{" "}
              {selectedMessage && new Date(selectedMessage.createdAt).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <p className="text-gray-900">{selectedMessage.nome}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {selectedMessage.email}
                  </a>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <a
                    href={`https://wa.me/55${selectedMessage.telefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {selectedMessage.telefone}
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem
                </label>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.mensagem}</p>
                </div>
              </div>

              {selectedMessage.anexos && JSON.parse(selectedMessage.anexos).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anexos
                  </label>
                  <div className="space-y-2">
                    {JSON.parse(selectedMessage.anexos).map((anexo: string, index: number) => {
                      const fileName = anexo.split('/').pop() || 'arquivo';
                      const isImage = /\.(jpg|jpeg|png|gif)$/i.test(anexo);
                      const isPdf = /\.pdf$/i.test(anexo);

                      return (
                        <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded border border-gray-200">
                          <div className="flex items-center space-x-2">
                            {isImage && (
                              <span className="iconify text-blue-600" data-icon="mdi:image" data-width="20"></span>
                            )}
                            {isPdf && (
                              <span className="iconify text-red-600" data-icon="mdi:file-pdf" data-width="20"></span>
                            )}
                            <span className="text-sm text-gray-700">{fileName}</span>
                          </div>
                          <a
                            href={anexo}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Button variant="ghost" size="sm">
                              Baixar
                            </Button>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="mt-8 text-center">
        <a
          href="/"
          className="text-brand-blue hover:text-brand-gold transition-colors"
        >
          ← Voltar para o site
        </a>
      </div>
    </>
  );
}
