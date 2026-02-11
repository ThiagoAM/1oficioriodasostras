import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

interface Solicitacao {
  id: number;
  tipoSolicitacao: string;
  nomeSolicitacao: string;
  dadosFormulario: string;
  createdAt: string;
}

export default function AdminSolicitacoes() {
  const [location, setLocation] = useLocation();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);

  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  const fetchSolicitacoes = async () => {
    try {
      const response = await fetch("/api/solicitacoes");
      if (response.ok) {
        const data = await response.json();
        setSolicitacoes(data.solicitacoes);
      }
    } catch (error) {
      console.error("Erro ao buscar solicitações:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (solicitacao: Solicitacao) => {
    setSelectedSolicitacao(solicitacao);
  };

  const handleDownloadPDF = (solicitacao: Solicitacao) => {
    const dados = JSON.parse(solicitacao.dadosFormulario);
    const doc = new jsPDF();

    // Cabeçalho
    doc.setFontSize(18);
    doc.text(solicitacao.nomeSolicitacao, 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Data: ${new Date(solicitacao.createdAt).toLocaleString('pt-BR')}`, 20, 35);

    // Dados do formulário
    let yPosition = 50;
    doc.setFontSize(12);

    Object.entries(dados).forEach(([key, value]) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      const label = key.replace(/([A-Z])/g, ' $1').trim();
      const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);

      doc.setFont(undefined, 'bold');
      doc.text(`${capitalizedLabel}:`, 20, yPosition);
      doc.setFont(undefined, 'normal');

      const valueStr = String(value || 'Não informado');
      const lines = doc.splitTextToSize(valueStr, 170);

      lines.forEach((line: string, index: number) => {
        if (index === 0) {
          doc.text(line, 20, yPosition + 7);
        } else {
          yPosition += 7;
          doc.text(line, 20, yPosition + 7);
        }
      });

      yPosition += 15;
    });

    // Salvar PDF
    doc.save(`solicitacao-${solicitacao.id}-${solicitacao.tipoSolicitacao}.pdf`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Solicitações</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Solicitações</h1>
        <Button onClick={() => setLocation("/admin")} variant="outline">
          Voltar
        </Button>
      </div>

      {selectedSolicitacao ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedSolicitacao.nomeSolicitacao}</h2>
              <div className="space-x-2">
                <Button onClick={() => handleDownloadPDF(selectedSolicitacao)}>
                  Baixar PDF
                </Button>
                <Button onClick={() => setSelectedSolicitacao(null)} variant="outline">
                  Fechar
                </Button>
              </div>
            </div>

            <div className="mb-4 text-sm text-gray-600">
              <p><strong>Data:</strong> {new Date(selectedSolicitacao.createdAt).toLocaleString('pt-BR')}</p>
              <p><strong>Tipo:</strong> {selectedSolicitacao.tipoSolicitacao}</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg">Dados do Formulário:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(JSON.parse(selectedSolicitacao.dadosFormulario)).map(([key, value]) => {
                  const isFileField = key.toLowerCase().includes('documento');
                  const isArrayOfFiles = Array.isArray(value) && value.length > 0 && typeof value[0] === 'string' && value[0].startsWith('/uploads/');

                  return (
                    <div key={key} className="border-b pb-2">
                      <p className="font-semibold text-sm text-gray-600">
                        {key.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() +
                         key.replace(/([A-Z])/g, ' $1').trim().slice(1)}:
                      </p>
                      {isArrayOfFiles ? (
                        <div className="space-y-1">
                          {(value as string[]).map((filePath, index) => (
                            <a
                              key={index}
                              href={filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm block"
                            >
                              📄 Documento {index + 1}
                            </a>
                          ))}
                        </div>
                      ) : typeof value === 'string' && value.startsWith('/uploads/') ? (
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          📄 Ver documento
                        </a>
                      ) : (
                        <p className="text-sm">{String(value || 'Não informado')}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            {solicitacoes.length === 0 ? (
              <p className="text-center text-gray-500">Nenhuma solicitação encontrada.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">ID</th>
                      <th className="text-left p-3">Tipo</th>
                      <th className="text-left p-3">Nome</th>
                      <th className="text-left p-3">Data</th>
                      <th className="text-left p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitacoes.map((solicitacao) => (
                      <tr key={solicitacao.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{solicitacao.id}</td>
                        <td className="p-3">{solicitacao.tipoSolicitacao}</td>
                        <td className="p-3">{(() => {
                          try {
                            const dados = JSON.parse(solicitacao.dadosFormulario);
                            return dados.nomeCompleto || 'N/A';
                          } catch {
                            return 'N/A';
                          }
                        })()}</td>
                        <td className="p-3">
                          {new Date(solicitacao.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-3 space-x-2">
                          <Button
                            onClick={() => handleViewDetails(solicitacao)}
                            size="sm"
                            variant="outline"
                          >
                            Visualizar
                          </Button>
                          <Button
                            onClick={() => handleDownloadPDF(solicitacao)}
                            size="sm"
                          >
                            PDF
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
