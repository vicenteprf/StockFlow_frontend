import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);

      navigate("/home", { replace: true });
    } else {
      console.error("Token não encontrado na URL.");
      navigate("/", { replace: true });
    }
  }, [searchParams, navigate]);
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Autenticando...</h2>
        <p className="text-gray-500">Aguarde enquanto processamos seu login.</p>
      </div>
    </div>
  );
}
