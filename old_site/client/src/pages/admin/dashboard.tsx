import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStats {
  newSolicitacoes: number;
  newDuvidas: number;
  totalSolicitacoes: number;
  totalDuvidas: number;
  analytics?: {
    measurementId: string;
    configured: boolean;
    message: string;
  } | null;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mb-4"></div>
          <p className="text-gray-600">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-brand-blue">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral das métricas do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Novas Solicitações
            </CardTitle>
            <CardDescription className="text-xs">Últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-blue">
              {stats?.newSolicitacoes || 0}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Total: {stats?.totalSolicitacoes || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Novas Dúvidas
            </CardTitle>
            <CardDescription className="text-xs">Últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-blue">
              {stats?.newDuvidas || 0}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Total: {stats?.totalDuvidas || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Solicitações
            </CardTitle>
            <CardDescription className="text-xs">Desde o início</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-gold">
              {stats?.totalSolicitacoes || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Dúvidas
            </CardTitle>
            <CardDescription className="text-xs">Desde o início</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-gold">
              {stats?.totalDuvidas || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {stats?.analytics && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Google Analytics</CardTitle>
            <CardDescription>Métricas do site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-semibold text-green-800">
                    Google Analytics Configurado
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    ID de Medição: {stats.analytics.measurementId}
                  </p>
                </div>
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> {stats.analytics.message}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Para visualizar métricas detalhadas como visitantes, pageviews e sessões,
                  é necessário configurar credenciais do Google Analytics Data API.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!stats?.analytics && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Google Analytics</CardTitle>
            <CardDescription>Métricas do site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Google Analytics não configurado</strong>
              </p>
              <p className="text-xs text-yellow-600 mt-2">
                Configure o Google Analytics em <a href="/admin/scripts" className="underline">Scripts</a> para
                visualizar métricas do site.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a
                href="/admin/solicitacoes"
                className="block p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
              >
                <div className="font-medium text-brand-blue">Ver Solicitações</div>
                <div className="text-xs text-gray-500 mt-1">
                  Gerenciar todas as solicitações recebidas
                </div>
              </a>
              <a
                href="/admin/duvidas"
                className="block p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
              >
                <div className="font-medium text-brand-blue">Ver Dúvidas</div>
                <div className="text-xs text-gray-500 mt-1">
                  Responder mensagens de contato
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-gray-600">Taxa de novas solicitações</span>
                <span className="font-semibold text-brand-blue">
                  {stats?.totalSolicitacoes
                    ? Math.round((stats.newSolicitacoes / stats.totalSolicitacoes) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-gray-600">Taxa de novas dúvidas</span>
                <span className="font-semibold text-brand-blue">
                  {stats?.totalDuvidas
                    ? Math.round((stats.newDuvidas / stats.totalDuvidas) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total de interações</span>
                <span className="font-semibold text-brand-gold">
                  {(stats?.totalSolicitacoes || 0) + (stats?.totalDuvidas || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
