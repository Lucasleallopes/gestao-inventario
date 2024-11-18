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
import jsPDF from "jspdf"; // Importa biblioteca para gerar PDF (instalar com npm i jspdf)

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/produtos")
      .then((res) => res.json())
      .then((data: Produto[]) => {
        setProdutos(data);
        setLoading(false);
      })
      .catch((err) => setError(`Erro ao carregar produtos: ${err.message}`));
  }, []);

  const gerarPDF = () => {
    const doc = new jsPDF();
    
    // Configurações gerais do PDF
    doc.setFontSize(12);
    
    // Cabeçalho
    doc.text("Relatório de Estoque", 20, 20);
    doc.setFontSize(10);
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    doc.text(`Data de Emissão: ${dataAtual}`, 20, 30);
    doc.text("____________________________________________________________________", 20, 32);

    // Títulos das colunas
    const startX = 20;
    const startY = 40;
    const spacingY = 10;
    
    doc.setFontSize(10);
    doc.text("Nome", startX, startY);
    doc.text("Descrição", startX + 40, startY);
    doc.text("Quantidade", startX + 90, startY);
    doc.text("Preço (R$)", startX + 120, startY);
    doc.text("Fornecedor", startX + 160, startY);

    // Linhas dos produtos
    produtos.forEach((produto, index) => {
      const posY = startY + (index + 1) * spacingY;

      doc.text(produto.nome, startX, posY);
      doc.text(produto.descricao || "", startX + 40, posY);
      doc.text(produto.quantidade.toString(), startX + 90, posY);
      doc.text(`R$ ${produto.preco.toFixed(2)}`, startX + 120, posY);
      doc.text(produto.fornecedorNome || "-", startX + 160, posY);
    });

    // Rodapé
    const pageHeight = doc.internal.pageSize.height;
    doc.text("____________________________________________________________________", 20, pageHeight - 20);
    doc.text("Relatório gerado automaticamente", 20, pageHeight - 10);

    // Salva o arquivo
    doc.save("relatorio_estoque.pdf");
  };

  if (loading) return <p>Carregando relatório...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-bold">Relatório de Estoque</h2>
      <Button onClick={gerarPDF} className="mb-4">Exportar PDF</Button>
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
          {produtos.map((produto) => (
            <TableRow key={produto.id}>
              <TableCell>{produto.nome}</TableCell>
              <TableCell>{produto.descricao}</TableCell>
              <TableCell>{produto.quantidade}</TableCell>
              <TableCell>{produto.preco}</TableCell>
              <TableCell>{produto.fornecedorNome}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RelatorioEstoque;
