import { formatarDataExtensa } from "../utils/formatters";
import type { DetalhesMovimentacaoProps } from "../types";

export default function ModalDetalhesMovimentacao({
  movimentacao,
  onClose,
}: DetalhesMovimentacaoProps) {
  if (!movimentacao || movimentacao.tipo !== "ENTRADA") return null;

  const { produto, quantidade, preco, criado, observacao } = movimentacao;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl flex flex-col gap-4 relative animate-fade-in">
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              Entrada
            </span>
            <h3 className="text-lg font-bold text-slate-800 mt-1">
              {produto?.nome || "Produto sem nome"}
            </h3>
            {produto?.codigo && (
              <p className="text-xs text-slate-400">Código: {produto.codigo}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">
              Categoria
            </p>
            <p className="font-medium text-slate-700">
              {produto?.categoria?.nome || "Sem categoria"}
            </p>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">
              Descrição / Marca
            </p>
            <p className="font-medium text-slate-700">
              {produto?.descricao || "-"}
            </p>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">
              Preço Unitário
            </p>
            <p className="font-medium text-slate-700">
              {preco
                ? `R$ ${Number(preco).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`
                : "R$ 0,00"}
            </p>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">
              Quantidade
            </p>
            <p className="font-medium text-slate-700">{quantidade} unid.</p>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-2">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">
              Fornecedor
            </p>
            <p className="font-medium text-slate-700">
              {observacao || "Não informado"}
            </p>
          </div>

          <div className="col-span-2 pt-1 text-right">
            <p className="text-[11px] text-slate-400">
              Registrado em {formatarDataExtensa(criado)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
