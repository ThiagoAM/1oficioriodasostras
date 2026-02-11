import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import Dashboard from "./admin/dashboard";
import SiteSettings from "./admin/site-settings";
import Contacts from "./admin/contacts";
import GoogleReviews from "./admin/google-reviews";
import Services from "./admin/services";
import Banners from "./admin/banners";
import Gallery from "./admin/gallery";
import Pages from "./admin/pages";
import Duvidas from "./admin/duvidas";
import Scripts from "./admin/scripts";
import SocialMedia from "./admin/social-media";
import NewsPage from "./admin/news";
import Links from "./admin/links";
import Solicitacoes from "./admin/solicitacoes";
import Informacoes from "./admin/informacoes";
import Avisos from "./admin/avisos";

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

interface SiteSettings {
  id?: number;
  mainLogo?: string;
  footerLogo?: string;
  browserTabName?: string;
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const [matchDashboard] = useRoute("/admin/dashboard");
  const [matchUsers] = useRoute("/admin/users");
  const [matchSettings] = useRoute("/admin/site-settings");
  const [matchContacts] = useRoute("/admin/contacts");
  const [matchGoogleReviews] = useRoute("/admin/google-reviews");
  const [matchServices] = useRoute("/admin/services");
  const [matchBanners] = useRoute("/admin/banners");
  const [matchGallery] = useRoute("/admin/gallery");
  const [matchPages] = useRoute("/admin/pages");
  const [matchDuvidas] = useRoute("/admin/duvidas");
  const [matchScripts] = useRoute("/admin/scripts");
  const [matchSocialMedia] = useRoute("/admin/social-media");
  const [matchNews] = useRoute("/admin/news");
  const [matchLinks] = useRoute("/admin/links");
  const [matchSolicitacoes] = useRoute("/admin/solicitacoes");
  const [matchInformacoes] = useRoute("/admin/informacoes");
  const [matchAvisos] = useRoute("/admin/avisos");
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    isAdmin: false,
  });

  const { data: currentUser } = useQuery<{ user: User }>({
    queryKey: ["/api/auth/me"],
  });

  const { data: usersData, isLoading } = useQuery<{ users: User[] }>({
    queryKey: ["/api/users"],
  });

  const { data: settingsData } = useQuery<{ settings: SiteSettings }>({
    queryKey: ["/api/site-settings"],
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof formData) => {
      const response = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(userData),
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
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Usuário criado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar usuário",
        description: error.message,
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof formData> }) => {
      const response = await fetch(`/api/users/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsDialogOpen(false);
      setEditingUser(null);
      resetForm();
      toast({
        title: "Usuário atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar usuário",
        description: error.message,
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/users/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuário deletado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao deletar usuário",
        description: error.message,
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Erro ao fazer logout");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/login");
      toast({
        title: "Logout realizado com sucesso!",
      });
    },
  });

  useEffect(() => {
    if (currentUser && !currentUser.user.isAdmin) {
      toast({
        variant: "destructive",
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página",
      });
      setLocation("/");
    }
  }, [currentUser, setLocation, toast]);

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      fullName: "",
      email: "",
      isAdmin: false,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      const updateData: any = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      updateUserMutation.mutate({ id: editingUser.id, data: updateData });
    } else {
      createUserMutation.mutate(formData);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: "",
      fullName: user.fullName,
      email: user.email,
      isAdmin: user.isAdmin,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    if (confirm(`Tem certeza que deseja deletar o usuário ${user.fullName}?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  if (!currentUser?.user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-light-gray flex">
      <aside className="w-64 bg-brand-blue min-h-screen border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-brand-gold/30">
          <div className="flex flex-col items-center space-y-4">
            {settingsData?.settings?.footerLogo ? (
              <img
                src={settingsData.settings.footerLogo}
                alt="Logo"
                className="h-[150px] object-contain"
              />
            ) : (
              <span className="font-serif text-2xl font-bold text-white">BARRISTAR</span>
            )}
            <span className="text-brand-gold text-sm">Administração</span>
          </div>
        </div>
        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            <li>
              <a
                href="/admin"
                className={`flex items-center px-4 py-3 rounded-md font-medium ${
                  !matchDashboard && !matchUsers && !matchSettings && !matchContacts && !matchGoogleReviews && !matchServices && !matchBanners && !matchGallery && !matchPages && !matchDuvidas && !matchScripts && !matchSocialMedia && !matchNews && !matchLinks && !matchSolicitacoes && !matchInformacoes && !matchAvisos
                    ? "text-brand-blue bg-white"
                    : "text-white hover:bg-brand-blue/80"
                }`}
                data-testid="menu-dashboard"
              >
                Dashboard
              </a>
            </li>
            <li>
              <a
                href="/admin/users"
                className={`flex items-center px-4 py-3 rounded-md font-medium ${
                  matchUsers
                    ? "text-brand-blue bg-white"
                    : "text-white hover:bg-brand-blue/80"
                }`}
                data-testid="menu-usuarios"
              >
                Usuários
              </a>
            </li>
            <li>
              <a
                href="/admin/site-settings"
                className={`flex items-center px-4 py-3 rounded-md font-medium ${
                  matchSettings
                    ? "text-brand-blue bg-white"
                    : "text-white hover:bg-brand-blue/80"
                }`}
                data-testid="menu-site-settings"
              >
                Configurações do Site
              </a>
            </li>
            <li>
              <a
                href="/admin/contacts"
                className={`flex items-center px-4 py-3 rounded-md font-medium ${
                  matchContacts
                    ? "text-brand-blue bg-white"
                    : "text-white hover:bg-brand-blue/80"
                }`}
                data-testid="menu-contacts"
              >
                Contatos
              </a>
            </li>
            <li>
              <a
                href="/admin/google-reviews"
                className={`flex items-center px-4 py-3 rounded-md font-medium ${
                  matchGoogleReviews
                    ? "text-brand-blue bg-white"
                    : "text-white hover:bg-brand-blue/80"
                }`}
                data-testid="menu-google-reviews"
              >
                Google Avaliações
              </a>
            </li>
            <li>
              <a
                href="/admin/services"
                className={`flex items-center px-4 py-3 rounded-md font-medium ${
                  matchServices
                    ? "text-brand-blue bg-white"
                    : "text-white hover:bg-brand-blue/80"
                }`}
                data-testid="menu-services"
              >
                Serviços
              </a>
            </li>
            <li>
              <a
                href="/admin/banners"
                className={`flex items-center px-4 py-3 rounded-md font-medium ${
                  matchBanners
                    ? "text-brand-blue bg-white"
                    : "text-white hover:bg-brand-blue/80"
                }`}
                data-testid="menu-banners"
              >
                Banner
              </a>
            </li>
            <li>
              <a
                href="/admin/gallery"
                className={`flex items-center px-4 py-3 rounded-md font-medium ${
                  matchGallery
                    ? "text-brand-blue bg-white"
                    : "text-white hover:bg-brand-blue/80"
                }`}
                data-testid="menu-gallery"
              >
                Galeria
              </a>
            </li>
            <li>
              <a
                href="/admin/pages"
                className={`flex items-center px-4 py-3 rounded-md font-medium ${
                  matchPages
                    ? "text-brand-blue bg-white"
                    : "text-white hover:bg-brand-blue/80"
                }`}
                data-testid="menu-pages"
              >
                Páginas
              </a>
            </li>
            <li>
              <a
                href="/admin/duvidas"
                className={`flex items-center px-4 py-3 rounded-md font-medium ${
                  matchDuvidas
                    ? "text-brand-blue bg-white"
                    : "text-white hover:bg-brand-blue/80"
                }`}
                data-testid="menu-duvidas"
              >
                Dúvidas
              </a>
            </li>
            <li>
              <a
                href="/admin/scripts"
                className={`flex items-center px-4 py-3 rounded-md font-medium ${
                  matchScripts
                    ? "text-brand-blue bg-white"
                    : "text-white hover:bg-brand-blue/80"
                }`}
                data-testid="menu-scripts"
              >
                Scripts
              </a>
            </li>
            <li>
              <a
                href="/admin/social-media"
                className={`flex items-center px-4 py-3 rounded-md font-medium ${
                  matchSocialMedia
                    ? "text-brand-blue bg-white"
                    : "text-white hover:bg-brand-blue/80"
                }`}
                data-testid="menu-social-media"
              >
                Redes Sociais
              </a>
            </li>
            <li>
              <a
                href="/admin/news"
                className={`flex items-center px-4 py-3 rounded-md font-medium ${
                  matchNews
                    ? "text-brand-blue bg-white"
                    : "text-white hover:bg-brand-blue/80"
                }`}
                data-testid="menu-news"
              >
                Notícias
              </a>
            </li>
            <li>
              <a
                href="/admin/links"
                className={`flex items-center px-4 py-3 rounded-md font-medium ${
                  matchLinks
                    ? "text-brand-blue bg-white"
                    : "text-white hover:bg-brand-blue/80"
                }`}
                data-testid="menu-links"
              >
                Links
              </a>
            </li>
            <li>
              <a
                href="/admin/solicitacoes"
                className={`flex items-center px-4 py-3 rounded-md font-medium ${
                  matchSolicitacoes
                    ? "text-brand-blue bg-white"
                    : "text-white hover:bg-brand-blue/80"
                }`}
                data-testid="menu-solicitacoes"
              >
                Solicitações
              </a>
            </li>
            <li>
              <a
                href="/admin/informacoes"
                className={`flex items-center px-4 py-3 rounded-md font-medium ${
                  matchInformacoes
                    ? "text-brand-blue bg-white"
                    : "text-white hover:bg-brand-blue/80"
                }`}
                data-testid="menu-informacoes"
              >
                Informações
              </a>
            </li>
            <li>
              <a
                href="/admin/avisos"
                className={`flex items-center px-4 py-3 rounded-md font-medium ${
                  matchAvisos
                    ? "text-brand-blue bg-white"
                    : "text-white hover:bg-brand-blue/80"
                }`}
                data-testid="menu-avisos"
              >
                Avisos
              </a>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-brand-gold/30">
          <div className="flex flex-col space-y-2 text-white">
            <span className="text-sm">Olá, {currentUser?.user.fullName}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              className="border-white text-brand-blue hover:bg-white hover:text-brand-blue w-full"
              data-testid="button-logout"
            >
              Sair
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 px-6 py-8">
          {matchUsers ? (
            <>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-brand-blue">
                    Gerenciar Usuários
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Total de usuários: {usersData?.users.length || 0}
                  </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) {
                    setEditingUser(null);
                    resetForm();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-brand-blue hover:bg-opacity-90"
                      data-testid="button-new-user"
                    >
                      + Novo Usuário
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingUser ? "Editar Usuário" : "Novo Usuário"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingUser
                          ? "Atualize as informações do usuário abaixo."
                          : "Preencha os dados para criar um novo usuário."}
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-user">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome Completo
                        </label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                          required
                          data-testid="input-fullname"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                          required
                          data-testid="input-email-user"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome de Usuário
                        </label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                          required
                          data-testid="input-username-user"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Senha {editingUser && "(deixe em branco para não alterar)"}
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                          required={!editingUser}
                          data-testid="input-password-user"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isAdmin"
                          checked={formData.isAdmin}
                          onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                          className="h-4 w-4 text-brand-blue focus:ring-brand-gold border-gray-300 rounded"
                          data-testid="checkbox-is-admin"
                        />
                        <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-700">
                          Administrador
                        </label>
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsDialogOpen(false);
                            setEditingUser(null);
                            resetForm();
                          }}
                          data-testid="button-cancel"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          className="bg-brand-blue hover:bg-opacity-90"
                          data-testid="button-save-user"
                        >
                          {editingUser ? "Atualizar" : "Criar"}
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
                      <TableHead>Email</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Carregando usuários...
                        </TableCell>
                      </TableRow>
                    ) : usersData?.users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Nenhum usuário encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      usersData?.users.map((user) => (
                        <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell className="font-medium">{user.fullName}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.isAdmin
                                  ? "bg-brand-gold text-white"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {user.isAdmin ? "Admin" : "Usuário"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(user)}
                              data-testid={`button-edit-${user.id}`}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(user)}
                              disabled={user.id === currentUser?.user.id}
                              data-testid={`button-delete-${user.id}`}
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
          ) : matchSettings ? (
            <SiteSettings />
          ) : matchContacts ? (
            <Contacts />
          ) : matchGoogleReviews ? (
            <GoogleReviews />
          ) : matchServices ? (
            <Services />
          ) : matchBanners ? (
            <Banners />
          ) : matchGallery ? (
            <Gallery />
          ) : matchPages ? (
            <Pages />
          ) : matchDuvidas ? (
            <Duvidas />
          ) : matchScripts ? (
            <Scripts />
          ) : matchSocialMedia ? (
            <SocialMedia />
          ) : matchNews ? (
            <NewsPage />
          ) : matchLinks ? (
            <Links />
          ) : matchSolicitacoes ? (
            <Solicitacoes />
          ) : matchInformacoes ? (
            <Informacoes />
          ) : matchAvisos ? (
            <Avisos />
          ) : (
            <Dashboard />
          )}
      </main>
    </div>
  );
}
