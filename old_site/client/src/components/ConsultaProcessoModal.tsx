import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Search, AlertCircle, CheckCircle, FileText, Users, Calendar, ScrollText, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConsultaProcessoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProcessoData {
  [key: string]: any;
}

export function ConsultaProcessoModal({ isOpen, onClose }: ConsultaProcessoModalProps) {
  const [numeroProcesso, setNumeroProcesso] = useState("");
  const [cpf, setCpf] = useState("");
  const [shouldSearch, setShouldSearch] = useState(false);
  const [processoData, setProcessoData] = useState<ProcessoData | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/consulta-processo", numeroProcesso, cpf],
    queryFn: async () => {
      if (!numeroProcesso || !cpf) {
        throw new Error("Preencha todos os campos");
      }

      // Usar apenas a conexão via servidor backend
      const response = await fetch("/api/consulta-processo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numeroProcesso: numeroProcesso.replace(/\D/g, ""),
          cpf: cpf.replace(/\D/g, "")
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();

        // Tratamento específico de erros
        if (response.status === 503) {
          throw new Error("Serviço temporariamente indisponível. Por favor, tente novamente em alguns instantes.");
        } else if (response.status === 504) {
          throw new Error("A consulta demorou muito tempo. Por favor, tente novamente.");
        } else if (response.status === 404) {
          throw new Error("Processo não encontrado. Verifique o número do processo e CPF.");
        } else if (response.status === 401) {
          throw new Error("Problema na configuração da API. Entre em contato com o suporte.");
        }

        throw new Error(error.message || "Erro ao consultar processo. Por favor, tente novamente.");
      }

      const data = await response.json();
      return data;
    },
    enabled: shouldSearch && !!numeroProcesso && !!cpf,
    retry: false,
  });

  const handleSearch = () => {
    if (numeroProcesso && cpf) {
      setShouldSearch(true);
      refetch();
    }
  };

  const handleClose = () => {
    setNumeroProcesso("");
    setCpf("");
    setShouldSearch(false);
    setProcessoData(null);
    onClose();
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2");
    }
    return value;
  };

  const renderProcessoInfo = (data: any) => {
    if (!data) return null;

    // Se for um array, pegar o primeiro item
    const processo = Array.isArray(data) ? data[0] : data;

    if (!processo) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhum processo encontrado com os dados informados.
          </AlertDescription>
        </Alert>
      );
    }

    // Contar itens para mostrar badges
    const partesCount = processo.partes?.length || 0;
    const andamentosCount = processo.andamentos?.length || 0;

    return (
      <div className="space-y-4 mt-4">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Processo encontrado!
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="informacoes" className="w-full flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 h-auto p-1 flex-shrink-0">
            <TabsTrigger
              value="informacoes"
              className="data-[state=active]:bg-white flex items-center justify-center py-2 px-2"
            >
              <FileText className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">Informações</span>
            </TabsTrigger>
            <TabsTrigger
              value="partes"
              className="data-[state=active]:bg-white flex items-center justify-center py-2 px-2 relative"
            >
              <Users className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">
                Partes
                {partesCount > 0 && (
                  <span className="ml-1 text-xs bg-brand-blue text-white px-1.5 py-0.5 rounded-full inline-block">
                    {partesCount}
                  </span>
                )}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="andamentos"
              className="data-[state=active]:bg-white flex items-center justify-center py-2 px-2 relative"
            >
              <ScrollText className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">
                Andamentos
                {andamentosCount > 0 && (
                  <span className="ml-1 text-xs bg-brand-blue text-white px-1.5 py-0.5 rounded-full inline-block">
                    {andamentosCount}
                  </span>
                )}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="informacoes" className="mt-4 overflow-y-auto max-h-[350px] pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <div className="space-y-3">
                {processo.num_seq && (
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-semibold text-gray-700 sm:w-1/3">Processo:</span>
                    <span className="text-gray-900 font-medium">{processo.num_seq}</span>
                  </div>
                )}

                {processo.nome && (
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-semibold text-gray-700 sm:w-1/3">Nome:</span>
                    <span className="text-gray-900">{processo.nome}</span>
                  </div>
                )}

                {processo.situacao && (
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-semibold text-gray-700 sm:w-1/3">Situação:</span>
                    <span className="text-gray-900">{processo.situacao}</span>
                  </div>
                )}

                {processo.dt_cadastro && (
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-semibold text-gray-700 sm:w-1/3">Data Cadastro:</span>
                    <span className="text-gray-900">
                      {new Date(processo.dt_cadastro).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}

                {processo.observacao && (
                  <div className="flex flex-col sm:flex-row">
                    <span className="font-semibold text-gray-700 sm:w-1/3">Observação:</span>
                    <span className="text-gray-900 flex-1">{processo.observacao}</span>
                  </div>
                )}

                {/* Campos adicionais */}
                {Object.entries(processo).map(([key, value]) => {
                  if (["num_seq", "nome", "situacao", "dt_cadastro", "observacao", "identificacao", "partes", "andamentos"].includes(key)) {
                    return null;
                  }
                  if (value && typeof value !== "object") {
                    return (
                      <div key={key} className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-semibold text-gray-700 sm:w-1/3 capitalize">
                          {key.replace(/_/g, " ")}:
                        </span>
                        <span className="text-gray-900">{String(value)}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="partes" className="mt-4 overflow-y-auto max-h-[350px] pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            {processo.partes && processo.partes.length > 0 ? (
              <div className="space-y-3">
                {processo.partes.map((parte: any, index: number) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-3 sm:p-4 border-l-4 border-brand-gold">
                    <div className="space-y-2">
                      <div className="font-semibold text-gray-900 text-lg">
                        {parte.nome || parte.nome_parte || "Parte " + (index + 1)}
                      </div>
                      {parte.tipo && (
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Tipo:</span> {parte.tipo}
                        </div>
                      )}
                      {parte.cpf_cnpj && (
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">CPF/CNPJ:</span> {parte.cpf_cnpj}
                        </div>
                      )}
                      {parte.qualificacao && (
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Qualificação:</span> {parte.qualificacao}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Nenhuma parte cadastrada neste processo.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="andamentos" className="mt-4 overflow-y-auto max-h-[350px] pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            {processo.andamentos && processo.andamentos.length > 0 ? (
              <div className="space-y-3">
                {processo.andamentos
                  .sort((a: any, b: any) =>
                    new Date(a.data || a.dt_andamento || 0).getTime() -
                    new Date(b.data || b.dt_andamento || 0).getTime()
                  )
                  .map((andamento: any, index: number) => (
                    <div key={index} className="bg-yellow-50 rounded-lg p-3 sm:p-4 border-l-4 border-brand-gold">
                      <div className="space-y-2">
                        {(andamento.data || andamento.dt_andamento) && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">
                              {new Date(andamento.data || andamento.dt_andamento).toLocaleDateString("pt-BR")}
                              {andamento.hora && ` às ${andamento.hora}`}
                            </span>
                            {andamento.tipo && (
                              <span className="ml-auto px-2 py-1 text-xs bg-brand-blue text-white rounded">
                                {andamento.tipo}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="text-gray-900">
                          {andamento.descricao || andamento.texto || andamento.andamento || "Andamento registrado"}
                        </div>
                        {andamento.complemento && (
                          <div className="text-sm text-gray-600 italic">
                            {andamento.complemento}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Nenhum andamento registrado neste processo.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-brand-blue">
            Consulte seu Processo
          </DialogTitle>
          <DialogDescription>
            Informe o número do processo e seu CPF para consultar o andamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4 overflow-y-auto flex-1 pr-2">
          <div className="space-y-2">
            <Label htmlFor="numeroProcesso">Número do Processo</Label>
            <Input
              id="numeroProcesso"
              type="text"
              placeholder="Digite o número do processo"
              value={numeroProcesso}
              onChange={(e) => setNumeroProcesso(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(formatCPF(e.target.value))}
              maxLength={14}
              className="w-full"
            />
          </div>

          <Button
            onClick={handleSearch}
            disabled={!numeroProcesso || !cpf || isLoading}
            className="w-full bg-brand-blue hover:bg-opacity-90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Consultando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Consultar Processo
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div>{error instanceof Error ? error.message : "Erro ao consultar processo"}</div>
                  {(error instanceof Error && error.message.includes("indisponível")) && (
                    <div className="text-xs mt-2 opacity-80">
                      ⚠️ O servidor de consultas pode estar em manutenção ou fora do ar temporariamente.
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {data && renderProcessoInfo(data)}
        </div>
      </DialogContent>
    </Dialog>
  );
}