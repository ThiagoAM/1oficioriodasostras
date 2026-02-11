import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import CertidaoEscritura from "@/pages/certidao-escritura";
import CertidaoProtesto from "@/pages/certidao-protesto";
import CertidaoProcuracao from "@/pages/certidao-procuracao";
import CertidaoSubstabelecimento from "@/pages/certidao-substabelecimento";
import ConfirmacaoProcuracao from "@/pages/confirmacao-procuracao";
import SoliciteEscritura from "@/pages/solicite-escritura";
import Contato from "@/pages/contato";
import LinksPage from "@/pages/links";
import InformacoesPage from "@/pages/informacoes";
import ServicosOnlinePage from "@/pages/servicos-online";
import ServicosPage from "@/pages/servicos";
import DynamicPage from "@/pages/dynamic-page";
import WhatsAppButton from "@/components/whatsapp-button";
import { useEffect } from "react";

interface SiteSettings {
  id?: number;
  mainLogo?: string;
  footerLogo?: string;
  browserTabName?: string;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/contato" component={Contato} />
      <Route path="/links" component={LinksPage} />
      <Route path="/informacoes" component={InformacoesPage} />
      <Route path="/servicos-online" component={ServicosOnlinePage} />
      <Route path="/servicos" component={ServicosPage} />
      <Route path="/certidao-de-escritura" component={CertidaoEscritura} />
      <Route path="/certidao-de-protesto" component={CertidaoProtesto} />
      <Route path="/certidao-de-procuracao" component={CertidaoProcuracao} />
      <Route path="/certidao-de-substabelecimento" component={CertidaoSubstabelecimento} />
      <Route path="/confirmacao-de-procuracao" component={ConfirmacaoProcuracao} />
      <Route path="/solicite-sua-escritura" component={SoliciteEscritura} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/users" component={Admin} />
      <Route path="/admin/site-settings" component={Admin} />
      <Route path="/admin/contacts" component={Admin} />
      <Route path="/admin/google-reviews" component={Admin} />
      <Route path="/admin/services" component={Admin} />
      <Route path="/admin/banners" component={Admin} />
      <Route path="/admin/gallery" component={Admin} />
      <Route path="/admin/pages" component={Admin} />
      <Route path="/admin/duvidas" component={Admin} />
      <Route path="/admin/scripts" component={Admin} />
      <Route path="/admin/social-media" component={Admin} />
      <Route path="/admin/news" component={Admin} />
      <Route path="/admin/links" component={Admin} />
      <Route path="/admin/solicitacoes" component={Admin} />
      <Route path="/admin/informacoes" component={Admin} />
      <Route path="/admin/avisos" component={Admin} />
      <Route path="/:slug" component={DynamicPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { data: settingsData } = useQuery<{ settings: SiteSettings }>({
    queryKey: ["/api/site-settings"],
  });

  useEffect(() => {
    if (settingsData?.settings?.browserTabName) {
      document.title = settingsData.settings.browserTabName;
    }
  }, [settingsData]);

  return (
    <TooltipProvider>
      <Toaster />
      <Router />
      <WhatsAppButton />
    </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
