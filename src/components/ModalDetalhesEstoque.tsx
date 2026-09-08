import { useState, useEffect } from "react";
import { api } from "../services/api";
import {
  formatarValidade,
  formatarMoeda,
  formatarDataExtensa,
} from "../utils/formatters";
import type { DetalhesEstoqueProps, Movimentacao } from "../types";

export default function ModalDetalhesEstoque({
  produto,
  onClose,
}: DetalhesEstoqueProps) {
  const [ultimasEntradas, setUltimasEntrada] = useState<Movimentacao[]>([]);
  const [carregandoEntradas, setCarregandoEntradas] = useState(false);

  useEffect(() => {
    if (!produto?.id) return;

    let ativo = true;

    async function buscarUltimasEntradas() {
      try {
        setCarregandoEntradas(true);
        const response = await api.get("/movimentacao");

        if (ativo && response.data) {
          const entradasDoProduto = response.data.filter(
            (mov: Movimentacao) =>
              mov.produto.id === produto?.id && mov.tipo === "ENTRADA",
          );

          const ultimasEntradas = entradasDoProduto
            .sort(
              (a: Movimentacao, b: Movimentacao) =>
                new Date(b.criado).getTime() - new Date(a.criado).getTime(),
            )
            .slice(0, 3);

          setUltimasEntrada(ultimasEntradas);
        }
      } catch (e) {
        console.error("Erro ao carregar histórico de entradas:", e);
      } finally {
        if (ativo) setCarregandoEntradas(false);
      }
    }

    buscarUltimasEntradas();

    return () => {
      ativo = false;
    };
  }, [produto]);

  if (!produto) return null;

  const { nome, validade, quantidadeEstoque, codigo } = produto;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl flex flex-col gap-4 relative animate-fade-in">
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mt-1">{nome}</h3>
            <p className="text-xs text-slate-400">Código: {codigo}</p>
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
              {produto?.categoria?.nome}
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
              Quantidade
            </p>
            <p className="font-medium text-slate-700">
              {quantidadeEstoque} unid.
            </p>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">
              Validade
            </p>
            <p className="font-medium text-slate-700">
              {formatarValidade(validade)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Últimas Entradas (Preço/Qtd)
          </p>

          {carregandoEntradas ? (
            <div className="py-4 text-center text-xs text-slate-400">
              Carregando histórico...
            </div>
          ) : ultimasEntradas.length === 0 ? (
            <div className="py-3 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
              Nenhuma entrada registrada.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {ultimasEntradas.map((entrada) => (
                <div
                  key={entrada.id}
                  className="flex justify-between items-center bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-xl text-xs"
                >
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-emerald-800">
                      {formatarMoeda(Number(entrada.preco) || 0)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatarDataExtensa(entrada.criado)} -{" "}
                      {entrada.observacao}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-semibold text-slate-700">
                      +{entrada.quantidade} unid.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
