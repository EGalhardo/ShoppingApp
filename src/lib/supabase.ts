/**
 * Configuração do Supabase (Preparação)
 * 
 * NOTA: As variáveis de ambiente devem ser configuradas no futuro.
 * Atualmente o sistema usa o servidor Express local como proxy para testes offline.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

// Cliente inicializado mas não utilizado ainda para permitir testes offline puros
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * SQL SCHEMA SUGGESTION (PostgreSQL / Supabase):
 * 
 * -- Ativar RLS (Row Level Security)
 * ALTER TABLE products ENABLE ROW LEVEL SECURITY;
 * 
 * -- Política Multiempresa: Utilizador só vê dados da sua empresa
 * CREATE POLICY multi_tenant_policy ON products
 * FOR ALL TO authenticated
 * USING (empresa_id = (auth.jwt() ->> 'empresa_id')::uuid);
 * 
 * -- Índices sugeridos para escalabilidade:
 * CREATE INDEX idx_products_empresa_sync ON products (empresa_id, atualizado_em);
 * CREATE INDEX idx_orders_user_empresa ON orders (empresa_id, user_id);
 */
