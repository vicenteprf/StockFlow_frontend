export interface Categoria {
  id: number;
  nome: string;
}

export interface Produto {
  id: number;
  codigo: number;
  nome: string;
  descricao?: string;
  categoriaId: number;
  categoria?: { id: number; nome: string };
  quantidadeEstoque: number;
  validade: string | null;
}

export interface Movimentacao {
  id: number;
  tipo: "ENTRADA" | "SAIDA";
  quantidade: number;
  motivo: string | null;
  preco: number | null;
  criado: string;
  produto: {
    id: number;
    codigo: number;
    nome: string;
    categoriaId: number;
  };
}

export interface DashboardStats {
  entradasValor: number;
  entradasPercentual: number;
  saidasValor: number;
  saidasPercentual: number;
  entradasQtd: number;
  saidasQtd: number;
}

export interface ChartItem {
  mes: string;
  valor: number;
  ativo: boolean;
}

export interface CategoriaGasto {
  categoriaId: number;
  nome: string;
  valorTotal: number;
  porcentagem: number;
}

type Role = "USER" | "ADMIN";

export interface Usuario {
  id: number;
  nome: string;
  email?: string;
  role?: Role;
}
