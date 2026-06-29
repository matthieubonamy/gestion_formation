# Journal du projet — PWA Gestion de formations

> Ce fichier garde la **mémoire du projet** : les décisions, ce qui a été fait,
> et comment reprendre. Il sert à toute personne (ou tout assistant IA) qui
> reprend le projet plus tard, même sans la conversation d'origine.

_Dernière mise à jour : juin 2026._

---

## 1. Le but

Construire une **PWA** (application web installable) pour gérer une activité de
formation : un **mini-CRM** = personnes (prospects/clients) + formations +
inscriptions + suivi des paiements + relances + tableau de bord + export CSV.

- **Commanditaire / aide :** Matthieu (a lancé le projet et demandé l'accompagnement).
- **Personne qui réalise :** Franck (débutant, beau-frère de Matthieu).
- **Financement :** à voir avec l'employeur de Franck (gratuit tant qu'on teste).

## 2. Les décisions d'architecture (validées)

| Brique | Choix retenu | Pourquoi |
|---|---|---|
| Frontend + Backend | **Next.js (React) + TypeScript** | un seul projet, idéal PWA |
| Base de données + Auth | **Supabase (PostgreSQL)** | gratuit au début, données portables |
| Hébergement | **Vercel** | déploiement en 1 clic |
| Tests | Vitest (+ Playwright plus tard) | simple |
| Emails / monitoring | aucun au début (Resend / Sentry plus tard) | rester simple |

Alternative budget : **Cloudflare Pages** (gratuit même en usage commercial).

## 3. Avancement (étapes du MVP)

- [x] **Étape 1 — Analyse du besoin** → `docs/etape-1-analyse.pdf`
- [x] **Étape 2 — Schéma de base de données** → `db/schema.sql` (12 tables) ⚠️ écrit mais **pas encore appliqué** dans Supabase
- [ ] **Étape 3 — Création du projet** (Next.js + branchement Supabase) — PROCHAINE ÉTAPE
- [ ] Étape 4 — Authentification (connexion admin)
- [ ] Étape 5 — Module Personnes
- [ ] Étape 6 — Module Formations
- [ ] Étape 7 — Inscriptions
- [ ] Étape 8 — Mini-CRM (relances)
- [ ] Étape 9 — Tableau de bord
- [ ] Étape 10 — Export CSV
- [ ] Étape 11 — Sécurité (RLS)
- [ ] Étape 12 — RGPD
- [ ] Étape 13 — Tests
- [ ] Étape 14 — Déploiement (Vercel)
- [ ] Étape 15 — Documentation

## 4. Le « Kit de reprise de Franck »

Guide pas-à-pas complet pour qu'un débutant réalise le projet seul.
- Source unique : `docs/guide/build.js` (contenu) + `docs/guide/illus.js` (illustrations).
- Sorties : `docs/guide/index.html` (sommaire), `docs/guide/pages/` (mini-site
  multi-pages), `docs/guide/pdf/` (une notice PDF par étape), `docs/guide/img/`
  (illustrations des pages partenaires + maquettes des écrans).
- Inclut : installation des outils, création des comptes (clic par clic, URLs
  réelles), configuration Supabase, les 15 étapes, une **boîte à prompts Codex**,
  les coûts (court/moyen/long terme), le RGPD, le dépannage.

### Régénérer le kit
```
cd docs/guide
node illus.js      # régénère les illustrations HTML (dans img/_src)
# puis convertir img/_src/*.html en img/*.png avec un navigateur Chromium
node build.js      # régénère le sommaire, les pages et les notices HTML
# puis convertir pdf/*.html en pdf/*.pdf avec Chromium (--print-to-pdf)
```

## 5. Coûts (repères, juin 2026)

- **Démarrage / test :** ≈ 0 €/mois (Supabase + Vercel gratuits).
- **Croissance (~2 000 contacts) :** ≈ 42 €/mois (Supabase Pro 25 $ + Vercel Pro 20 $).
- **Établi (10 000+ contacts) :** ≈ 75-110 €/mois (+ Resend, Sentry optionnels).

## 6. Comment reprendre le projet plus tard

1. Cloner le dépôt et se placer sur la branche de travail :
   ```
   git clone https://github.com/matthieubonamy/gestion_formation.git
   cd gestion_formation
   git checkout claude/training-management-pwa-5ibmi2
   ```
2. Lire ce `docs/JOURNAL.md` puis le kit dans `docs/guide/`.
3. Continuer à l'**Étape 3** (voir la liste ci-dessus).
4. Avec un assistant IA (Codex / Claude Code) : ouvrir le dépôt et lui demander
   de lire `docs/JOURNAL.md` et `db/schema.sql` avant de continuer.

## 7. Dépôt & branche

- Dépôt : `matthieubonamy/gestion_formation`
- Branche de travail : `claude/training-management-pwa-5ibmi2`
