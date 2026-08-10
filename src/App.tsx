import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Private } from "./components/ProtectedRoute.tsx";
import LoginPage from "./pages/login.tsx";
import CadastroPage from "./pages/cadastro.tsx";
import { AuthCallback } from "./pages/authCallback.tsx";
import HomePage from "./pages/home.tsx";
import CategoriaPage from "./pages/categoria.tsx";

function App() {
  const tokenSalvo = localStorage.getItem("token");
  const user = { logado: Boolean(tokenSalvo), cargo: "user" };
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route element={<Private autorizado={user.logado} />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/categoria" element={<CategoriaPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
