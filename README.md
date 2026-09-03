# StockFlow

Aplicação web de controle de estoque para uso pessoal ou pequenas equipes (até 5 usuários). Desenvolvida como projeto de curso de desenvolvimento full stack.

---

## Funcionalidades

- Cadastro e login com e-mail/senha ou conta Google (OAuth)
- Controle de acesso por equipe: um administrador e até 4 convidados compartilham o mesmo estoque
- Cadastro de categorias e produtos com código gerado automaticamente
- Registro de entradas e saídas com preço, validade, fornecedor e motivo
- Histórico de movimentações com filtros por tipo e busca por produto
- Estoque em tempo real com alertas de validade próxima e produtos vencidos
- Dashboard com totais por período, gráfico de entradas mensais e ranking de categorias por gasto
- Gestão de equipe: convidar membros e remover convidados (apenas administrador)

---

## Stack

**Frontend**

- React + TypeScript (Vite)
- Tailwind CSS v4
- Axios com interceptor JWT
- React Router DOM v7
- Recharts
- date-fns
- react-hot-toast
- react-icons

**Backend**

- Node.js + Express 5 + TypeScript
- Prisma ORM + PostgreSQL (Supabase)
- Zod (validação)
- JWT + bcrypt
- Passport.js + Google OAuth 2.0
- Deployado na Vercel

---

## Arquitetura

```
Frontend (React)
    ↓ Axios + JWT
Backend (Express)
    ↓ Prisma
PostgreSQL (Supabase)
```

O backend segue arquitetura em camadas: `routes → controller → service → Prisma`. Toda autorização é feita na camada de serviço, com escopo por equipe via `adminId`.

---

## Rotas da API

Base URL: `https://9-stock-flow-backend.vercel.app`

| Método | Rota               | Descrição                             |
| ------ | ------------------ | ------------------------------------- |
| POST   | `/auth`            | Login com e-mail e senha              |
| GET    | `/auth/google`     | Iniciar autenticação com Google       |
| POST   | `/usuario`         | Criar conta de administrador          |
| POST   | `/usuario/convite` | Convidar membro para a equipe         |
| GET    | `/usuario`         | Listar membros da equipe              |
| DELETE | `/usuario/:id`     | Remover membro da equipe              |
| GET    | `/categoria`       | Listar categorias                     |
| POST   | `/categoria`       | Criar categoria                       |
| PUT    | `/categoria/:id`   | Atualizar categoria                   |
| DELETE | `/categoria/:id`   | Remover categoria                     |
| GET    | `/produto`         | Listar produtos com estoque calculado |
| POST   | `/produto`         | Cadastrar produto                     |
| PUT    | `/produto/:id`     | Atualizar produto                     |
| DELETE | `/produto/:id`     | Remover produto                       |
| GET    | `/movimentacao`    | Listar movimentações                  |
| POST   | `/movimentacao`    | Registrar entrada ou saída            |

Todas as rotas (exceto login, cadastro e OAuth) exigem token JWT no header `Authorization: Bearer <token>`.

---

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- npm

### Frontend

```bash
# Clone o repositório
git clone https://github.com/vicenteprf/StockFlow_frontend
cd stockflow-frontend
# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Preencha VITE_API_URL com a URL do backend

# Rode em desenvolvimento
npm run dev
```

### Variáveis de ambiente

```env
VITE_API_URL=https://9-stock-flow-backend.vercel.app
```

---

## Regras de negócio

- Todo usuário criado via cadastro recebe o papel de `ADMIN`
- O admin pode convidar até 4 membros (`USER`) para sua equipe
- Membros convidados enxergam e interagem com o mesmo estoque do admin
- Nenhum dado é compartilhado entre equipes diferentes
- Saídas são bloqueadas se o saldo em estoque for insuficiente
- O preço exibido em saídas é herdado da última entrada registrada para aquele produto
- Apenas o admin pode convidar e remover membros

---

## Aprendizados

- Autorização deve ser aplicada na camada de serviço, não apenas nas rotas
- Helpers reutilizáveis (`getAdminIdBase`) evitam lógica espalhada e inconsistente
- OAuth exige atribuição explícita de papel — defaults silenciosos causam bugs
- Includes do Prisma precisam ser explícitos para relações aninhadas
- Variáveis de ambiente no Vite exigem o prefixo `VITE_`
- O cliente gerado pelo Prisma não deve estar no `.gitignore` em deploys na Vercel
