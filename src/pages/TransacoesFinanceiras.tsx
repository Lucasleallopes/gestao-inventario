import { Link } from "react-router-dom";
import ListTransacoes from "../components/ListTransacoes";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import RelatorioTransacoes from "../components/RelatorioTransacao"; // Importar o componente de relatório
import { useState } from "react"; // Importar useState

const TransacoesFinanceiras = () => {
  const { user } = useAuth(); // Obtendo o usuário autenticado
  const [showRelatorio, setShowRelatorio] = useState(false); // Estado para controlar visibilidade

  const toggleRelatorio = () => {
    setShowRelatorio((prev) => !prev);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 ml-4">Gerenciamento de Transações Financeiras</h1>

      {/* Botões para admin */}
      {user && user.role === "admin" && (
        <div className="ml-4 flex space-x-4 mb-4">
          <Link to="/transacoes/new">
            <Button>Adicionar Transação</Button>
          </Link>

          {/* Botão para alternar visibilidade do relatório */}
          <Button onClick={toggleRelatorio}>
            {showRelatorio ? "Esconder Relatório" : "Mostrar Relatório"}
          </Button>
        </div>
      )}

      {/* Renderizar o relatório somente se showRelatorio for true */}
      {showRelatorio && <RelatorioTransacoes />}

      <ListTransacoes />
    </div>
  );
};

export default TransacoesFinanceiras;
