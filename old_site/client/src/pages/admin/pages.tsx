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
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
} from "lucide-react";

interface Page {
  id: number;
  name: string;
  slug: string;
  content: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function RichTextEditor({ content, onChange }: { content: string; onChange: (content: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: content || "<p></p>",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt("URL do link:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border border-gray-300 rounded-md">
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-300 bg-gray-50">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-gray-200" : ""}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-gray-200" : ""}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "bg-gray-200" : ""}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <div className="w-px h-8 bg-gray-300 mx-1" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-gray-200" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-gray-200" : ""}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-8 bg-gray-300 mx-1" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <div className="w-px h-8 bg-gray-300 mx-1" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addLink}
          className={editor.isActive("link") ? "bg-gray-200" : ""}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="prose max-w-none p-4 min-h-[300px] focus:outline-none"
      />
    </div>
  );
}

export default function Pages() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    content: "<p></p>",
    active: true,
  });

  const { data: pagesData, isLoading } = useQuery<{ pages: Page[] }>({
    queryKey: ["/api/pages"],
  });

  const createPageMutation = useMutation({
    mutationFn: async (pageData: typeof formData) => {
      console.log('Enviando dados:', pageData);
      const response = await fetch("/api/pages", {
        method: "POST",
        body: JSON.stringify(pageData),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const responseText = await response.text();
      console.log('Resposta do servidor:', responseText);

      if (!response.ok) {
        try {
          const error = JSON.parse(responseText);
          throw new Error(error.message);
        } catch (e) {
          throw new Error(responseText || "Erro ao criar página");
        }
      }

      try {
        return JSON.parse(responseText);
      } catch (e) {
        throw new Error("Resposta inválida do servidor: " + responseText);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Página criada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar página",
        description: error.message,
      });
    },
  });

  const updatePageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const response = await fetch(`/api/pages/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      setIsDialogOpen(false);
      setEditingPage(null);
      resetForm();
      toast({
        title: "Página atualizada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar página",
        description: error.message,
      });
    },
  });

  const deletePageMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/pages/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({
        title: "Página deletada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao deletar página",
        description: error.message,
      });
    },
  });

  const togglePageMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const response = await fetch(`/api/pages/${id}/toggle`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({
        title: "Status da página atualizado!",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      content: "<p></p>",
      active: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Nome da página é obrigatório",
      });
      return;
    }

    if (!formData.slug.trim()) {
      toast({
        variant: "destructive",
        title: "Slug é obrigatório",
      });
      return;
    }

    // Garantir que o conteúdo tenha pelo menos um parágrafo vazio
    const contentToSave = formData.content.trim() || "<p></p>";
    const dataToSave = { ...formData, content: contentToSave };

    if (editingPage) {
      updatePageMutation.mutate({ id: editingPage.id, data: dataToSave });
    } else {
      createPageMutation.mutate(dataToSave);
    }
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setFormData({
      name: page.name,
      slug: page.slug,
      content: page.content,
      active: page.active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (page: Page) => {
    if (confirm(`Tem certeza que deseja deletar a página "${page.name}"?`)) {
      deletePageMutation.mutate(page.id);
    }
  };

  const handleToggleActive = (page: Page) => {
    togglePageMutation.mutate({ id: page.id, active: !page.active });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-blue">
            Gerenciar Páginas
          </h1>
          <p className="text-gray-600 mt-1">
            Total de páginas: {pagesData?.pages.length || 0}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingPage(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-brand-blue hover:bg-opacity-90">
              + Nova Página
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPage ? "Editar Página" : "Nova Página"}
              </DialogTitle>
              <DialogDescription>
                {editingPage
                  ? "Atualize as informações da página abaixo."
                  : "Preencha os dados para criar uma nova página."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Página *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({
                      ...formData,
                      name,
                      slug: generateSlug(name),
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                  required
                  placeholder="exemplo-de-pagina"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A página ficará disponível em: /{formData.slug}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conteúdo *
                </label>
                <RichTextEditor
                  key={editingPage ? `edit-${editingPage.id}` : 'new'}
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-brand-blue focus:ring-brand-gold border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                  Página ativa
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingPage(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-blue hover:bg-opacity-90"
                  disabled={createPageMutation.isPending || updatePageMutation.isPending}
                >
                  {editingPage ? "Atualizar" : "Criar"}
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
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Carregando páginas...
                </TableCell>
              </TableRow>
            ) : pagesData?.pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Nenhuma página encontrada
                </TableCell>
              </TableRow>
            ) : (
              pagesData?.pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>{page.id}</TableCell>
                  <TableCell className="font-medium">{page.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      /{page.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(page)}
                      className={page.active ? "text-green-600" : "text-gray-400"}
                    >
                      {page.active ? "Ativa" : "Inativa"}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {new Date(page.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(page)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(page)}
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
        >
          ← Voltar para o site
        </a>
      </div>
    </>
  );
}
