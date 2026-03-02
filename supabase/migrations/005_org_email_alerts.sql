-- 005: Agregar campo email_alerts_enabled a organizations
-- Controla si se envian notificaciones por email cuando el stock baja del minimo

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS email_alerts_enabled boolean NOT NULL DEFAULT true;
