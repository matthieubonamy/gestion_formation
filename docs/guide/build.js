/**
 * Générateur du "Kit de reprise" pour l'associé.
 * - Produit un guide interactif (docs/guide/index.html), mobile d'abord.
 * - Produit une notice HTML par étape (docs/guide/pdf/NN-slug.html),
 *   ensuite convertie en PDF par Chromium (voir build.sh).
 *
 * Tout le CONTENU est dans le tableau NOTICES ci-dessous : une seule source,
 * facile à corriger. Aucune dépendance externe (juste Node + fs).
 */
const fs = require("fs");
const path = require("path");

const OUT = __dirname;
const PDF_DIR = path.join(OUT, "pdf");

/* ---------- petits utilitaires de contenu ---------- */
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
// Bloc de code copiable (le bouton "copier" n'agit que dans le guide interactif)
function code(text) {
  return `<div class="codewrap"><button class="copy" type="button">Copier</button><pre><code>${esc(text)}</code></pre></div>`;
}
// Bloc "décision" : titre + options + recommandation
function decision(title, intro, options, reco) {
  const opts = options
    .map(
      (o) =>
        `<div class="opt"><div class="opt-h">${o.name}</div><div class="opt-b">${o.body}</div></div>`
    )
    .join("");
  return `<div class="decision"><div class="decision-h">⚖️ Décision : ${title}</div>${
    intro ? `<p>${intro}</p>` : ""
  }<div class="opts">${opts}</div><div class="reco">✅ <strong>Recommandation :</strong> ${reco}</div></div>`;
}
function callout(text) {
  return `<div class="callout">${text}</div>`;
}
function warn(text) {
  return `<div class="warnbox">⚠️ ${text}</div>`;
}
// Une case à cocher (sauvegardée dans le guide interactif)
function check(id, text) {
  return `<label class="check"><input type="checkbox" data-key="${id}"><span>${text}</span></label>`;
}
function table(headers, rows) {
  const h = headers.map((x) => `<th>${x}</th>`).join("");
  const r = rows
    .map((row) => `<tr>${row.map((c) => `<td>${c}</td>`).join("")}</tr>`)
    .join("");
  return `<table><thead><tr>${h}</tr></thead><tbody>${r}</tbody></table>`;
}

/* ============================================================
 *  LE CONTENU — une entrée = une notice = un PDF
 * ============================================================ */
