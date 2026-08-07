import { FcGoogle } from "react-icons/fc";

interface BotaoGoogleProps {
  texto?: string;
}

export default function BotaoGoogle({
  texto = "Entrar com o Google",
}: BotaoGoogleProps) {
  const handleGoogle = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <button
      onClick={handleGoogle}
      className="w-full py-3 px-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition cursor-pointer"
    >
      <FcGoogle size={20} />
      {texto}
    </button>
  );
}
