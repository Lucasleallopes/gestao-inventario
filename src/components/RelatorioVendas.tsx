import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import "jspdf-autotable";
import api from "@/utils/api"; // Instância do Axios configurada
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface Pedido {
  id: number;
  clienteId: number;
  status: string;
  total: number;
  data: string;
}

const RelatorioVendas = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Buscar dados de pedidos
    api.get("/pedidos")
      .then((res) => {
        setPedidos(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(`Erro ao carregar pedidos: ${err.message}`);
        setLoading(false);
      });
  }, []);

  const gerarPDF = () => {
    const doc = new jsPDF();

    // Cabeçalho do relatório
    doc.text("Relatório de Vendas", 105, 10, { align: "center" });
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 105, 20, { align: "center" });

    // Tabela com os pedidos
    (doc as any).autoTable({
      startY: 30,
      head: [["ID", "Cliente ID", "Status", "Total (R$)", "Data"]],
      body: pedidos.map((pedido) => [
        pedido.id,
        pedido.clienteId,
        pedido.status,
        pedido.total.toFixed(2),
        new Date(pedido.data).toLocaleDateString(),
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
      },
    });

    doc.save("relatorio_vendas.pdf");
  };

  if (loading) return <p>Carregando dados de vendas...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Relatório de Vendas</h2>

      {/* Tabela do relatório de vendas */}
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell>{pedido.id}</TableCell>
                <TableCell>{pedido.clienteId}</TableCell>
                <TableCell>{pedido.status}</TableCell>
                <TableCell>R$ {pedido.total.toFixed(2)}</TableCell>
                <TableCell>{new Date(pedido.data).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Botão para exportar PDF, só aparece após os dados serem carregados */}
      {pedidos.length > 0 && (
        <div className="mt-4">
          <Button onClick={gerarPDF}>Exportar PDF</Button>
        </div>
      )}
    </div>
  );
};

export default RelatorioVendas;
