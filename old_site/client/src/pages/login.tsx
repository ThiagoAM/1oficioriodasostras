import { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface SiteSettings {
  id?: number;
  mainLogo?: string;
  footerLogo?: string;
  browserTabName?: string;
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const { data: settingsData } = useQuery<{ settings: SiteSettings }>({
    queryKey: ["/api/site-settings"],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${data.user.fullName}`,
        });
        
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        
        if (data.user.isAdmin) {
          setLocation("/admin");
        } else {
          setLocation("/");
        }
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: error.message || "Usuário ou senha incorretos",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: "Ocorreu um erro ao tentar fazer login",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light-gray flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            {settingsData?.settings?.mainLogo ? (
              <img
                src={settingsData.settings.mainLogo}
                alt="Logo"
                className="h-[180px] object-contain"
              />
            ) : (
              <span className="font-serif text-4xl font-bold text-brand-blue">BARRISTAR</span>
            )}
          </div>
          <h2 className="mt-6 text-center text-3xl font-serif font-bold text-brand-blue">
            Área Administrativa
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Faça login para acessar o painel de administração
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} data-testid="form-login">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Usuário
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-gold focus:border-brand-gold focus:z-10 sm:text-sm"
                placeholder="Nome de usuário"
                data-testid="input-username"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-gold focus:border-brand-gold focus:z-10 sm:text-sm"
                placeholder="Senha"
                data-testid="input-password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-login"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </form>

        <div className="text-center">
          <a
            href="/"
            className="text-brand-blue hover:text-brand-gold transition-colors"
            data-testid="link-back-home"
          >
            ← Voltar para o site
          </a>
        </div>
      </div>
    </div>
  );
}
