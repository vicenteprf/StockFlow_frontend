import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Private } from "./components/ProtectedRoute.tsx";
import LoginPage from "./pages/login.tsx";
import CadastroPage from "./pages/cadastro.tsx";
import HomePage from "./pages/home.tsx";

function App() {
  const tokenSalvo = localStorage.getItem("token");
  const user = { logado: Boolean(tokenSalvo), cargo: "user" };
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route element={<Private autorizado={user.logado} />}>
          <Route path="/home" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