const NOTICES = [
  /* ---------------------------------------------------------- */
  {
    slug: "00-bienvenue",
    tag: "Départ",
    title: "Salut Franck 👋",
    sub: "À lire en premier — 5 minutes, promis",
    body: `
<p>Salut Franck ! 🙌 C'est ton kit perso pour <strong>reprendre et finir tranquillement</strong> le projet d'appli de gestion de formations — même si tu n'as <strong>jamais codé de ta vie</strong>. On y va à ton rythme, pas de stress.</p>
<p>Je t'ai préparé tout ça comme je l'expliquerais à un pote au comptoir : simple, sans jargon, et avec des cases à cocher pour pas se perdre. Quand un mot fait peur, je te le traduis juste à côté.</p>
<h3>Comment c'est organisé</h3>
<ul>
<li>Chaque <strong>notice</strong> = une étape. Tu les fais <strong>dans l'ordre</strong>, une par jour ou une par soirée, sans te presser.</li>
<li>Quand tu vois un <span class="pill green">À FAIRE</span>, c'est une action concrète. Coche la case quand c'est fait.</li>
<li>Quand tu vois <strong>⚖️ Décision</strong>, c'est un choix à faire : je te donne <strong>toutes</strong> les options et <strong>ma recommandation</strong>.</li>
<li>Les <strong>encadrés bleus</strong> expliquent un mot compliqué. Les <strong>encadrés orange</strong> préviennent d'un piège.</li>
</ul>
<h3>Combien de temps ? Combien ça coûte ?</h3>
<p>Compte <strong>quelques soirées</strong> pour l'installation et la reprise, puis on avance étape par étape. Pour <strong>tester</strong>, le coût est de <strong>0 € </strong> (tout existe en version gratuite). On ne paie que plus tard, quand l'activité grandit — c'est détaillé dans la notice « Coûts ».</p>
${callout(
  "<strong>Tu utilises surtout ton téléphone ?</strong> Pas de souci : ce guide se lit parfaitement au téléphone, et je te montre comment <em>avancer depuis un navigateur</em> (même sans PC) dans la notice « Récupérer le travail ». Pour <em>coder confortablement</em>, un <strong>PC Windows</strong> reste recommandé."
)}
<h3>La règle d'or</h3>
<p>On ne fait <strong>jamais tout d'un coup</strong>. Une étape, on teste, on vérifie que ça marche, et seulement après on passe à la suivante. C'est plus lent, mais tu te perds jamais. Et si tu bloques : tu respires, tu relis la notice, et au pire tu m'envoies un message. 😉</p>
<p>Allez Franck, on est partis. 🚀</p>
${check("welcome-read", "OK c'est bon, j'ai pigé comment ça marche")}
`,
  },

  /* ---------------------------------------------------------- */
  {
    slug: "01-le-projet",
    tag: "Comprendre",
    title: "Le projet en 1 page",
    sub: "Ce qu'on construit et pourquoi",
    body: `
<p>On construit une <strong>application web</strong> (une « PWA ») pour gérer une activité de formation. C'est un <strong>mini-CRM</strong> : un carnet d'adresses intelligent + un suivi des formations + des relances.</p>
${callout(
  "<strong>PWA = Progressive Web App.</strong> C'est un site web qu'on peut <strong>installer sur le téléphone</strong> comme une appli (une icône sur l'écran d'accueil), qui s'ouvre en plein écran. Pas besoin de l'App Store ni de Google Play."
)}
<h3>Ce que l'application sait faire (le MVP)</h3>
${table(
  ["Fonction", "À quoi ça sert"],
  [
    ["Connexion admin", "Seul le formateur entre dans l'app (mot de passe)."],
    ["Personnes", "Ajouter / modifier / supprimer / chercher des prospects et clients."],
    ["Formations", "Le catalogue : nom, prix, dates, statut."],
    ["Inscriptions", "Relier une personne à une formation, suivre présence et paiement."],
    ["Mini-CRM", "Dates de relance, priorité, historique."],
    ["Tableau de bord", "Les chiffres clés en un coup d'œil."],
    ["Export CSV", "Récupérer toutes les données dans Excel."],
  ]
)}
<h3>Ce qu'on ne fait PAS au début (volontairement)</h3>
<p>Paiement en ligne, espace apprenant, espace formateur, signature électronique, IA, messagerie, app mobile native. <strong>On reste simple et utile.</strong></p>
<h3>Avec quels outils ?</h3>
<p><strong>Next.js</strong> (le site + le cerveau), <strong>Supabase</strong> (la base de données + les mots de passe), <strong>Vercel</strong> (la mise en ligne). On explique chacun plus loin.</p>
${check("project-understood", "J'ai compris ce que fait l'application et ce qu'elle ne fait pas")}
`,
  },

  /* ---------------------------------------------------------- */
  {
    slug: "02-recuperer-le-travail",
    tag: "Reprise",
    title: "Récupérer le travail déjà fait",
    sub: "Deux chemins : depuis le téléphone (cloud) OU depuis un PC Windows",
    body: `
<p>Une partie est <strong>déjà faite</strong> : l'analyse du besoin (Étape 1) et le schéma de la base de données (Étape 2). Tout est rangé dans un <strong>dépôt Git</strong> sur GitHub (un « dépôt » = un dossier de projet avec son historique).</p>
${callout(
  "<strong>Git & GitHub.</strong> <strong>Git</strong> est un carnet qui mémorise chaque modification du projet. <strong>GitHub</strong> est le site qui héberge ce carnet en ligne pour qu'on puisse le partager et le retrouver de n'importe où."
)}
<h3>Le dépôt du projet</h3>
${code("matthieubonamy/gestion_formation\nBranche de travail : claude/training-management-pwa-5ibmi2")}

<h2>Chemin A — Depuis ton téléphone / un navigateur (le plus simple pour commencer)</h2>
<p>Tu peux <strong>tout lire et même faire avancer le projet sans rien installer</strong>, depuis un navigateur (téléphone ou PC) :</p>
${check("a1", "Créer un compte gratuit sur github.com (notice suivante l'explique)")}
${check("a2", "Demander à Matthieu de t'ajouter comme collaborateur du dépôt (Settings → Collaborators)")}
${check("a3", "Ouvrir le dépôt dans le navigateur pour lire les fichiers (dossier docs/ et db/)")}
${callout(
  "<strong>Astuce « coder depuis le navigateur ».</strong> Le projet a été démarré avec <strong>Claude Code sur le web</strong> (code.claude.com). Tu peux y ouvrir le même dépôt et <em>demander à l'assistant</em> de continuer une étape, même depuis un téléphone. C'est le moyen le plus accessible si tu n'as pas le PC sous la main. Alternative : <strong>GitHub Codespaces</strong> (un PC de développement dans le navigateur, gratuit quelques heures par mois)."
)}
${warn(
  "Sur téléphone, on peut <strong>lire, valider, écrire des textes et piloter l'assistant</strong>, mais taper du code à la main est inconfortable. Pour les étapes de code, garde un PC Windows à portée."
)}

<h2>Chemin B — Depuis ton PC Windows (pour coder vraiment)</h2>
<p>Tu installes 3 outils (détaillés dans la notice « Installer les outils ») puis tu <strong>clones</strong> le projet (= télécharger une copie liée au dépôt) :</p>
${check("b1", "Installer Git, Node.js et VS Code (notice « Installer les outils »)")}
${check("b2", "Ouvrir le terminal et se placer dans un dossier de travail")}
${code(
  'cd Documents\ngit clone https://github.com/matthieubonamy/gestion_formation.git\ncd gestion_formation\ngit checkout claude/training-management-pwa-5ibmi2'
)}
<p>La dernière commande te place sur <strong>la branche de travail</strong> (la version en cours du projet).</p>
${check("b3", "J'ai cloné le projet et je suis sur la bonne branche")}

<h3>Recréer de zéro (option « tout refaire soi-même »)</h3>
<p>Si tu préfères <strong>tout reconstruire pour apprendre</strong>, tu n'as pas besoin de cloner : tu suis simplement les notices des Étapes 1 à 15 dans l'ordre, en repartant d'un dossier vide. Les deux fichiers déjà faits (<code>docs/</code> et <code>db/schema.sql</code>) te servent alors de <strong>modèle</strong> à recopier.</p>
`,
  },

  /* ---------------------------------------------------------- */
  {
    slug: "03-installer-les-outils",
    tag: "Installation",
    title: "Installer les outils (PC Windows)",
    sub: "Git, Node.js, VS Code — avec l'alternative téléphone/cloud",
    body: `
<p>Pour coder sur Windows, on installe <strong>3 logiciels gratuits</strong>. Fais-les dans l'ordre.</p>

<h3>1) Node.js (le moteur qui fait tourner l'application)</h3>
${callout(
  "<strong>Node.js</strong> permet d'exécuter du code JavaScript sur ton ordinateur. Il vient avec <strong>npm</strong>, l'outil qui télécharge les briques toutes faites dont le projet a besoin."
)}
${check("n1", "Aller sur nodejs.org et télécharger la version « LTS » (la stable)")}
${check("n2", "Lancer l'installateur, cliquer Suivant partout, Installer, Terminer")}
${check("n3", "Vérifier : ouvrir « Invite de commandes » (chercher cmd) et taper la commande ci-dessous")}
${code("node --version\nnpm --version")}
<p>Si deux numéros s'affichent (ex. <code>v22.x</code> et <code>10.x</code>), c'est bon ✅.</p>

<h3>2) Git (le carnet de versions)</h3>
${check("g1", "Aller sur git-scm.com et télécharger « Git for Windows »")}
${check("g2", "Installer en laissant les options par défaut (cliquer Suivant partout)")}
${check("g3", "Vérifier avec la commande")}
${code("git --version")}

<h3>3) VS Code (l'éditeur où on écrit le code)</h3>
${callout(
  "<strong>VS Code</strong> est un traitement de texte spécialisé pour le code : couleurs, suggestions, terminal intégré. Gratuit, fait par Microsoft."
)}
${check("v1", "Aller sur code.visualstudio.com et télécharger pour Windows")}
${check("v2", "Installer (cocher « Ajouter à PATH » si proposé), puis ouvrir VS Code")}
${check("v3", "Dans VS Code : Fichier → Ouvrir le dossier → choisir gestion_formation")}

${warn(
  "Si une commande « n'est pas reconnue », <strong>ferme et rouvre</strong> l'Invite de commandes : les nouveaux logiciels ne sont visibles qu'après redémarrage du terminal."
)}

<h3>Alternative sans rien installer (téléphone / cloud)</h3>
<p>Tu n'as pas de PC sous la main ? Tu peux travailler dans le navigateur :</p>
${table(
  ["Outil", "Ce que ça donne", "Coût"],
  [
    ["GitHub Codespaces", "Un PC de dev complet dans le navigateur (Node, Git déjà prêts).", "Gratuit ~60 h/mois"],
    ["Claude Code sur le web", "Tu décris ce que tu veux, l'assistant code dans le dépôt.", "Selon ton abonnement"],
  ]
)}
${check("alt-cloud", "J'ai noté l'option cloud au cas où je n'ai pas le PC")}
`,
  },

  /* ---------------------------------------------------------- */
  {
    slug: "04-creer-les-comptes",
    tag: "Comptes",
    title: "Créer ses comptes (gratuits)",
    sub: "GitHub, Supabase, Vercel",
    body: `
<p>Trois comptes gratuits suffisent pour tout le MVP. Utilise <strong>la même adresse email</strong> partout pour t'y retrouver, et un <strong>gestionnaire de mots de passe</strong> (ex. le trousseau du navigateur) pour les garder.</p>

<h3>1) GitHub — héberge le code</h3>
${check("gh1", "Aller sur github.com → Sign up, créer le compte avec ton email")}
${check("gh2", "Confirmer l'email, activer la double authentification (2FA) — important pour la sécurité")}
${check("gh3", "Demander à Matthieu de t'ajouter au dépôt (ou créer le tien si tu repars de zéro)")}

<h3>2) Supabase — la base de données + les mots de passe de l'app</h3>
${callout(
  "<strong>Supabase</strong> te donne d'un coup : une base de données (le classeur des données), l'authentification (le portier), le stockage de fichiers et des sauvegardes. Gratuit pour démarrer."
)}
${check("sb1", "Aller sur supabase.com → Start your project (connexion possible avec GitHub)")}
${check("sb2", "Créer une « Organization » (ton activité) puis un « Project »")}
${check("sb3", "Choisir une région proche (ex. Europe / Paris) et un mot de passe de base de données SOLIDE (le noter)")}
${warn(
  "Sur le plan gratuit, un projet Supabase est <strong>mis en pause après 1 semaine sans activité</strong>. Il suffit de le réactiver en un clic. Pour une vraie mise en production continue, on passera au plan payant (voir « Coûts »)."
)}

<h3>3) Vercel — met le site en ligne</h3>
${callout(
  "<strong>Vercel</strong> publie l'application sur Internet à partir du code GitHub, automatiquement à chaque modification. C'est le créateur de Next.js."
)}
${check("vc1", "Aller sur vercel.com → Sign up avec GitHub")}
${check("vc2", "Autoriser Vercel à accéder au dépôt (on s'en sert à l'étape Déploiement)")}
${warn(
  "Le plan <strong>gratuit (Hobby) de Vercel est prévu pour un usage non-commercial</strong>. Pour une utilisation professionnelle réelle, il faut le plan <strong>Pro (~20 $/mois)</strong>. Pour <em>tester</em>, le gratuit suffit. Détails et alternatives dans « Coûts »."
)}
${check("accounts-done", "Mes 3 comptes sont créés")}
`,
  },

  /* ---------------------------------------------------------- */
  {
    slug: "05-les-decisions",
    tag: "Décisions",
    title: "Les décisions à prendre",
    sub: "Chaque choix, toutes les options, et ma recommandation",
    body: `
<p>Voici les vrais choix du projet. Pour chacun : les options et ce que je recommande pour <strong>un débutant qui veut un résultat simple et pas cher</strong>.</p>

${decision(
  "Où héberger l'application ?",
  "C'est l'endroit qui rend ton site accessible sur Internet.",
  [
    { name: "Vercel", body: "Le plus simple avec Next.js, déploiement en 1 clic. Gratuit pour tester, Pro ~20 $/mois pour un usage pro." },
    { name: "Netlify", body: "Très proche de Vercel. Gratuit aussi, ~19 $/mois en pro. Bon aussi." },
    { name: "Cloudflare Pages", body: "Gratuit même pour un usage commercial, très généreux. Un peu plus technique à configurer avec Next.js." },
  ],
  "<strong>Vercel</strong> pour démarrer (le plus fluide avec Next.js). Si le budget devient un sujet, <strong>Cloudflare Pages</strong> est l'alternative gratuite la plus solide."
)}

${decision(
  "Base de données + authentification",
  "Où ranger les données et gérer les mots de passe.",
  [
    { name: "Supabase", body: "Base PostgreSQL standard + auth + stockage. Gratuit au début. Données portables (PostgreSQL = standard)." },
    { name: "Firebase (Google)", body: "Très populaire aussi, mais base « NoSQL » moins adaptée à nos tableaux reliés, et plus difficile à exporter." },
  ],
  "<strong>Supabase</strong> : mieux adapté à des données reliées (personnes, formations, inscriptions) et tu n'es jamais enfermé."
)}

${decision(
  "Acheter un nom de domaine ?",
  "L'adresse de ton site (ex. mon-organisme-formation.fr).",
  [
    { name: "Pas tout de suite", body: "Vercel te donne une adresse gratuite en .vercel.app. Parfait pour tester." },
    { name: "Acheter un domaine", body: "Plus pro et mémorisable. ~5-12 €/an pour un .fr, ~8-15 €/an pour un .com (OVH, Gandi, Infomaniak)." },
  ],
  "Commence avec l'adresse gratuite. Achète un <strong>.fr</strong> (pas cher et stable) quand tu présentes l'app à de vrais clients."
)}

${decision(
  "Envoyer des emails (relances) ?",
  "Pour envoyer automatiquement des emails depuis l'app.",
  [
    { name: "Aucun au début", body: "Tu relances toi-même par téléphone/email perso. L'app te rappelle juste QUI relancer. Zéro coût, zéro complexité." },
    { name: "Resend", body: "Service d'envoi simple. Gratuit jusqu'à 3 000 emails/mois (100/jour), puis à partir de ~20 $/mois." },
  ],
  "<strong>Aucun au début.</strong> On ajoute Resend seulement quand tu veux automatiser les relances (après le MVP)."
)}

${decision(
  "Surveiller les erreurs (monitoring) ?",
  "Être prévenu quand l'app plante.",
  [
    { name: "Logs de base", body: "Vercel garde déjà les messages d'erreur. Suffisant pour démarrer. Gratuit." },
    { name: "Sentry", body: "Outil dédié : alertes détaillées. Gratuit jusqu'à 5 000 erreurs/mois, puis ~26 $/mois." },
  ],
  "<strong>Logs Vercel</strong> au début. Sentry plus tard si l'app devient critique."
)}

${decision(
  "Un seul admin ou plusieurs ?",
  "Qui peut se connecter à l'application.",
  [
    { name: "Un seul (toi)", body: "Le plus simple. Un compte admin créé à la main dans Supabase." },
    { name: "Plusieurs admins", body: "Toi + ton associé. Supabase gère ça sans surcoût (jusqu'à 50 000 utilisateurs gratuits)." },
  ],
  "Commence à <strong>un</strong>, ajoute ton associé quand l'app marche. C'est gratuit et rapide à faire."
)}

${check("decisions-noted", "J'ai noté mes décisions (je peux y revenir plus tard)")}
`,
  },

  /* ---------------------------------------------------------- */
  {
    slug: "06-les-couts",
    tag: "Budget",
    title: "Combien ça coûte ? (court / moyen / long terme)",
    sub: "Selon le nombre d'utilisateurs et de contacts — tarifs vérifiés en juin 2026",
    body: `
<p>Bonne nouvelle : <strong>pour démarrer et tester, c'est 0 €.</strong> On ne paie que quand l'activité grandit. Voici 3 scénarios concrets.</p>

<h3>Les prix de référence (juin 2026)</h3>
${table(
  ["Service", "Gratuit", "Payant", "Ce qui déclenche le payant"],
  [
    ["Supabase", "0 € (500 Mo, 50 000 utilisateurs)", "≈ 25 $/mois (Pro)", "Usage continu sans pause + plus de 500 Mo"],
    ["Vercel", "0 € (test, non-commercial)", "≈ 20 $/mois (Pro)", "Usage professionnel / commercial"],
    ["Nom de domaine", "0 € (.vercel.app)", "5-15 €/an", "Vouloir une adresse à ton nom"],
    ["Resend (emails)", "0 € (3 000/mois)", "≈ 20 $/mois", "Automatiser beaucoup de relances"],
    ["Sentry (erreurs)", "0 € (5 000 erreurs/mois)", "≈ 26 $/mois", "Surveillance avancée"],
  ]
)}

<h3>Scénario 1 — Démarrage (court terme, 0-6 mois)</h3>
<p><em>1 à 2 admins, moins de 500 contacts, on teste et on présente.</em></p>
${table(
  ["Poste", "Coût"],
  [
    ["Supabase (gratuit)", "0 €"],
    ["Vercel (gratuit, test)", "0 €"],
    ["Domaine", "0 € (ou ~10 €/an si tu en veux un)"],
    ["<strong>Total</strong>", "<strong>≈ 0 € / mois</strong>"],
  ]
)}

<h3>Scénario 2 — Croissance (moyen terme, 6-18 mois)</h3>
<p><em>1 à 3 admins, ~2 000 contacts, usage quotidien réel, premiers vrais clients.</em></p>
${table(
  ["Poste", "Coût/mois"],
  [
    ["Supabase Pro (app toujours active, sauvegardes)", "≈ 25 $ (≈ 23 €)"],
    ["Vercel Pro (usage pro)", "≈ 20 $ (≈ 18 €)"],
    ["Domaine", "≈ 1 €/mois (lissé)"],
    ["<strong>Total</strong>", "<strong>≈ 42 € / mois</strong>"],
  ]
)}
${callout(
  "À ce stade, on paie surtout pour la <strong>fiabilité</strong> : l'app ne se met plus en pause, les sauvegardes tournent, et l'usage commercial est en règle."
)}

<h3>Scénario 3 — Établi (long terme, 18 mois +)</h3>
<p><em>Plusieurs admins, 10 000+ contacts, usage intensif, peut-être emails automatiques.</em></p>
${table(
  ["Poste", "Coût/mois"],
  [
    ["Supabase Pro + un peu d'usage en plus", "≈ 25-40 $"],
    ["Vercel Pro", "≈ 20 $"],
    ["Resend (relances auto)", "≈ 20 $"],
    ["Sentry (surveillance)", "≈ 26 $ (optionnel)"],
    ["Domaine", "≈ 1 €"],
    ["<strong>Total</strong>", "<strong>≈ 75-110 € / mois</strong>"],
  ]
)}

${warn(
  "Ces montants sont des <strong>ordres de grandeur</strong> (tarifs de juin 2026, dollars ≈ euros). Le nombre de contacts n'est pas le facteur principal : Supabase compte surtout la <strong>place utilisée</strong> et l'<strong>activité</strong>, pas le nombre de lignes. 10 000 personnes tiennent largement dans le plan Pro."
)}
<h3>Comment payer le moins possible longtemps</h3>
<ul>
<li>Reste sur le <strong>gratuit</strong> tant que tu testes.</li>
<li>Passe Vercel/Supabase en payant <strong>seulement</strong> au lancement réel auprès de clients.</li>
<li>Si le budget est serré, héberge sur <strong>Cloudflare Pages</strong> (gratuit même en pro) : ça enlève la ligne Vercel.</li>
<li>Garde toujours un <strong>export CSV</strong> récent : c'est ta sauvegarde gratuite et ta liberté de partir ailleurs.</li>
</ul>
${check("costs-understood", "J'ai compris quand et pourquoi on commencera à payer")}
`,
  },

  /* ------------ LES 15 ÉTAPES DU PROJET ------------ */
  step(1, "analyse-besoin", "Analyse du besoin", "Déjà fait ✅ — à comprendre",
`<p><span class="pill green">Déjà fait</span> Cette étape consiste à <strong>écrire clairement</strong> qui utilise l'app, ce qu'elle fait, et ce qu'on ne fait pas. C'est dans <code>docs/etape-1-analyse.pdf</code>.</p>
<h3>Ce que tu dois en retenir</h3>
<ul>
<li><strong>Un seul utilisateur</strong> : l'admin (le formateur).</li>
<li><strong>Données</strong> : personnes, formations, inscriptions, paiements, relances, notes.</li>
<li><strong>Écrans</strong> : connexion, tableau de bord, personnes, formations, inscriptions, relances, export.</li>
</ul>
${warn("Ne pas coder avant d'avoir validé ce « quoi ». Sauter cette étape = construire la mauvaise app.")}
${check("e1", "J'ai lu l'analyse du besoin et je suis d'accord avec le périmètre")}`),

  step(2, "schema-bdd", "Schéma de base de données", "Déjà fait ✅ — à appliquer",
`<p><span class="pill green">Déjà fait</span> Le plan des 12 tables est écrit dans <code>db/schema.sql</code> (voir aussi <code>docs/etape-2-schema-bdd.pdf</code>).</p>
<h3>L'appliquer dans Supabase (quand tu veux démarrer pour de vrai)</h3>
${check("e2a", "Ouvrir ton projet Supabase → menu « SQL Editor »")}
${check("e2b", "Ouvrir le fichier db/schema.sql, copier tout son contenu")}
${check("e2c", "Le coller dans le SQL Editor et cliquer « Run »")}
${callout("Si le script s'exécute <strong>sans erreur rouge</strong>, tes 12 tables sont créées. Tu peux les voir dans « Table Editor ».")}
${warn("Modifier le schéma APRÈS avoir mis de vraies données est plus délicat. Vérifie qu'il ne te manque aucun champ (financeur, n° de dossier, adresse de facturation) AVANT d'appliquer.")}
${check("e2d", "Le schéma est appliqué et je vois mes tables dans Supabase")}`),

  step(3, "creation-projet", "Création du projet", "Le squelette de l'application",
`<p>On crée l'ossature de l'app Next.js et on la relie à Supabase.</p>
<h3>Marche à suivre</h3>
${check("e3a", "Dans le dossier du projet, créer l'app Next.js")}
${code("npx create-next-app@latest . --typescript --eslint --app --tailwind --src-dir")}
<p>Réponds « Yes » aux questions par défaut. (Le point « . » = créer dans le dossier actuel.)</p>
${check("e3b", "Installer la brique Supabase")}
${code("npm install @supabase/supabase-js @supabase/ssr")}
${check("e3c", "Créer un fichier .env.local avec tes clés Supabase (Project Settings → API)")}
${code('NEXT_PUBLIC_SUPABASE_URL=ton-url-supabase\nNEXT_PUBLIC_SUPABASE_ANON_KEY=ta-cle-anon')}
${warn("Le fichier .env.local contient des clés : il ne doit JAMAIS partir sur GitHub. Vérifie qu'il est listé dans .gitignore.")}
${check("e3d", "Lancer l'app en local pour vérifier")}
${code("npm run dev")}
<p>Ouvre <code>http://localhost:3000</code> dans le navigateur : la page d'accueil de Next.js s'affiche ✅.</p>
${check("e3e", "L'app démarre en local sur localhost:3000")}`),

  step(4, "authentification", "Authentification (connexion admin)", "Le portier de l'app",
`<p>On met une page de connexion et on protège toutes les autres pages.</p>
<h3>Comment ça marche (en simple)</h3>
<ul>
<li>L'admin tape email + mot de passe sur une page <code>/login</code>.</li>
<li>Supabase vérifie, et donne un « jeton » (badge d'entrée) au navigateur.</li>
<li>Chaque page privée vérifie le badge ; sans badge → redirection vers <code>/login</code>.</li>
</ul>
${check("e4a", "Créer le compte admin dans Supabase → Authentication → Add user")}
${check("e4b", "Créer la page /login (formulaire email + mot de passe)")}
${check("e4c", "Ajouter un « middleware » qui protège les pages privées")}
${callout("Un <strong>middleware</strong> est un videur placé à l'entrée : il vérifie le badge avant de laisser voir la page.")}
${check("e4d", "Tester : sans connexion, /dashboard renvoie vers /login ; avec connexion, on entre")}
${warn("Ne jamais écrire un mot de passe en clair dans le code. C'est Supabase qui les stocke, chiffrés.")}`),

  step(5, "module-personnes", "Module Personnes", "Le cœur du CRM",
`<p>Liste, ajout, modification, suppression, recherche et filtres des personnes.</p>
<h3>Écrans à créer</h3>
${table(["Page", "Rôle"], [
  ["/people", "Liste + barre de recherche + filtre par statut"],
  ["/people/new", "Formulaire d'ajout"],
  ["/people/[id]", "Détail + modification + suppression"],
])}
<h3>Champs du formulaire (minimum)</h3>
<p>Prénom, nom, email, téléphone, statut (prospect/inscrit/client/archive), source, notes.</p>
${check("e5a", "Page liste des personnes avec recherche")}
${check("e5b", "Ajout d'une personne (et elle apparaît dans la liste)")}
${check("e5c", "Modification et suppression")}
${callout("<strong>Validation</strong> : refuse d'enregistrer si le prénom ou le nom est vide, et affiche un message clair (ex. « Le nom est obligatoire »).")}
${check("e5d", "Je peux créer, chercher, modifier et supprimer une personne")}`),

  step(6, "module-formations", "Module Formations", "Le catalogue",
`<p>Liste, ajout, modification, suppression des formations.</p>
<h3>Champs (minimum)</h3>
<p>Nom, description, type (présentiel/distanciel/mixte), prix, statut, date de début, date de fin.</p>
${check("e6a", "Page /courses : liste des formations")}
${check("e6b", "Ajout / modification / suppression")}
${callout("Réutilise la même structure de pages que pour les personnes : tu vas vite, c'est le même schéma (liste, formulaire, détail).")}
${check("e6c", "Je peux gérer mes formations de bout en bout")}`),

  step(7, "module-inscriptions", "Module Inscriptions", "Relier personne et formation",
`<p>On relie une personne à une formation et on suit son statut.</p>
<h3>Champs de l'inscription</h3>
<p>Personne, formation, statut d'inscription, statut de présence, statut de paiement, commentaire.</p>
${check("e7a", "Sur la fiche d'une personne, bouton « Inscrire à une formation »")}
${check("e7b", "Choisir la formation dans une liste déroulante")}
${check("e7c", "Pouvoir changer les 3 statuts (inscription, présence, paiement)")}
${warn("Empêche d'inscrire deux fois la même personne à la même formation (la base le bloque déjà ; affiche un message clair si ça arrive).")}
${check("e7d", "Je peux inscrire une personne et suivre ses statuts")}`),

  step(8, "mini-crm", "Mini-CRM (relances)", "Ne plus oublier personne",
`<p>On gère les relances : quand, comment, priorité, historique.</p>
<h3>Champs d'une relance</h3>
<p>Date de prochaine relance, priorité (basse/normale/haute), canal (email/téléphone/sms), statut commercial, compte-rendu.</p>
<h3>Vues utiles</h3>
${table(["Vue", "Contenu"], [
  ["À relancer aujourd'hui", "Relances dont la date = aujourd'hui ou avant, non faites"],
  ["En retard", "Relances dont la date est passée et non faites"],
])}
${check("e8a", "Ajouter une relance sur une personne")}
${check("e8b", "Marquer une relance comme « faite » (et garder l'historique)")}
${check("e8c", "Vue « à relancer aujourd'hui » et « en retard »")}
${check("e8d", "Le CRM me dit qui relancer aujourd'hui")}`),

  step(9, "tableau-de-bord", "Tableau de bord", "Les chiffres clés",
`<p>Une page d'accueil qui résume tout.</p>
<h3>Indicateurs à afficher</h3>
<p>Nombre total de personnes, nombre de prospects, nombre d'inscrits, formations en cours, paiements en attente, relances du jour, relances en retard.</p>
${check("e9a", "Page /dashboard avec les 7 indicateurs")}
${callout("Chaque chiffre est une simple question à la base (ex. « combien de personnes ont le statut prospect ? »). On affiche le résultat dans une carte.")}
${check("e9b", "Mon tableau de bord affiche les bons chiffres")}`),

  step(10, "export-csv", "Export CSV", "Récupérer ses données",
`<p>Un bouton qui télécharge les données en fichier <strong>.csv</strong> (ouvrable dans Excel / Google Sheets).</p>
<h3>Exports à proposer</h3>
<p>Personnes, formations, inscriptions, relances.</p>
${check("e10a", "Bouton « Exporter en CSV » sur chaque liste")}
${check("e10b", "Le fichier téléchargé s'ouvre correctement dans Excel")}
${callout("<strong>CSV</strong> = un tableau en texte simple, une ligne par fiche, les colonnes séparées par des virgules. C'est universel.")}
${check("e10c", "Je peux récupérer toutes mes données en CSV")}`),

  step(11, "securite", "Sécurité minimale", "Protéger l'app et les données",
`<p>Quelques règles simples mais essentielles.</p>
${check("e11a", "Validation des formulaires (champs obligatoires, email valide)")}
${check("e11b", "Toutes les pages admin protégées par la connexion")}
${check("e11c", "Activer la « RLS » dans Supabase (chaque requête vérifie les droits)")}
${callout("<strong>RLS (Row Level Security)</strong> = des règles dans la base qui décident qui a le droit de lire/écrire quelles lignes. C'est une 2e barrière en plus du portier de l'app.")}
${check("e11d", "Aucun secret (clé, mot de passe) écrit en dur dans le code")}
${check("e11e", "Messages d'erreur clairs (ex. « Email invalide »)")}
${warn("Vérifie régulièrement l'onglet « Advisors » de Supabase : il signale les failles de configuration courantes.")}`),

  step(12, "rgpd", "RGPD simple", "Respecter les données personnelles",
`<p>Tu gères des données de personnes : la loi (RGPD) demande quelques garanties simples.</p>
${check("e12a", "Pouvoir SUPPRIMER une personne et toutes ses données (déjà prévu : suppression en cascade)")}
${check("e12b", "Pouvoir EXPORTER les données d'une personne (son CSV à elle)")}
${check("e12c", "Demander le CONSENTEMENT (case à cocher, déjà un champ dans la base)")}
${check("e12d", "Noter une DURÉE de conservation (ex. archiver/supprimer après X années sans contact)")}
${check("e12e", "Journal minimal des actions importantes (création/suppression)")}
${callout("Le RGPD, en clair : ne garde que ce qui est utile, dis aux gens ce que tu fais de leurs données, et permets-leur d'y accéder ou de les effacer.")}`),

  step(13, "tests", "Tests", "Vérifier que tout marche, automatiquement",
`<p>Des petits programmes qui vérifient l'app à ta place, pour éviter les régressions.</p>
${check("e13a", "Installer l'outil de test")}
${code("npm install -D vitest")}
${check("e13b", "Écrire les tests de base")}
<ul>
<li>Création d'une personne</li>
<li>Création d'une formation</li>
<li>Inscription d'une personne</li>
<li>Création d'une relance</li>
<li>Export CSV</li>
<li>Accès refusé sans connexion</li>
</ul>
${check("e13c", "Lancer les tests")}
${code("npm test")}
${callout("Un test « passe » (vert) ou « échoue » (rouge). S'il devient rouge après une modif, c'est que tu as cassé quelque chose : tu le vois tout de suite.")}
${check("e13d", "Mes 6 tests de base passent au vert")}`),

  step(14, "deploiement", "Déploiement (mise en ligne)", "Rendre l'app accessible",
`<p>On publie l'app sur Internet avec Vercel.</p>
<h3>Étapes</h3>
${check("e14a", "Pousser le code sur GitHub")}
${code("git add -A\ngit commit -m \"Mon avancement\"\ngit push")}
${check("e14b", "Sur Vercel : Add New → Project → choisir le dépôt GitHub")}
${check("e14c", "Recopier les variables d'environnement (les mêmes que .env.local)")}
${table(["Variable", "Valeur"], [
  ["NEXT_PUBLIC_SUPABASE_URL", "ton URL Supabase"],
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "ta clé anon"],
])}
${check("e14d", "Cliquer Deploy et attendre l'adresse en .vercel.app")}
<h3>Revenir en arrière si ça casse</h3>
<p>Dans Vercel → onglet « Deployments » → choisir une version précédente qui marchait → <strong>« Promote to Production »</strong>. L'ancienne version revient en 1 clic.</p>
${warn("Ne mets jamais les clés directement dans le code : toujours dans les « Environment Variables » de Vercel.")}
${check("e14e", "Mon app est en ligne et accessible depuis le téléphone")}`),

  step(15, "documentation", "Documentation", "Pour s'y retrouver plus tard",
`<p>On écrit un mode d'emploi simple, dans le fichier <code>README.md</code> du projet.</p>
<h3>Ce que la doc doit expliquer</h3>
<ul>
<li>Comment lancer l'application (les commandes)</li>
<li>Comment créer une formation</li>
<li>Comment inscrire une personne</li>
<li>Comment faire une relance</li>
<li>Comment exporter les données</li>
<li>Comment corriger les problèmes fréquents</li>
</ul>
${callout("Écris la doc <strong>au fur et à mesure</strong>, pas à la fin : c'est plus facile et tu n'oublies rien.")}
${check("e15a", "Le README explique comment lancer et utiliser l'app")}
${check("e15b", "🎉 Le MVP est terminé, en ligne, testé et documenté")}`),

  /* ---------------------------------------------------------- */
  {
    slug: "99-depannage",
    tag: "Aide",
    title: "Glossaire & dépannage",
    sub: "Les mots qui font peur + les erreurs fréquentes",
    body: `
<h3>Glossaire express</h3>
${table(["Mot", "Traduction simple"], [
  ["Frontend", "Ce qu'on voit (écrans, boutons)"],
  ["Backend", "Le cerveau caché (règles, enregistrement)"],
  ["Base de données", "Le grand classeur des données"],
  ["Repo / dépôt", "Le dossier du projet avec son historique"],
  ["Commit", "Une photo enregistrée d'un avancement"],
  ["Push", "Envoyer ses commits sur GitHub"],
  ["Clone", "Télécharger une copie du projet liée au dépôt"],
  ["Déployer", "Mettre l'app en ligne"],
  ["Variable d'environnement", "Un réglage secret (clé) rangé hors du code"],
  ["Localhost", "Ton ordinateur, l'app tourne juste pour toi"],
]) }

<h3>Problèmes fréquents et solutions</h3>
${table(["Symptôme", "Cause probable → Solution"], [
  ["« command not found » / « n'est pas reconnu »", "Logiciel pas installé ou terminal pas redémarré → ferme et rouvre le terminal, revérifie l'installation."],
  ["L'app ne démarre pas (npm run dev échoue)", "Dépendances manquantes → lance <code>npm install</code> puis réessaie."],
  ["Page blanche / erreur Supabase", "Clés .env.local manquantes ou fausses → recopie-les depuis Supabase (Settings → API)."],
  ["« Invalid login credentials »", "Mauvais email/mot de passe, ou compte admin pas créé dans Supabase → vérifie Authentication."],
  ["Le projet Supabase est « paused »", "Plan gratuit en pause après 1 semaine → clique « Restore » dans le tableau de bord Supabase."],
  ["Le déploiement Vercel échoue", "Variables d'environnement oubliées → ajoute-les dans Vercel → Settings → Environment Variables, puis redeploy."],
]) }

${callout("Règle de dépannage du débutant : <strong>lis le message d'erreur en entier</strong> (il dit souvent quoi faire), copie-le dans un moteur de recherche, ou colle-le à l'assistant Claude Code en demandant « explique-moi cette erreur simplement »." )}

<h3>Où trouver de l'aide</h3>
<ul>
<li>La doc Supabase (supabase.com/docs) et Vercel (vercel.com/docs).</li>
<li>Claude Code sur le web : ouvre le dépôt et décris ton blocage.</li>
<li>Reprends la notice de l'étape concernée, étape par étape.</li>
</ul>
`,
  },
];

