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

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  quantidade: number;
  fornecedorNome?: string;
}

const RelatorioEstoque = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filteredProdutos, setFilteredProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroNome, setFiltroNome] = useState<string>("");
  const [filtroFornecedor, setFiltroFornecedor] = useState<string>("Todos");
  const [ordenarPreco, setOrdenarPreco] = useState<string>("Nenhum");

  useEffect(() => {
    fetch("http://localhost:3000/produtos")
      .then((res) => res.json())
      .then((data: Produto[]) => {
        setProdutos(data);
        setFilteredProdutos(data);
        setLoading(false);
      })
      .catch((err) => setError(`Erro ao carregar produtos: ${err.message}`));
  }, []);

  const aplicarFiltros = () => {
    let filtrados = produtos;

    if (filtroNome) {
      filtrados = filtrados.filter((produto) =>
        produto.nome.toLowerCase().includes(filtroNome.toLowerCase())
      );
    }

    if (filtroFornecedor !== "Todos") {
      filtrados = filtrados.filter(
        (produto) => produto.fornecedorNome === filtroFornecedor
      );
    }

    if (ordenarPreco === "Ascendente") {
      filtrados = filtrados.sort((a, b) => a.preco - b.preco);
    } else if (ordenarPreco === "Descendente") {
      filtrados = filtrados.sort((a, b) => b.preco - a.preco);
    }

    setFilteredProdutos(filtrados);
  };

  useEffect(() => {
    aplicarFiltros();
  }, [filtroNome, filtroFornecedor, ordenarPreco]);

  const gerarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(12);
    doc.text("Relatório de Estoque", 20, 20);
    doc.setFontSize(10);
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    doc.text(`Data de Emissão: ${dataAtual}`, 20, 30);
    doc.text("____________________________________________________________________", 20, 32);

    const startX = 20;
    const startY = 40;
    const spacingY = 10;

    doc.setFontSize(10);
    doc.text("Nome", startX, startY);
    doc.text("Descrição", startX + 40, startY);
    doc.text("Quantidade", startX + 90, startY);
    doc.text("Preço (R$)", startX + 120, startY);
    doc.text("Fornecedor", startX + 160, startY);

    filteredProdutos.forEach((produto, index) => {
      const posY = startY + (index + 1) * spacingY;
      doc.text(produto.nome, startX, posY);
      doc.text(produto.descricao || "", startX + 40, posY);
      doc.text(produto.quantidade.toString(), startX + 90, posY);
      doc.text(`R$ ${produto.preco.toFixed(2)}`, startX + 120, posY);
      doc.text(produto.fornecedorNome || "-", startX + 160, posY);
    });

    const pageHeight = doc.internal.pageSize.height;
    doc.text("____________________________________________________________________", 20, pageHeight - 20);
    doc.text("Relatório gerado automaticamente", 20, pageHeight - 10);

    doc.save("relatorio_estoque.pdf");
  };

  if (loading) return <p>Carregando relatório...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Relatório de Estoque</h2>

      {/* Filtros */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Filtrar por Nome</label>
          <input
            type="text"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="Digite o nome do produto"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Filtrar por Fornecedor</label>
          <select
            value={filtroFornecedor}
            onChange={(e) => setFiltroFornecedor(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="Todos">Todos</option>
            {Array.from(new Set(produtos.map((produto) => produto.fornecedorNome)))
              .filter((fornecedor) => fornecedor)
              .map((fornecedor) => (
                <option key={fornecedor} value={fornecedor}>
                  {fornecedor}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ordenar por Preço</label>
          <select
            value={ordenarPreco}
            onChange={(e) => setOrdenarPreco(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="Nenhum">Nenhum</option>
            <option value="Ascendente">Ascendente</option>
            <option value="Descendente">Descendente</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Fornecedor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProdutos.map((produto) => (
            <TableRow key={produto.id}>
              <TableCell>{produto.nome}</TableCell>
              <TableCell>{produto.descricao}</TableCell>
              <TableCell>{produto.quantidade}</TableCell>
              <TableCell>R$ {produto.preco.toFixed(2)}</TableCell>
              <TableCell>{produto.fornecedorNome || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Botão para exportar PDF */}
      <Button onClick={gerarPDF} className="mt-4">Exportar PDF</Button>
    </div>
  );
};

export default RelatorioEstoque;
