import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

interface Transacao {
  id: number;
  tipo: "Entrada" | "Saída";
  valor: number;
  data: string;
  produtoNome?: string;
  pedidoNome?: string;
}

const RelatorioTransacoes = () => {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [filteredTransacoes, setFilteredTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroTipo, setFiltroTipo] = useState<"Todos" | "Entrada" | "Saída">("Todos");
  const [filtroData, setFiltroData] = useState<string>("");

  useEffect(() => {
    fetch("http://localhost:3000/transacoes")
      .then((res) => res.json())
      .then((data: Transacao[]) => {
        setTransacoes(data);
        setFilteredTransacoes(data);
        setLoading(false);
      })
      .catch((err) => setError(`Erro ao carregar transações: ${err.message}`));
  }, []);

  const aplicarFiltros = () => {
    let filtradas = transacoes;

    if (filtroTipo !== "Todos") {
      filtradas = filtradas.filter((t) => t.tipo === filtroTipo);
    }

    if (filtroData) {
      filtradas = filtradas.filter(
        (t) => new Date(t.data).toLocaleDateString("pt-BR") === filtroData
      );
    }

    setFilteredTransacoes(filtradas);
  };

  useEffect(() => {
    aplicarFiltros();
  }, [filtroTipo, filtroData]);

  const gerarPDF = () => {
    const doc = new jsPDF();

    
    doc.setFontSize(12);
    doc.text("Relatório de Transações Financeiras", 20, 20);
    doc.setFontSize(10);
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    doc.text(`Data de Emissão: ${dataAtual}`, 20, 30);
    doc.text("____________________________________________________________________", 20, 32);

    
    const startX = 20;
    const startY = 40;
    const spacingY = 10;

    doc.text("Data", startX, startY);
    doc.text("Tipo", startX + 40, startY);
    doc.text("Valor (R$)", startX + 80, startY);
    doc.text("Produto", startX + 120, startY);
    doc.text("Pedido", startX + 160, startY);

    
    filteredTransacoes.forEach((transacao, index) => {
      const posY = startY + (index + 1) * spacingY;

      doc.text(
        new Date(transacao.data).toLocaleDateString("pt-BR", { timeZone: "UTC" }),
        startX,
        posY
      );
      doc.text(transacao.tipo, startX + 40, posY);
      doc.text(`R$ ${transacao.valor.toFixed(2)}`, startX + 80, posY);
      doc.text(transacao.produtoNome || "-", startX + 120, posY);
      doc.text(transacao.pedidoNome || "-", startX + 160, posY);
    });

    
    const pageHeight = doc.internal.pageSize.height;
    doc.text("____________________________________________________________________", 20, pageHeight - 20);
    doc.text("Relatório gerado automaticamente", 20, pageHeight - 10);

    
    doc.save("relatorio_transacoes.pdf");
  };

  if (loading) return <p>Carregando relatório...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-bold">Relatório de Transações Financeiras</h2>

      {/* Filtros */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1"></label>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as "Todos" | "Entrada" | "Saída")}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="Todos">Todos</option>
            <option value="Entrada">Entrada</option>
            <option value="Saída">Saída</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1"></label>
          <input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
      </div>

      {/* Tabela */}
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Pedido</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTransacoes.map((transacao) => (
            <TableRow key={transacao.id}>
              <TableCell>
                {new Date(transacao.data).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
              </TableCell>
              <TableCell>{transacao.tipo}</TableCell>
              <TableCell>R$ {transacao.valor.toFixed(2)}</TableCell>
              <TableCell>{transacao.produtoNome || "-"}</TableCell>
              <TableCell>{transacao.pedidoNome || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={gerarPDF} className="mb-4">
        Exportar PDF
      </Button>
    </div>
  );
};

export default RelatorioTransacoes;