/* Fabrique une notice "étape du projet" (numérotée) */
function step(num, slug, title, sub, body) {
  return {
    slug: "etape-" + String(num).padStart(2, "0") + "-" + slug,
    tag: "Étape " + num,
    title: "Étape " + num + " — " + title,
    sub,
    body,
  };
}

/* ============================================================
 *  STYLES (partagés guide + PDF)
 * ============================================================ */
const BASE_CSS = `
:root{--blue:#1d4ed8;--slate:#0f172a;--grey:#475569;--line:#e2e8f0;--soft:#f8fafc;--green:#059669;--amber:#d97706;}
*{box-sizing:border-box;}
body{font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:var(--slate);line-height:1.6;margin:0;font-size:16px;}
h2{font-size:20px;margin:22px 0 8px;padding-bottom:5px;border-bottom:2px solid var(--line);}
h3{font-size:16px;margin:18px 0 6px;color:var(--blue);}
p{margin:8px 0;} ul{margin:8px 0;padding-left:22px;} li{margin:4px 0;}
code{background:#eef2ff;color:#3730a3;padding:1px 5px;border-radius:4px;font-size:.92em;}
table{border-collapse:collapse;width:100%;margin:12px 0;font-size:14px;}
th,td{border:1px solid var(--line);padding:7px 10px;text-align:left;vertical-align:top;}
th{background:var(--blue);color:#fff;font-weight:600;} tr:nth-child(even) td{background:var(--soft);}
.callout{background:#eff6ff;border-left:4px solid var(--blue);padding:10px 14px;border-radius:6px;margin:12px 0;font-size:14.5px;}
.warnbox{background:#fffbeb;border-left:4px solid var(--amber);padding:10px 14px;border-radius:6px;margin:12px 0;font-size:14.5px;}
.decision{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;margin:16px 0;}
.decision-h{font-weight:700;color:#065f46;margin-bottom:4px;}
.opts{display:grid;gap:8px;margin:10px 0;}
.opt{border:1px solid var(--line);background:#fff;border-radius:6px;padding:8px 12px;}
.opt-h{font-weight:600;} .opt-b{font-size:14px;color:var(--grey);}
.reco{background:#dcfce7;border-radius:6px;padding:8px 12px;font-size:14.5px;}
.codewrap{position:relative;margin:10px 0;}
pre{background:#0f172a;color:#e2e8f0;padding:14px 16px;border-radius:8px;overflow:auto;font-size:13.5px;line-height:1.5;margin:0;}
pre code{background:none;color:inherit;padding:0;}
.copy{position:absolute;top:8px;right:8px;background:#334155;color:#fff;border:none;border-radius:5px;padding:4px 10px;font-size:12px;cursor:pointer;}
.copy:hover{background:#475569;}
.check{display:flex;gap:10px;align-items:flex-start;background:#fff;border:1px solid var(--line);border-radius:6px;padding:9px 12px;margin:6px 0;cursor:pointer;}
.check input{margin-top:3px;width:18px;height:18px;flex:0 0 auto;}
.check span{font-size:14.5px;}
.pill{display:inline-block;color:#fff;font-size:11px;padding:1px 8px;border-radius:10px;vertical-align:middle;}
.pill.green{background:var(--green);}
`;

