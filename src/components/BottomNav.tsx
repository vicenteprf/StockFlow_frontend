import { FiHome, FiBox, FiClock, FiBarChart2 } from "react-icons/fi";
import { NavLink } from "react-router-dom";

export default function BottomNav() {
  return (
    <div>
      <nav className="flex flex-row justify-between items-center gap-2 py-4 px-6 fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `flex flex-col justify-center items-center cursor-pointer transition-colors ${
              isActive ? "text-blue-600" : "text-slate-400 hover:text-blue-600"
            }`
          }
        >
          <FiHome size={22} />
          Início
        </NavLink>

        <NavLink
          to="/estoque"
          className={({ isActive }) =>
            `flex flex-col justify-center items-center cursor-pointer transition-colors ${
              isActive ? "text-blue-600" : "text-slate-400 hover:text-blue-600"
            }`
          }
        >
          <FiBox size={22} />
          Estoque
        </NavLink>

        <NavLink
          to="/historico"
          className={({ isActive }) =>
            `flex flex-col justify-center items-center cursor-pointer transition-colors ${
              isActive ? "text-blue-600" : "text-slate-400 hover:text-blue-600"
            }`
          }
        >
          <FiClock size={22} />
          Histórico
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col justify-center items-center cursor-pointer transition-colors ${
              isActive ? "text-blue-600" : "text-slate-400 hover:text-blue-600"
            }`
          }
        >
          <FiBarChart2 size={22} />
          Dashboard
        </NavLink>
      </nav>
    </div>
  );
}
