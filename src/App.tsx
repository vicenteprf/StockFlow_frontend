import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Private } from "./components/ProtectedRoute.tsx";
import LoginPage from "./pages/login.tsx";
import EsqueceuSenhaPage from "./pages/esqueceuSenha.tsx";
import RedefinirSenhaPage from "./pages/redefinirSenha.tsx";
import CadastroPage from "./pages/cadastro.tsx";
import { AuthCallback } from "./pages/authCallback.tsx";
import HomePage from "./pages/home.tsx";
import CategoriaPage from "./pages/categoria.tsx";
import ProdutoPage from "./pages/produto.tsx";
import EntradaPage from "./pages/entrada.tsx";
import SaidaPage from "./pages/saida.tsx";
import EstoquePage from "./pages/estoque.tsx";
import HistoricoPage from "./pages/historico.tsx";
import DashboardPage from "./pages/dashboard.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/esqueceu-senha" element={<EsqueceuSenhaPage />} />
        <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route element={<Private />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/categoria" element={<CategoriaPage />} />
          <Route path="/produto" element={<ProdutoPage />} />
          <Route path="/entrada" element={<EntradaPage />} />
          <Route path="/saida" element={<SaidaPage />} />
          <Route path="/estoque" element={<EstoquePage />} />
          <Route path="/historico" element={<HistoricoPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