/* ============================================================
 *  GÉNÉRATION DU GUIDE INTERACTIF (un seul fichier)
 * ============================================================ */
function buildInteractive() {
  const nav = NOTICES.map(
    (n, i) =>
      `<a href="#n${i}" class="navlink"><span class="navtag">${n.tag}</span>${n.title}</a>`
  ).join("");

  const sections = NOTICES.map(
    (n, i) => `
<section class="notice" id="n${i}">
  <div class="notice-head" data-acc>
    <div><span class="pill green" style="background:var(--blue)">${n.tag}</span>
    <h2 style="border:none;margin:6px 0 0;display:inline-block">${n.title}</h2>
    <div class="notice-sub">${n.sub}</div></div>
    <div class="chev">▼</div>
  </div>
  <div class="notice-body">${n.body}</div>
</section>`
  ).join("");

  const html = `<!DOCTYPE html><html lang="fr"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kit de reprise — PWA Gestion de formations</title>
<style>${BASE_CSS}
body{background:#f1f5f9;}
.topbar{position:sticky;top:0;z-index:30;background:var(--blue);color:#fff;display:flex;align-items:center;gap:12px;padding:10px 14px;}
.topbar h1{font-size:16px;margin:0;flex:1;}
.burger{background:rgba(255,255,255,.2);border:none;color:#fff;font-size:18px;border-radius:6px;padding:4px 10px;cursor:pointer;}
.progress{height:6px;background:rgba(255,255,255,.25);}
.progress > div{height:100%;background:#a7f3d0;width:0;transition:width .3s;}
.layout{display:flex;max-width:1100px;margin:0 auto;}
.sidebar{width:280px;flex:0 0 auto;background:#fff;border-right:1px solid var(--line);padding:10px;height:calc(100vh - 52px);position:sticky;top:52px;overflow:auto;}
.navlink{display:block;padding:8px 10px;border-radius:6px;color:var(--slate);text-decoration:none;font-size:13.5px;border-left:3px solid transparent;}
.navlink:hover{background:var(--soft);} .navlink.active{background:#eff6ff;border-left-color:var(--blue);font-weight:600;}
.navtag{display:block;font-size:10.5px;color:var(--blue);font-weight:700;text-transform:uppercase;}
.content{flex:1;min-width:0;padding:18px 22px 80px;}
.notice{background:#fff;border:1px solid var(--line);border-radius:10px;margin:14px 0;overflow:hidden;}
.notice-head{display:flex;align-items:center;gap:10px;padding:14px 18px;cursor:pointer;background:#fff;}
.notice-head h2{font-size:18px;} .notice-sub{font-size:13px;color:var(--grey);margin-top:2px;}
.chev{margin-left:auto;color:var(--grey);transition:transform .2s;}
.notice.collapsed .notice-body{display:none;} .notice.collapsed .chev{transform:rotate(-90deg);}
.notice-body{padding:0 18px 18px;}
.toTop{position:fixed;bottom:18px;right:18px;background:var(--blue);color:#fff;border:none;border-radius:50%;width:46px;height:46px;font-size:20px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.2);display:none;}
.reset{background:none;border:1px solid var(--line);color:var(--grey);font-size:12px;border-radius:6px;padding:6px 10px;cursor:pointer;margin:6px 0 12px;width:100%;}
@media(max-width:820px){
  .sidebar{position:fixed;left:0;top:52px;z-index:25;transform:translateX(-100%);transition:transform .25s;box-shadow:2px 0 12px rgba(0,0,0,.15);width:84%;max-width:320px;}
  .sidebar.open{transform:translateX(0);} .content{padding:14px;}
  body{font-size:15.5px;}
}
@media(min-width:821px){ .burger{display:none;} }
</style></head><body>
<div class="topbar">
  <button class="burger" id="burger">☰</button>
  <h1>Le kit de Franck — Gestion de formations</h1>
</div>
<div class="progress"><div id="progressBar"></div></div>
<div class="layout">
  <aside class="sidebar" id="sidebar">
    <button class="reset" id="reset">↺ Réinitialiser ma progression</button>
    ${nav}
  </aside>
  <main class="content">
    <p style="color:var(--grey);font-size:14px">Guide interactif — coche les cases au fur et à mesure, ta progression est sauvegardée dans CE navigateur. Clique sur un titre pour replier/déplier une étape.</p>
    ${sections}
  </main>
</div>
<button class="toTop" id="toTop" title="Haut de page">↑</button>
<script>
// --- copier le code ---
document.querySelectorAll('.copy').forEach(function(b){
  b.addEventListener('click',function(){
    var code=b.parentElement.querySelector('code').innerText;
    navigator.clipboard.writeText(code).then(function(){b.textContent='Copié ✓';setTimeout(function(){b.textContent='Copier';},1500);});
  });
});
// --- replier/déplier ---
document.querySelectorAll('[data-acc]').forEach(function(h){
  h.addEventListener('click',function(){h.parentElement.classList.toggle('collapsed');});
});
// --- cases à cocher persistantes ---
var boxes=document.querySelectorAll('input[data-key]');
function refreshProgress(){
  var done=0; boxes.forEach(function(b){if(b.checked)done++;});
  var pct=boxes.length?Math.round(done/boxes.length*100):0;
  document.getElementById('progressBar').style.width=pct+'%';
}
boxes.forEach(function(b){
  var k='gf_'+b.dataset.key;
  if(localStorage.getItem(k)==='1')b.checked=true;
  b.addEventListener('change',function(){localStorage.setItem(k,b.checked?'1':'0');refreshProgress();});
});
refreshProgress();
document.getElementById('reset').addEventListener('click',function(){
  if(confirm('Effacer toutes les cases cochées ?')){boxes.forEach(function(b){b.checked=false;localStorage.removeItem('gf_'+b.dataset.key);});refreshProgress();}
});
// --- menu mobile ---
var sb=document.getElementById('sidebar');
document.getElementById('burger').addEventListener('click',function(){sb.classList.toggle('open');});
document.querySelectorAll('.navlink').forEach(function(a){a.addEventListener('click',function(){sb.classList.remove('open');});});
// --- bouton haut + lien actif ---
var toTop=document.getElementById('toTop');
window.addEventListener('scroll',function(){toTop.style.display=window.scrollY>400?'block':'none';});
toTop.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
</script>
</body></html>`;
  fs.writeFileSync(path.join(OUT, "index.html"), html);
  console.log("Guide interactif : index.html");
}

