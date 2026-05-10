-- ============================================================
-- 007_embedding_model_column.sql
-- Записва кой embedding модел е генерирал всеки ред в content_chunks.
-- Защитава от мълчаливо смесване на vector spaces при бъдеща смяна на модела.
-- ============================================================

alter table public.content_chunks
  add column if not exists embedding_model text not null default 'gemini-embedding-001';

-- Backfill: всички съществуващи редове са от gemini-embedding-001 (768 dims, MRL truncation).
update public.content_chunks
  set embedding_model = 'gemini-embedding-001'
  where embedding_model is null
     or embedding_model = '';

create index if not exists content_chunks_embedding_model_idx
  on public.content_chunks (embedding_model);
