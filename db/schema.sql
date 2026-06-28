-- ============================================================
--  PWA Gestion de formations — Schéma de base de données (MVP)
--  Base : PostgreSQL (via Supabase)
--  Étape 2 du projet — PROPOSITION (à valider avant application)
-- ============================================================
--
--  Conventions utilisées (expliquées simplement) :
--    * id           : identifiant unique de chaque ligne (uuid = code unique généré tout seul)
--    * created_at   : date de création de la ligne (remplie automatiquement)
--    * updated_at   : date de dernière modification
--    * *_id         : un "fil" qui pointe vers une autre table (clé étrangère)
--    * CHECK (...)  : une règle qui interdit les valeurs interdites
--    * NOT NULL     : champ obligatoire
--    * UNIQUE       : valeur qui ne peut pas exister en double
--
--  Tables marquées [MVP]   = utilisées tout de suite.
--  Tables marquées [PLUS TARD] = créées maintenant mais exploitées après le MVP.
-- ============================================================

-- Extension qui permet de générer des identifiants uuid automatiquement.
create extension if not exists "pgcrypto";


-- ============================================================
-- 1. USERS [MVP] — les comptes administrateurs (toi)
-- ------------------------------------------------------------
-- Rôle : savoir QUI peut se connecter à l'application.
-- Note : l'authentification (mot de passe) est gérée par Supabase Auth
--        dans une table cachée "auth.users". Ici on garde juste le profil.
-- ============================================================
create table public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null unique,
  full_name   text,
  role        text not null default 'admin'
              check (role in ('admin')),          -- un seul rôle pour le MVP
  created_at  timestamptz not null default now()
);


-- ============================================================
-- 2. ORGANIZATIONS [PLUS TARD] — les entreprises / employeurs
-- ------------------------------------------------------------
-- Rôle : regrouper des personnes qui appartiennent à une même structure
--        (ex. financement par l'employeur). Optionnel pour une personne.
-- ============================================================
create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  siret       text,                                -- numéro d'entreprise (France)
  email       text,
  phone       text,
  address     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);


