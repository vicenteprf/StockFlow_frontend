import { useState } from "react";
import type { DetalhesProdutosProps, Filtro } from "../types/index";
import { formatarValidade, formatarMoeda } from "../utils/formatters";
import { differenceInDays, startOfDay, parseISO } from "date-fns";

export default function ModalValidade({
  produtosVencendo,
  produtosVencido,
  movimentacoes,
  onClose,
}: DetalhesProdutosProps) {
  const [filtro, setFiltro] = useState<Filtro>("Proximo do vencimento");

  const filtroProdutos =
    filtro === "Proximo do vencimento" ? produtosVencendo : produtosVencido;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl flex flex-col gap-4 relative animate-fade-in">
        <div className="flex flex-col justify-between items-start gap-3 border-b border-slate-100 pb-3">
          <div className="w-full flex flex-row justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 mt-1">
              Validade dos produtos
            </h3>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover-text-slate-600 font-bold text-lg p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="w-full max-w-full flex flex-row justify-start items-center gap-2">
            <button
              onClick={() => setFiltro("Proximo do vencimento")}
              className={`w-full whitespace-nowrap font-semibold border border-slate-200/70 p-1 rounded-lg cursor-pointer ${filtro === "Proximo do vencimento" ? "bg-amber-200/40 text-amber-700 border-amber-300/80" : "text-amber-700/70"}`}
            >
              Próximo ao vencimento
            </button>
            <button
              onClick={() => setFiltro("vencido")}
              className={`w-full font-semibold border border-slate-200/70 p-1 rounded-lg  cursor-pointer ${filtro === "vencido" ? "bg-red-200/40 text-red-700 border-red-300/80" : "text-red-700/70"}`}
            >
              Vencidos
            </button>
          </div>

          {filtroProdutos.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400">
              {filtro === "Proximo do vencimento"
                ? "Nenhum produto próximo ao vencimento."
                : "Nenhum produto vencido."}
            </div>
          ) : (
            <div className="w-full flex flex-col gap-2 pt-2 border-t border-slate-100">
              {filtroProdutos.map((prod) => {
                if (!prod.validade || (prod.quantidadeEstoque || 0) <= 0)
                  return null;

                const hoje = startOfDay(new Date());
                const dataValidade = startOfDay(parseISO(prod.validade));
                const diasAVencer = differenceInDays(dataValidade, hoje);

                const movComPreco = movimentacoes.find(
                  (mov) => mov.produto?.id === prod.id && mov.preco !== null,
                );

                const precoUnitario = movComPreco?.preco || 0;

                return (
                  <div
                    key={prod.id}
                    className="flex justify-between items-center rounded-xl text-xs"
                  >
                    <div className="flex flex-col gap-1 text-left">
                      <p className="whitespace-nowrap text-sm text-slate-400 uppercase font-semibold">
                        {prod.nome}
                      </p>
                      <p className="text-xs font-medium text-slate-700">
                        {prod.codigo} - {prod.categoria?.nome} -{" "}
                        {formatarMoeda(precoUnitario)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 text-right">
                      <p
                        className={` rounded-xl px-2 py-1 text-center  self-end ${filtro === "Proximo do vencimento" ? " text-amber-700 bg-amber-100" : "text-red-700 bg-red-100"}`}
                      >
                        {diasAVencer > 1
                          ? `${diasAVencer} dias`
                          : diasAVencer < 0
                            ? "Vencido"
                            : `${diasAVencer} dia`}
                      </p>
                      <p className="font-medium text-slate-700">
                        {formatarValidade(prod.validade)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
