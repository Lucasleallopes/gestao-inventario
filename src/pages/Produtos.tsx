import { Link } from "react-router-dom";
import ListOfResult from "../components/ListOfResult";
import RelatorioEstoque from "../components/RelatorioEstoque";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Produtos = () => {
  const [mostrarRelatorio, setMostrarRelatorio] = useState(false);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Produtos</h1>
      <div className="mb-4 flex space-x-4">
        <Link to="/add">
          <Button>Adicionar Produto</Button>
        </Link>
        <Button onClick={() => setMostrarRelatorio(!mostrarRelatorio)}>
          {mostrarRelatorio ? "Ocultar Relatório" : "Exibir Relatório"}
        </Button>
      </div>
      {mostrarRelatorio && <RelatorioEstoque />}
      <ListOfResult />
    </div>
  );
};

export default Produtos;
