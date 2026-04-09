-- ============================================================
-- Миграция: Добавление системы компаний (Шаг 1)
-- Дата: 2026-04-08
-- Описание: Новые таблицы и поля для системы компаний с режимами доступа
-- ============================================================

-- 1. Создаём таблицу company_members (связь многие-ко-многим пользователи ↔ компании)
CREATE TABLE IF NOT EXISTS company_members (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "companyId" INTEGER NOT NULL REFERENCES company(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
    "invitedAt" TIMESTAMP,
    "acceptedAt" TIMESTAMP,
    "inviteEmail" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE("userId", "companyId")
);

CREATE INDEX IF NOT EXISTS idx_company_members_user ON company_members("userId");
CREATE INDEX IF NOT EXISTS idx_company_members_company ON company_members("companyId");

-- 2. Добавляем новые поля в таблицу company
ALTER TABLE company ADD COLUMN IF NOT EXISTS ogrn VARCHAR(15);
ALTER TABLE company ADD COLUMN IF NOT EXISTS address VARCHAR(255);
ALTER TABLE company ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE company ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE company ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE company ADD COLUMN IF NOT EXISTS "logoKey" VARCHAR(255);

-- 3. Добавляем поля в таблицу users
ALTER TABLE users ADD COLUMN IF NOT EXISTS "workMode" VARCHAR(20) NOT NULL DEFAULT 'personal';
ALTER TABLE users ADD COLUMN IF NOT EXISTS "activeCompanyId" INTEGER REFERENCES company(id) ON DELETE SET NULL;

-- 4. Добавляем поля в таблицу document
ALTER TABLE document ADD COLUMN IF NOT EXISTS "companyId" INTEGER REFERENCES company(id) ON DELETE SET NULL;
ALTER TABLE document ADD COLUMN IF NOT EXISTS "isCompanyDocument" BOOLEAN NOT NULL DEFAULT false;

-- 5. Создаём enum-тип для ролей участников (если PostgreSQL требует явно)
-- Примечание: Sequelize сам создаст enum через synchronize, но для ручного применения:
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_company_members_role') THEN
        CREATE TYPE enum_company_members_role AS ENUM ('owner', 'admin', 'member');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_workMode') THEN
        CREATE TYPE enum_users_workmode AS ENUM ('personal', 'company');
    END IF;
END $$;