/* ============================================================
 *  GÉNÉRATION DES NOTICES PDF (une par étape, version imprimable)
 * ============================================================ */
function buildPdfPages() {
  if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR, { recursive: true });
  // Dans les PDF, on retire les boutons "copier" (inutiles à l'impression)
  NOTICES.forEach(function (n, i) {
    var body = n.body.replace(/<button class="copy"[^>]*>Copier<\/button>/g, "");
    var html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>${n.title}</title><style>${BASE_CSS}
@page{margin:15mm;}
.page{max-width:780px;margin:0 auto;padding:10px;}
.cover{border-bottom:4px solid var(--blue);padding-bottom:12px;margin-bottom:16px;}
.cover .kicker{color:var(--blue);font-weight:700;text-transform:uppercase;font-size:11px;letter-spacing:.06em;}
.cover h1{font-size:23px;margin:6px 0 2px;} .cover .sub{color:var(--grey);font-size:13px;}
.cover .meta{margin-top:8px;color:var(--grey);font-size:11px;}
.check{break-inside:avoid;} table,.callout,.warnbox,.decision,.codewrap{break-inside:avoid;}
footer{margin-top:24px;padding-top:10px;border-top:1px solid var(--line);color:var(--grey);font-size:10.5px;text-align:center;}
</style></head><body><div class="page">
<div class="cover"><div class="kicker">Kit de reprise — PWA Gestion de formations</div>
<h1>${n.title}</h1><div class="sub">${n.sub}</div>
<div class="meta">Notice ${String(i).padStart(2,"0")} / ${NOTICES.length-1} &nbsp;•&nbsp; Guide perso pour Franck &nbsp;•&nbsp; juin 2026</div></div>
${body}
<footer>Kit de reprise — Notice « ${n.tag} » • Projet PWA Gestion de formations</footer>
</div></body></html>`;
    var name = String(i).padStart(2, "0") + "-" + n.slug + ".html";
    fs.writeFileSync(path.join(PDF_DIR, name), html);
  });
  console.log("Notices PDF (HTML) générées : " + NOTICES.length + " fichiers dans pdf/");
}

buildInteractive();
buildPdfPages();
console.log("Terminé.");
