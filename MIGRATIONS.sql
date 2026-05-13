-- ─── ChikJov — Migrações pendentes ───────────────────────────────────────────
-- Rode estes comandos no Supabase Dashboard → SQL Editor

-- Adiciona suporte a imagem mobile separada no carrossel hero
ALTER TABLE hero_slides
  ADD COLUMN IF NOT EXISTS mobile_image_url TEXT;

COMMENT ON COLUMN hero_slides.mobile_image_url IS
  'URL da imagem otimizada para mobile (1080x1350). Se NULL, usa image_url como fallback.';
