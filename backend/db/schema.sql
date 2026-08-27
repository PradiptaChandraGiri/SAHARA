-- SAHARA database schema for Neon Postgres.
-- Run this once against your database:
--   psql "$DATABASE_URL" -f schema.sql

-- ---------------------------------------------------------------
-- Users & roles
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT UNIQUE NOT NULL,
    display_name    TEXT,
    oauth_provider  TEXT NOT NULL CHECK (oauth_provider IN ('google', 'github')),
    oauth_id        TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'counselor', 'admin')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at   TIMESTAMPTZ,
    UNIQUE (oauth_provider, oauth_id)
);

-- ---------------------------------------------------------------
-- Check-ins: raw answers a student submits (Steps 1-5)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS checkins (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    age                     NUMERIC,
    gender                  TEXT,
    academic_year           NUMERIC,
    department              TEXT,
    sleep_hours             NUMERIC,
    study_hours_per_day     NUMERIC,
    exam_pressure           NUMERIC,
    academic_performance    NUMERIC,
    stress_level            NUMERIC,
    physical_activity       NUMERIC,
    social_support          NUMERIC,
    screen_time             NUMERIC,
    internet_usage          NUMERIC,
    financial_stress        NUMERIC,
    family_expectation      NUMERIC,
    submitted_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_checkins_user ON checkins(user_id, submitted_at DESC);

-- ---------------------------------------------------------------
-- Results: model output for a given check-in
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS results (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkin_id          UUID NOT NULL REFERENCES checkins(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    overall_wellbeing   NUMERIC NOT NULL,
    anxiety_signal      NUMERIC NOT NULL,
    academic_strain     NUMERIC NOT NULL,
    risk_level          TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high')),
    contributing_factors TEXT[] NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_results_user ON results(user_id, created_at DESC);

-- ---------------------------------------------------------------
-- Curated resource library (replaces the frontend mock array)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resources (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factor_key   TEXT NOT NULL,   -- e.g. 'high_exam_pressure', 'insufficient_sleep'
    title        TEXT NOT NULL,
    description  TEXT,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('video', 'article')),
    url          TEXT NOT NULL,
    active       BOOLEAN NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS idx_resources_factor ON resources(factor_key) WHERE active = true;

-- ---------------------------------------------------------------
-- Counselor case notes / triage tracking
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS case_notes (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    counselor_id   UUID NOT NULL REFERENCES users(id),
    note           TEXT NOT NULL,
    status         TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'contacted', 'referred', 'resolved')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_case_notes_student ON case_notes(student_id, created_at DESC);

-- ---------------------------------------------------------------
-- Audit log: who viewed which student's data, when
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id     UUID NOT NULL REFERENCES users(id),
    actor_role   TEXT NOT NULL,
    action       TEXT NOT NULL,          -- e.g. 'view_student_results'
    target_id    UUID,                    -- the student/record being accessed
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor_id, created_at DESC);

-- ---------------------------------------------------------------
-- WhatsApp bot sessions (tracks Twilio conversation state per number)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number    TEXT UNIQUE NOT NULL,
    user_id         UUID REFERENCES users(id),
    current_step    TEXT NOT NULL DEFAULT 'start',
    answers         JSONB NOT NULL DEFAULT '{}',
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- AI chat messages (for context + the "route sensitive topics away
-- from freeform Gemini" rule from the earlier spec)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role          TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content       TEXT NOT NULL,
    flagged_crisis BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id, created_at);

-- Seed a starter set of curated resources (expand freely)
INSERT INTO resources (factor_key, title, description, resource_type, url) VALUES
('high_exam_pressure', '5-Minute Breathing Reset Before Exams', 'A short guided breathing exercise for pre-exam nerves.', 'video', 'https://www.youtube.com/results?search_query=5+minute+breathing+exercise+exam+anxiety'),
('high_exam_pressure', 'The Pomodoro Method for Study Sessions', 'A simple technique for breaking study time into focused blocks.', 'video', 'https://www.youtube.com/results?search_query=pomodoro+technique+study'),
('high_screen_time', 'Building a Wind-Down Routine', 'Practical steps to reduce evening screen time before sleep.', 'video', 'https://www.youtube.com/results?search_query=evening+wind+down+routine'),
('insufficient_sleep', 'Sleep Hygiene Basics', 'Evidence-based habits for more consistent, restful sleep.', 'article', 'https://www.sleepfoundation.org/sleep-hygiene'),
('low_social_support', 'Finding Your Campus Community', 'Ideas for building connection when you feel isolated.', 'article', 'https://www.youtube.com/results?search_query=building+social+connection+college')
ON CONFLICT DO NOTHING;