-- ============================================================
-- 3. PEOPLE [MVP] — les personnes (prospects et clients)
-- ------------------------------------------------------------
-- Rôle : le cœur du CRM. Toutes les personnes que tu suis.
-- Relation : peut appartenir à une organisation (facultatif).
-- ============================================================
create table public.people (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid references public.organizations (id) on delete set null,
  first_name       text not null,
  last_name        text not null,
  email            text,
  phone            text,
  status           text not null default 'prospect'
                   check (status in ('prospect', 'inscrit', 'client', 'archive')),
  source           text,                           -- ex : 'site web', 'bouche à oreille', 'salon'
  notes            text,                           -- note rapide (l'historique détaillé = table notes)
  consent          boolean not null default false, -- RGPD : a donné son accord ?
  consent_date     timestamptz,                    -- quand l'accord a été donné
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);


-- ============================================================
-- 4. TRAINERS [PLUS TARD] — les formateurs
-- ------------------------------------------------------------
-- Rôle : qui anime les sessions. Pour le MVP tu es seul, mais on
--        prévoit la table pour le futur.
-- ============================================================
create table public.trainers (
  id          uuid primary key default gen_random_uuid(),
  first_name  text not null,
  last_name   text not null,
  email       text,
  phone       text,
  bio         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);


-- ============================================================
-- 5. COURSES [MVP] — les formations (le catalogue)
-- ------------------------------------------------------------
-- Rôle : décrire une formation "modèle" (nom, prix, type...).
-- ============================================================
create table public.courses (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  type         text,                               -- ex : 'présentiel', 'distanciel', 'mixte'
  price        numeric(10,2) not null default 0    -- montant en euros, 2 décimales
               check (price >= 0),
  status       text not null default 'brouillon'
               check (status in ('brouillon', 'ouverte', 'fermee', 'archivee')),
  start_date   date,
  end_date     date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- la date de fin ne peut pas être avant la date de début
  check (end_date is null or start_date is null or end_date >= start_date)
);


-- ============================================================
-- 6. SESSIONS [MVP léger] — les dates concrètes d'une formation
-- ------------------------------------------------------------
-- Rôle : une même formation (course) peut être donnée plusieurs fois.
--        Chaque "session" = une occurrence datée.
-- Relation : appartient à UNE formation, animée par UN formateur (facultatif).
-- ============================================================
create table public.sessions (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses (id) on delete cascade,
  trainer_id  uuid references public.trainers (id) on delete set null,
  start_date  timestamptz,
  end_date    timestamptz,
  location    text,                                -- lieu ou lien visio
  capacity    integer check (capacity is null or capacity > 0),
  status      text not null default 'planifiee'
              check (status in ('planifiee', 'en_cours', 'terminee', 'annulee')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);


-- ============================================================
-- 7. ENROLLMENTS [MVP] — les inscriptions (personne ↔ formation)
-- ------------------------------------------------------------
-- Rôle : LE lien central. "Telle personne est inscrite à telle formation".
-- Relation : pointe vers UNE personne, UNE formation, et (facultatif) UNE session.
-- Règle : une personne ne peut pas être inscrite deux fois à la même formation.
-- ============================================================
create table public.enrollments (
  id                 uuid primary key default gen_random_uuid(),
  person_id          uuid not null references public.people (id) on delete cascade,
  course_id          uuid not null references public.courses (id) on delete cascade,
  session_id         uuid references public.sessions (id) on delete set null,
  enrollment_status  text not null default 'inscrit'
                     check (enrollment_status in ('inscrit', 'liste_attente', 'annule')),
  attendance_status  text not null default 'non_defini'
                     check (attendance_status in ('non_defini', 'present', 'absent', 'partiel')),
  payment_status     text not null default 'impaye'
                     check (payment_status in ('impaye', 'partiel', 'paye', 'offert')),
  comment            text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (person_id, course_id)                    -- pas de doublon d'inscription
);


-- ============================================================
-- 8. PAYMENTS [MVP léger] — les paiements liés à une inscription
-- ------------------------------------------------------------
-- Rôle : suivre l'argent. Une inscription peut avoir plusieurs paiements
--        (ex. acompte + solde).
-- Note : PAS de paiement en ligne ici — c'est juste un suivi manuel.
-- ============================================================
create table public.payments (
  id             uuid primary key default gen_random_uuid(),
  enrollment_id  uuid not null references public.enrollments (id) on delete cascade,
  amount         numeric(10,2) not null check (amount >= 0),
  status         text not null default 'en_attente'
                 check (status in ('en_attente', 'paye', 'rembourse', 'annule')),
  method         text,                             -- ex : 'virement', 'cheque', 'especes', 'CPF'
  due_date       date,                             -- échéance prévue
  paid_at        timestamptz,                      -- date du paiement réel
  created_at     timestamptz not null default now()
);


-- ============================================================
-- 9. CRM_FOLLOWUPS [MVP] — les relances commerciales
-- ------------------------------------------------------------
-- Rôle : le mini-CRM. Chaque ligne = une relance prévue ou effectuée.
--        L'historique = l'ensemble des lignes d'une personne.
-- Relation : rattachée à une personne (et facultativement à une inscription).
-- ============================================================
create table public.crm_followups (
  id                 uuid primary key default gen_random_uuid(),
  person_id          uuid not null references public.people (id) on delete cascade,
  enrollment_id      uuid references public.enrollments (id) on delete set null,
  next_followup_date date,                         -- "à relancer le ..."
  priority           text not null default 'normale'
                     check (priority in ('basse', 'normale', 'haute')),
  channel            text                          -- canal de la relance
                     check (channel is null or channel in ('email', 'telephone', 'sms', 'autre')),
  commercial_status  text not null default 'a_contacter'
                     check (commercial_status in
                       ('a_contacter', 'en_cours', 'a_relancer', 'gagne', 'perdu')),
  outcome            text,                         -- résultat / compte-rendu de la relance
  done               boolean not null default false, -- relance effectuée ?
  done_at            timestamptz,                  -- quand elle a été faite
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);


-- ============================================================
-- 10. NOTES [MVP léger] — notes internes horodatées
-- ------------------------------------------------------------
-- Rôle : garder un historique de commentaires sur une personne
--        (différent de people.notes qui est une note rapide unique).
-- ============================================================
create table public.notes (
  id          uuid primary key default gen_random_uuid(),
  person_id   uuid not null references public.people (id) on delete cascade,
  author_id   uuid references public.users (id) on delete set null,
  content     text not null,
  created_at  timestamptz not null default now()
);


-- ============================================================
-- 11. DOCUMENTS [PLUS TARD] — fichiers rattachés (PDF, conventions...)
-- ------------------------------------------------------------
-- Rôle : référencer un fichier stocké dans Supabase Storage.
--        On garde le CHEMIN du fichier, pas le fichier lui-même.
-- ============================================================
create table public.documents (
  id             uuid primary key default gen_random_uuid(),
  person_id      uuid references public.people (id) on delete cascade,
  enrollment_id  uuid references public.enrollments (id) on delete cascade,
  file_name      text not null,
  file_path      text not null,                    -- emplacement dans Supabase Storage
  type           text,                             -- ex : 'convention', 'attestation', 'facture'
  created_at     timestamptz not null default now()
);


-- ============================================================
-- 12. SATISFACTION_SURVEYS [PLUS TARD] — enquêtes de satisfaction
-- ------------------------------------------------------------
-- Rôle : recueillir un avis après une formation (note + commentaire).
-- ============================================================
create table public.satisfaction_surveys (
  id             uuid primary key default gen_random_uuid(),
  enrollment_id  uuid not null references public.enrollments (id) on delete cascade,
  score          integer check (score between 1 and 5),
  comment        text,
  submitted_at   timestamptz not null default now()
);


-- ============================================================
--  INDEX — pour que les recherches fréquentes soient rapides
--  (un index = la "table des matières" d'un livre)
-- ============================================================
create index idx_people_status            on public.people (status);
create index idx_people_name              on public.people (last_name, first_name);
create index idx_enrollments_person       on public.enrollments (person_id);
create index idx_enrollments_course       on public.enrollments (course_id);
create index idx_followups_next_date      on public.crm_followups (next_followup_date);
create index idx_followups_person         on public.crm_followups (person_id);
create index idx_payments_enrollment      on public.payments (enrollment_id);
create index idx_notes_person             on public.notes (person_id);
