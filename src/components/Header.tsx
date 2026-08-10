import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";

interface HeaderProps {
  texto?: string;
}

export default function Header({ texto = "" }: HeaderProps) {
  const navigate = useNavigate();
  return (
    <header>
      <div className="w-full relative flex items-center justify-center p-6 pb-4 border-b border-slate-200">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-6 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg p-2 cursor-pointer transition"
          aria-label="Voltar"
        >
          <MdArrowBack size={18} className="text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 font-serif">{texto}</h1>
      </div>
    </header>
  );
}
