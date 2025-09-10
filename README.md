# Influencer Chat App - Next.js

Este projeto foi convertido de React para Next.js, mantendo toda a funcionalidade original de chat com influenciadores AI.

## 🚀 Funcionalidades

- **Autenticação**: Sistema completo de login/registro com Supabase
- **Chat em Tempo Real**: Conversas com influenciadores AI usando OpenAI
- **Perfis de Usuário**: Gerenciamento de perfil e configurações
- **Interface Responsiva**: Design otimizado para mobile e desktop
- **Temas**: Suporte a modo escuro/claro

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- Chave da API OpenAI

## ⚙️ Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Renomeie `.env.local` e configure as seguintes variáveis:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_supabase

# OpenAI Configuration
OPENAI_API_KEY=sua_chave_openai
OPENAI_MODEL=gpt-4o-mini
```

### 3. Configurar Banco de Dados Supabase

Execute os seguintes comandos SQL no seu projeto Supabase:

```sql
-- Tabela de usuários
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de influenciadores
CREATE TABLE influencers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  model_preset JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens de chat
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  influencer_id UUID REFERENCES influencers(id) NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'influencer')),
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Política para usuários
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para mensagens de chat
CREATE POLICY "Users can view own messages" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 🏃‍♂️ Executando o Projeto

### Modo Desenvolvimento
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
npm start
```

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   └── post-message/
│   │       └── route.ts          # API route para envio de mensagens
│   ├── globals.css               # Estilos globais
│   ├── layout.tsx               # Layout principal
│   └── page.tsx                 # Página principal (App convertido)
├── components/
│   ├── Auth/                    # Componentes de autenticação
│   ├── Chat/                    # Componentes de chat
│   ├── Settings/                # Componentes de configurações
│   └── ui/                      # Componentes de UI
├── lib/
│   ├── supabaseClient.ts        # Cliente Supabase
│   ├── chatCache.ts             # Cache de chat
│   └── utils.ts                 # Utilitários
└── api/
    └── index.ts                 # API client
```

## 🔄 Principais Mudanças da Conversão

### React Router → Next.js App Router
- Removido `react-router-dom`
- Sistema de navegação baseado em estado mantido na página principal
- API routes do Next.js para endpoints backend

### Vite → Next.js
- Configuração de build migrada para Next.js
- Variáveis de ambiente adaptadas para padrão Next.js (`NEXT_PUBLIC_`)
- Sistema de importação atualizado para aliases do Next.js

### TypeScript
- Todos os arquivos `.jsx` convertidos para `.tsx`
- Tipos TypeScript adicionados onde necessário
- Configuração ESLint ajustada para Next.js

## 🛠️ Tecnologias Utilizadas

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Supabase** - Backend e autenticação
- **OpenAI API** - IA para respostas dos influenciadores
- **Radix UI** - Componentes de UI
- **Framer Motion** - Animações

## 🐛 Solução de Problemas

### Erro de Build
Se encontrar erros durante o build, verifique:
1. Todas as variáveis de ambiente estão configuradas
2. As dependências estão instaladas corretamente
3. O banco de dados Supabase está configurado

### Problemas de Autenticação
- Verifique se as URLs do Supabase estão corretas
- Confirme que as políticas RLS estão ativas
- Teste a conectividade com o Supabase

### Problemas com IA
- Verifique se a chave da OpenAI está válida
- Confirme se há créditos disponíveis na conta OpenAI
- Teste a API diretamente se necessário

## 📝 Notas de Desenvolvimento

- O projeto mantém compatibilidade total com a versão React original
- Todas as funcionalidades foram preservadas na migração
- O sistema de cache de chat foi mantido para performance
- A estrutura de componentes permanece inalterada

## 🤝 Contribuição

Para contribuir com o projeto:
1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
