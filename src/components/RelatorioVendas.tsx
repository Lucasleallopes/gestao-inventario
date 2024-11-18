import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import "jspdf-autotable";
import api from "@/utils/api"; 
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
  const [filteredPedidos, setFilteredPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroClienteId, setFiltroClienteId] = useState<string>("");
  const [filtroStatus, setFiltroStatus] = useState<string>("Todos");
  const [ordenarTotal, setOrdenarTotal] = useState<string>("Nenhum");

  useEffect(() => {
    
    api.get("/pedidos")
      .then((res) => {
        setPedidos(res.data);
        setFilteredPedidos(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(`Erro ao carregar pedidos: ${err.message}`);
        setLoading(false);
      });
  }, []);

  const aplicarFiltros = () => {
    let filtrados = pedidos;

    if (filtroClienteId) {
      filtrados = filtrados.filter((pedido) =>
        pedido.clienteId.toString().includes(filtroClienteId)
      );
    }

    if (filtroStatus !== "Todos") {
      filtrados = filtrados.filter((pedido) => pedido.status === filtroStatus);
    }

    if (ordenarTotal === "Ascendente") {
      filtrados = filtrados.sort((a, b) => a.total - b.total);
    } else if (ordenarTotal === "Descendente") {
      filtrados = filtrados.sort((a, b) => b.total - a.total);
    }

    setFilteredPedidos(filtrados);
  };

  useEffect(() => {
    aplicarFiltros();
  }, [filtroClienteId, filtroStatus, ordenarTotal]);

  const gerarPDF = () => {
    const doc = new jsPDF();

    
    doc.text("Relatório de Vendas", 105, 10, { align: "center" });
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 105, 20, { align: "center" });

    
    (doc as any).autoTable({
      startY: 30,
      head: [["ID", "Cliente ID", "Status", "Total (R$)", "Data"]],
      body: filteredPedidos.map((pedido) => [
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

      {/* Filtros */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Filtrar por Cliente ID</label>
          <input
            type="text"
            value={filtroClienteId}
            onChange={(e) => setFiltroClienteId(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="Digite o ID do cliente"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Filtrar por Status</label>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="Todos">Todos</option>
            <option value="Pendente">Pendente</option>
            <option value="Concluído">Concluído</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ordenar por Total</label>
          <select
            value={ordenarTotal}
            onChange={(e) => setOrdenarTotal(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="Nenhum">Nenhum</option>
            <option value="Ascendente">Ascendente</option>
            <option value="Descendente">Descendente</option>
          </select>
        </div>
      </div>

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
            {filteredPedidos.map((pedido) => (
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

      {/* Botão para exportar PDF */}
      {filteredPedidos.length > 0 && (
        <div className="mt-4">
          <Button onClick={gerarPDF}>Exportar PDF</Button>
        </div>
      )}
    </div>
  );
};

export default RelatorioVendas;
