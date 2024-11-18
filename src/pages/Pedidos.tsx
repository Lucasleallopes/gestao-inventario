import { useState } from "react";
import { Link } from "react-router-dom";
import ListPedidos from "../components/ListPedidos";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext"; // Importando o contexto de autenticação
import RelatorioVendas from "../components/RelatorioVendas";

const Pedidos = () => {
  const { user } = useAuth(); // Obtendo o usuário autenticado
  const [mostrarRelatorio, setMostrarRelatorio] = useState(false); // Estado para controlar a visibilidade

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 ml-4">Gerenciamento de Pedidos</h1>

      {/* Botões lado a lado */}
      <div className="flex items-center ml-4 mb-4 space-x-4">
        {user && (
          <Link to="/addpedido">
            <Button>Adicionar Pedido</Button>
          </Link>
        )}
        <Button onClick={() => setMostrarRelatorio(!mostrarRelatorio)}>
          {mostrarRelatorio ? "Esconder Relatório" : "Mostrar Relatório"}
        </Button>
      </div>

      {/* Renderizar o Relatório de Vendas se `mostrarRelatorio` for verdadeiro */}
      {mostrarRelatorio && <RelatorioVendas />}

      <ListPedidos />
    </div>
  );
};

export default Pedidos;
