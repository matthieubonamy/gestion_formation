/**
 * Générateur du "Kit de reprise" de Franck — version pas-à-pas exhaustive.
 *
 * Produit :
 *  1) Un mini-site MULTI-PAGES : docs/guide/index.html (sommaire) +
 *     docs/guide/pages/NN-slug.html (une page par étape, navigable,
 *     précédent/suivant, cases à cocher mémorisées). Chaque page est
 *     autonome (CSS intégré) donc téléchargeable seule.
 *  2) Une notice PDF par étape : docs/guide/pdf/NN-slug.pdf (via Chromium).
 *
 * Tout le CONTENU est dans NOTICES ci-dessous : une seule source.
 * Aucune dépendance externe (juste Node).
 */
const fs = require("fs");
const path = require("path");

const OUT = __dirname;
const PAGES_DIR = path.join(OUT, "pages");
const PDF_DIR = path.join(OUT, "pdf");

/* ---------- utilitaires de contenu ---------- */
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
// Lien cliquable ET visible (utile aussi à l'impression)
function link(url, label) {
  return `<a class="ext" href="${url}" target="_blank" rel="noopener">${label || url}</a>`;
}
// Bloc de code copiable
function code(text) {
  return `<div class="codewrap"><button class="copy" type="button">Copier</button><pre><code>${esc(text)}</code></pre></div>`;
}
// Texte exact à coller à un agent de code (Codex / Claude Code)
function promptClaude(text) {
  return `<div class="prompt"><div class="prompt-h">🤖 Prompt à copier-coller dans Codex (ou Claude Code)</div><div class="codewrap"><button class="copy" type="button">Copier</button><pre><code>${esc(
    text
  )}</code></pre></div></div>`;
}
// Liste d'étapes numérotées (chaque item est du HTML)
function ol(items) {
  return `<ol class="steps">${items.map((i) => `<li>${i}</li>`).join("")}</ol>`;
}
// Encadré de vérification
function verif(text) {
  return `<div class="verif">✅ <strong>Vérifie :</strong> ${text}</div>`;
}
function callout(text) {
  return `<div class="callout">${text}</div>`;
}
function warn(text) {
  return `<div class="warnbox">⚠️ ${text}</div>`;
}
function decision(title, intro, options, reco) {
  const opts = options
    .map((o) => `<div class="opt"><div class="opt-h">${o.name}</div><div class="opt-b">${o.body}</div></div>`)
    .join("");
  return `<div class="decision"><div class="decision-h">⚖️ Décision : ${title}</div>${
    intro ? `<p>${intro}</p>` : ""
  }<div class="opts">${opts}</div><div class="reco">✅ <strong>Recommandation :</strong> ${reco}</div></div>`;
}
function check(id, text) {
  return `<label class="check"><input type="checkbox" data-key="${id}"><span>${text}</span></label>`;
}
function bro(text) {
  return `<div class="bro"><div class="bro-h">💬 Un mot, Franck</div><p>${text}</p><div class="bro-sign">— Claude, l'assistant que <strong>Matthieu (ton beau-frère)</strong> a chargé de t'aider 🤝</div></div>`;
}
function motMatthieu(text) {
  return `<div class="matt"><div class="matt-h">❤️ De la part de Matthieu</div><p>${text}</p><div class="matt-sign">— Matthieu, ton beau-frère (message qu'il m'a demandé de te transmettre)</div></div>`;
}
function table(headers, rows) {
  const h = headers.map((x) => `<th>${x}</th>`).join("");
  const r = rows.map((row) => `<tr>${row.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("");
  return `<table><thead><tr>${h}</tr></thead><tbody>${r}</tbody></table>`;
}
// Image illustrée (les fichiers sont dans ../img depuis pages/ et pdf/)
function img(name, caption) {
  return `<figure class="fig"><img src="../img/${name}.png" alt="${esc(caption || name)}" loading="lazy"><figcaption>${caption || ""}</figcaption></figure>`;
}
// Fabrique une notice "étape du projet"
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
 *  CONTENU — une entrée = une page = un PDF
 * ============================================================ */
const NOTICES = [
  /* ===== 00 — BIENVENUE ===== */
  {
    slug: "00-bienvenue",
    tag: "Départ",
    title: "Salut Franck 👋",
    sub: "À lire en premier — 5 minutes, promis",
    body: `
<p>Salut Franck ! 🙌 C'est ton kit perso pour <strong>reprendre et finir tranquillement</strong> le projet d'appli de gestion de formations — même si tu n'as <strong>jamais codé de ta vie</strong>. On y va à ton rythme.</p>
${bro(
  "Si je suis là, c'est parce que <strong>Matthieu, ton beau-frère</strong>, m'a demandé de te prendre par la main sur ce projet : « aide Franck, conseille-le, explique-lui tout simplement. » Considère-moi comme <strong>ton copilote</strong> : tu n'es jamais seul là-dedans."
)}
${motMatthieu(
  "Franck, t'es du genre à croire que « l'informatique, c'est pas pour moi ». Eh bien je te le dis franchement : <strong>t'en es parfaitement capable</strong>. Avance, trompe-toi, recommence — c'est comme ça qu'on apprend. Je suis derrière toi à fond. 💪"
)}
<h3>Comment ce guide marche</h3>
${ol([
  "Tu fais les pages <strong>dans l'ordre</strong>, une à la fois. En bas de chaque page : un bouton <strong>« Suivant ▶ »</strong>.",
  "Chaque action est <strong>numérotée</strong> : tu suis 1, 2, 3… sans réfléchir.",
  "Après chaque action importante, un encadré vert <strong>« ✅ Vérifie »</strong> te dit comment savoir que c'est réussi.",
  "Tu <strong>coches les cases</strong> au fur et à mesure : ta progression est sauvegardée dans ce navigateur (la barre en haut se remplit).",
])}
${callout(
  "<strong>Mots compliqués ?</strong> Je te les traduis dans des encadrés bleus. <strong>Pièges ?</strong> Encadrés orange. <strong>Choix à faire ?</strong> Encadrés verts « ⚖️ Décision »."
)}
${callout(
  "<strong>Tu lis sur ton téléphone ?</strong> Parfait pour avancer dans la lecture et créer tes comptes. Pour <em>coder</em>, garde un <strong>PC Windows</strong> à côté (les pages t'indiquent quand le PC est nécessaire)."
)}
<h3>La vérité, sans te mentir</h3>
${warn(
  "Il y aura des moments un peu galère, des messages d'erreur incompréhensibles. C'est <strong>normal</strong> et ça arrive à TOUS les développeurs. La différence, ce n'est pas le talent : c'est de ne pas lâcher et de demander de l'aide au bon moment. Ce guide est fait pour ça."
)}
${check("welcome-read", "OK, j'ai pigé comment ça marche. On y va !")}
`,
  },

  /* ===== 01 — LE PROJET ===== */
  {
    slug: "01-le-projet",
    tag: "Comprendre",
    title: "Le projet en 1 page",
    sub: "Ce qu'on construit et pourquoi",
    body: `
<p>On construit une <strong>application web</strong> (une « PWA ») pour gérer une activité de formation : un <strong>carnet d'adresses intelligent</strong> + un suivi des formations + des relances.</p>
${callout(
  "<strong>PWA = Progressive Web App.</strong> Un site web qu'on peut <strong>installer sur le téléphone</strong> comme une appli (icône sur l'écran d'accueil). Pas besoin de l'App Store."
)}
<h3>Ce que l'application saura faire</h3>
${table(
  ["Fonction", "À quoi ça sert"],
  [
    ["Connexion admin", "Seul toi entres dans l'app (email + mot de passe)."],
    ["Personnes", "Ajouter / modifier / supprimer / chercher prospects et clients."],
    ["Formations", "Le catalogue : nom, prix, dates, statut."],
    ["Inscriptions", "Relier une personne à une formation ; suivre présence et paiement."],
    ["Mini-CRM", "Dates de relance, priorité, historique."],
    ["Tableau de bord", "Les chiffres clés en un coup d'œil."],
    ["Export CSV", "Récupérer toutes les données dans Excel."],
  ]
)}
<h3>Les 3 outils du projet (expliqués plus loin, pas à pas)</h3>
${table(
  ["Outil", "Son rôle", "Adresse"],
  [
    ["Next.js", "Le site + le cerveau de l'app", link("https://nextjs.org")],
    ["Supabase", "La base de données + les mots de passe", link("https://supabase.com")],
    ["Vercel", "Mettre l'app en ligne", link("https://vercel.com")],
  ]
)}
${check("project-understood", "J'ai compris ce que fait l'application")}
`,
  },

  /* ===== 02 — INSTALLER LES OUTILS (PC Windows) ===== */
  {
    slug: "02-installer-outils",
    tag: "Installation",
    title: "Installer les outils sur ton PC Windows",
    sub: "Node.js, Git, VS Code — clic par clic, avec vérifications",
    body: `
<p>Pour coder, on installe <strong>3 logiciels gratuits</strong>, dans l'ordre. Prévois 20 minutes. (Si tu n'as pas de PC maintenant, lis la page « Récupérer le travail » : on peut commencer depuis le navigateur.)</p>

<h3>Logiciel 1 — Node.js (le moteur de l'app)</h3>
${callout(
  "<strong>Node.js</strong> fait tourner le code de l'application sur ton ordinateur. Il vient avec <strong>npm</strong>, l'outil qui télécharge les briques toutes faites du projet."
)}
${img("site-node", "À quoi ressemble la page de téléchargement de Node.js — clique le gros bouton « LTS ».")}
${ol([
  `Ouvre ton navigateur (Edge, Chrome…) et va sur ${link("https://nodejs.org/en/download", "https://nodejs.org/en/download")}.`,
  "Repère le bouton avec la mention <strong>« LTS »</strong> (= la version stable, recommandée). Clique dessus pour télécharger le fichier <code>.msi</code> Windows.",
  "En bas du navigateur, clique sur le fichier téléchargé (ex. <code>node-vXX-x64.msi</code>) pour lancer l'installation.",
  "Une fenêtre s'ouvre : clique <strong>Next</strong>, coche <strong>« I accept… »</strong>, puis <strong>Next</strong> à chaque écran (laisse tout par défaut), puis <strong>Install</strong>. Windows demande l'autorisation : clique <strong>Oui</strong>.",
  "Quand c'est fini, clique <strong>Finish</strong>.",
])}
${verif(
  "Ouvre le menu Démarrer, tape <code>cmd</code>, ouvre « Invite de commandes ». Tape la commande ci-dessous et appuie sur Entrée."
)}
${code("node --version\nnpm --version")}
<p>Deux numéros doivent s'afficher (ex. <code>v22.3.0</code> et <code>10.8.1</code>). Si oui → c'est réussi ✅.</p>
${check("node-ok", "Node.js et npm sont installés (deux numéros s'affichent)")}

<h3>Logiciel 2 — Git (le carnet de versions)</h3>
${callout("<strong>Git</strong> mémorise chaque modification du projet et permet de récupérer/envoyer le code sur GitHub.")}
${ol([
  `Va sur ${link("https://git-scm.com/download/win", "https://git-scm.com/download/win")}. Le téléchargement démarre tout seul (sinon clique « 64-bit Git for Windows Setup »).`,
  "Lance le fichier téléchargé. Clique <strong>Oui</strong> à l'autorisation Windows.",
  "À chaque écran de l'installateur, clique simplement <strong>Next</strong> (les options par défaut conviennent très bien), puis <strong>Install</strong>, puis <strong>Finish</strong>.",
])}
${verif("Ferme puis rouvre l'Invite de commandes (important !), et tape :")}
${code("git --version")}
<p>Un numéro doit s'afficher (ex. <code>git version 2.45.0</code>) → réussi ✅.</p>
${check("git-ok", "Git est installé")}

<h3>Logiciel 3 — VS Code (l'éditeur de code)</h3>
${callout("<strong>VS Code</strong> est l'endroit où on écrit et où l'on voit le code. Gratuit, fait par Microsoft.")}
${ol([
  `Va sur ${link("https://code.visualstudio.com/download", "https://code.visualstudio.com/download")} et clique le bouton <strong>Windows</strong>.`,
  "Lance le fichier téléchargé, accepte l'accord, clique <strong>Suivant</strong>.",
  "À l'écran « Tâches supplémentaires », <strong>coche</strong> « Ajouter à PATH » et « Ajouter l'action Ouvrir avec Code… » (ça aide plus tard). Puis <strong>Suivant</strong> → <strong>Installer</strong> → <strong>Terminer</strong>.",
])}
${verif("VS Code s'ouvre (un écran de bienvenue). C'est bon ✅.")}
${check("vscode-ok", "VS Code est installé et s'ouvre")}

${warn(
  "Si une commande « n'est pas reconnue », c'est presque toujours que le terminal était déjà ouvert avant l'installation. <strong>Ferme-le et rouvre-le</strong>, puis réessaie."
)}
${bro(
  "Trois installations, trois vérifications. Si une vérif ne donne pas le bon résultat, ne force pas : reprends l'étape tranquillement, ou envoie-moi le message d'erreur (copie-colle-le à Claude Code). On débloque ça vite."
)}
`,
  },

  /* ===== 03 — CRÉER LES COMPTES ===== */
  {
    slug: "03-creer-comptes",
    tag: "Comptes",
    title: "Créer tes 3 comptes (clic par clic)",
    sub: "GitHub, Supabase, Vercel — tout est gratuit pour démarrer",
    body: `
<p>Trois comptes suffisent. <strong>Conseil :</strong> utilise <strong>la même adresse email</strong> partout, et laisse ton navigateur <strong>enregistrer les mots de passe</strong>.</p>

<h3>Compte 1 — GitHub (héberge le code)</h3>
${img("site-github", "Le formulaire d'inscription GitHub : email, mot de passe, nom d'utilisateur, puis « Continue ».")}
${ol([
  `Va sur ${link("https://github.com/signup", "https://github.com/signup")}.`,
  "Saisis ton <strong>email</strong>, clique <strong>Continue</strong>.",
  "Choisis un <strong>mot de passe</strong> (note-le), clique <strong>Continue</strong>.",
  "Choisis un <strong>nom d'utilisateur</strong> (ex. <code>franck-formation</code>), clique <strong>Continue</strong>.",
  "Résous le petit puzzle de vérification, puis clique <strong>Create account</strong>.",
  "GitHub envoie un <strong>code par email</strong> : ouvre ta boîte mail, recopie le code dans GitHub.",
  "Aux questions « how many people / student / interests », tu peux cliquer <strong>Skip</strong> en bas. Choisis le plan <strong>Free</strong>.",
])}
${verif(`Tu arrives sur ton tableau de bord GitHub (page d'accueil avec « Dashboard »). Ton compte est créé ✅.`)}
<p><strong>Sécurité (important) :</strong> active la double authentification.</p>
${ol([
  `Va sur ${link("https://github.com/settings/security", "https://github.com/settings/security")}.`,
  "Clique <strong>Enable two-factor authentication</strong> et suis les indications (le plus simple : une appli type « Authy » ou « Google Authenticator » sur ton téléphone).",
])}
${check("github-ok", "Mon compte GitHub est créé et la double authentification est activée")}
${callout(
  "Pour <strong>reprendre le projet existant</strong>, Matthieu devra t'ajouter au dépôt (il fait ça en 2 clics depuis ses réglages). Envoie-lui simplement ton <strong>nom d'utilisateur GitHub</strong>. Détails sur la page « Récupérer le travail »."
)}

<h3>Compte 2 — Supabase (base de données + mots de passe de l'app)</h3>
${callout(
  "<strong>Supabase</strong> te donne d'un coup : la base de données (le grand classeur), l'authentification (le portier), le stockage et les sauvegardes. Gratuit pour démarrer."
)}
${img("site-supabase-new", "L'écran de création de projet Supabase : nom, mot de passe de la base (à noter !), région, puis « Create new project ».")}
${ol([
  `Va sur ${link("https://supabase.com", "https://supabase.com")} et clique <strong>Start your project</strong> (en haut à droite).`,
  "Clique <strong>Continue with GitHub</strong> (le plus simple, ça réutilise ton compte GitHub). Autorise en cliquant <strong>Authorize</strong>.",
  "Tu arrives sur le tableau de bord Supabase. Clique <strong>New project</strong>.",
  "Si on te demande de créer une <strong>Organization</strong> : donne un nom (ex. le nom de ton organisme), choisis le type <strong>Personal</strong> et le plan <strong>Free</strong>, clique <strong>Create organization</strong>.",
  "Pour le projet : <strong>Name</strong> = <code>gestion-formation</code>. <strong>Database Password</strong> = clique « Generate a password » et <strong>copie-le précieusement</strong> (colle-le dans tes notes). <strong>Region</strong> = choisis <strong>Central EU (Frankfurt)</strong> ou <strong>West EU (Paris)</strong> — proche de toi.",
  "Clique <strong>Create new project</strong>. Patiente 1 à 2 minutes (Supabase prépare ta base).",
])}
${verif(`Tu vois le tableau de bord du projet avec un menu à gauche (Table Editor, SQL Editor, Authentication…). C'est prêt ✅.`)}
${warn(
  "Sur le plan gratuit, un projet est <strong>mis en pause après 1 semaine sans activité</strong>. On le réactive en 1 clic (bouton « Restore »). Pour une mise en service continue, on passera au plan payant — à voir avec ton employeur (page « Coûts »)."
)}
${check("supabase-ok", "Mon projet Supabase est créé et le mot de passe de la base est noté")}

<h3>Compte 3 — Vercel (met l'app en ligne)</h3>
${callout("<strong>Vercel</strong> publie l'application sur Internet à partir du code GitHub, tout seul à chaque modification.")}
${img("site-vercel", "Plus tard, l'écran d'import Vercel : importer le dépôt, coller les 2 clés Supabase, puis « Deploy ».")}
${ol([
  `Va sur ${link("https://vercel.com/signup", "https://vercel.com/signup")}.`,
  "Clique <strong>Continue with GitHub</strong>, puis <strong>Authorize Vercel</strong>.",
  "Choisis le plan <strong>Hobby</strong> (gratuit) pour l'instant. Renseigne un nom si demandé, clique <strong>Continue</strong>.",
])}
${verif(`Tu arrives sur le tableau de bord Vercel (vide pour l'instant, c'est normal). Compte prêt ✅.`)}
${warn(
  "Le plan <strong>gratuit (Hobby)</strong> de Vercel est prévu pour un usage <strong>non-commercial</strong> : parfait pour <em>tester et faire une démo</em>. Pour une utilisation pro réelle, il faudra le plan <strong>Pro</strong> — décision à prendre avec ton employeur (page « Coûts »)."
)}
${check("vercel-ok", "Mon compte Vercel est créé")}
${bro(
  "Voilà, tu as tes 3 clés d'entrée. Garde bien tous les mots de passe au même endroit (le trousseau de ton navigateur fait très bien le job). Si une étape coince — un bouton qui ne porte pas exactement le même nom, par exemple —, ne panique pas : les sites changent un peu leurs libellés, mais l'intention reste la même. Au moindre doute, demande-moi."
)}
`,
  },

  /* ===== 04 — RÉCUPÉRER LE TRAVAIL ===== */
  {
    slug: "04-recuperer-le-travail",
    tag: "Reprise",
    title: "Récupérer le travail déjà fait",
    sub: "Depuis le téléphone/navigateur OU depuis ton PC — pas à pas",
    body: `
<p>Une partie est <strong>déjà faite</strong> : l'analyse du besoin (Étape 1) et le schéma de base de données (Étape 2). Tout est rangé dans un <strong>dépôt Git</strong> sur GitHub.</p>
${callout(
  "<strong>Dépôt (repo).</strong> Un dossier de projet avec tout son historique, hébergé sur GitHub. Le nôtre : <code>matthieubonamy/gestion_formation</code>, branche <code>claude/training-management-pwa-5ibmi2</code>."
)}

<h2>Chemin A — Sans rien installer (téléphone ou PC)</h2>
${ol([
  "Crée ton compte GitHub (page précédente).",
  "Envoie ton <strong>nom d'utilisateur GitHub</strong> à Matthieu et demande-lui de t'ajouter au dépôt.",
  `Matthieu, lui, va sur ${link("https://github.com/matthieubonamy/gestion_formation/settings/access", "Settings → Collaborators")} du dépôt, clique <strong>Add people</strong>, colle ton nom d'utilisateur, et t'invite.`,
  "Tu reçois un email d'invitation : clique <strong>Accept invitation</strong>.",
  "Tu peux maintenant <strong>ouvrir le dépôt dans le navigateur</strong> et lire les fichiers (dossiers <code>docs/</code> et <code>db/</code>).",
])}
${verif(`Tu vois la liste des fichiers du projet sur github.com → tu as bien accès ✅.`)}
${callout(
  "<strong>Coder depuis le navigateur ?</strong> Le projet a été démarré avec <strong>Claude Code sur le web</strong> (" +
    link("https://code.claude.com", "code.claude.com") +
    "). Tu peux y ouvrir le même dépôt et <em>demander à l'assistant</em> de continuer une étape, même depuis un téléphone. Autre option : <strong>GitHub Codespaces</strong> (un PC de dev dans le navigateur, gratuit ~60 h/mois)."
)}
${warn(
  "Sur téléphone, on lit et on pilote l'assistant, mais taper du code à la main est inconfortable. Pour coder vraiment, passe au Chemin B."
)}
${check("repo-access", "J'ai accès au dépôt (via une invitation de Matthieu)")}

<h2>Chemin B — Sur ton PC Windows (pour coder)</h2>
${ol([
  "Ouvre l'Invite de commandes (menu Démarrer → tape <code>cmd</code>).",
  "Place-toi dans ton dossier Documents :",
])}
${code("cd Documents")}
${ol(["Télécharge une copie du projet (= « cloner ») :"])}
${code("git clone https://github.com/matthieubonamy/gestion_formation.git")}
${ol(["Entre dans le dossier et place-toi sur la branche de travail :"])}
${code("cd gestion_formation\ngit checkout claude/training-management-pwa-5ibmi2")}
${verif("Tape <code>dir</code> : tu dois voir les dossiers <code>docs</code> et <code>db</code>. Tu as bien le projet ✅.")}
${callout("Au premier <code>git clone</code>, GitHub peut te demander de te connecter : une fenêtre s'ouvre, clique « Sign in with your browser » et connecte-toi avec ton compte GitHub.")}
${check("repo-cloned", "J'ai cloné le projet sur mon PC et je suis sur la bonne branche")}

<h3>Variante : tout recréer de zéro (pour apprendre)</h3>
<p>Si tu préfères <strong>tout reconstruire toi-même</strong>, tu n'as pas besoin de cloner : suis simplement les pages des Étapes 1 à 15 dans l'ordre, en repartant d'un dossier vide. Les fichiers déjà faits (<code>docs/</code> et <code>db/schema.sql</code>) te serviront de <strong>modèle</strong>.</p>
${bro(
  "Pour l'accès au dépôt, un simple message à Matthieu suffit — il a les droits et m'a dit de te dire de ne pas hésiter. Le plus dur, c'est souvent juste d'oser demander. Tu peux. 🙂"
)}
`,
  },

  /* ===== 05 — LES DÉCISIONS ===== */
  {
    slug: "05-les-decisions",
    tag: "Décisions",
    title: "Les décisions à prendre",
    sub: "Chaque choix, toutes les options, ma recommandation",
    body: `
<p>Voici les vrais choix du projet. Pour chacun : les options et ma reco pour <strong>un débutant qui veut du simple et du pas cher</strong>.</p>

${decision(
  "Où héberger l'application ?",
  "L'endroit qui rend ton site accessible sur Internet.",
  [
    { name: "Vercel", body: "Le plus simple avec Next.js, déploiement en 1 clic. Gratuit pour tester, ~20 $/mois en pro." },
    { name: "Netlify", body: "Très proche de Vercel. Gratuit aussi, ~19 $/mois en pro." },
    { name: "Cloudflare Pages", body: "Gratuit même pour un usage commercial, très généreux. Un peu plus technique à configurer." },
  ],
  "<strong>Vercel</strong> pour démarrer. Si le budget devient un sujet, <strong>Cloudflare Pages</strong> est l'alternative gratuite la plus solide."
)}
${decision(
  "Base de données + authentification",
  "Où ranger les données et gérer les mots de passe.",
  [
    { name: "Supabase", body: "Base PostgreSQL standard + auth + stockage. Gratuit au début. Données portables." },
    { name: "Firebase (Google)", body: "Populaire, mais base « NoSQL » moins adaptée à nos tableaux reliés, et plus dure à exporter." },
  ],
  "<strong>Supabase</strong> : mieux adapté à des données reliées (personnes, formations, inscriptions)."
)}
${decision(
  "Acheter un nom de domaine ?",
  "L'adresse de ton site (ex. mon-organisme.fr).",
  [
    { name: "Pas tout de suite", body: "Vercel te donne une adresse gratuite en .vercel.app. Parfait pour tester et démontrer." },
    { name: "Acheter un domaine", body: "Plus pro. ~5-12 €/an pour un .fr, ~8-15 €/an pour un .com." },
  ],
  "Commence avec l'adresse gratuite. L'achat d'un domaine est une dépense → à valider avec ton employeur."
)}
${decision(
  "Envoyer des emails de relance ?",
  "Pour envoyer automatiquement des emails depuis l'app.",
  [
    { name: "Aucun au début", body: "L'app te rappelle QUI relancer ; tu relances toi-même. Zéro coût, zéro complexité." },
    { name: "Resend", body: "Service d'envoi simple. Gratuit jusqu'à 3 000 emails/mois, puis ~20 $/mois." },
  ],
  "<strong>Aucun au début.</strong> On ajoutera Resend plus tard si besoin."
)}
${decision(
  "Surveiller les erreurs (monitoring) ?",
  "Être prévenu quand l'app plante.",
  [
    { name: "Logs Vercel", body: "Vercel garde déjà les messages d'erreur. Suffisant pour démarrer. Gratuit." },
    { name: "Sentry", body: "Alertes détaillées. Gratuit jusqu'à 5 000 erreurs/mois, puis ~26 $/mois." },
  ],
  "<strong>Logs Vercel</strong> au début ; Sentry plus tard si l'app devient critique."
)}
${bro(
  "Pour les choix <strong>techniques</strong>, demande à <strong>Matthieu</strong> si tu hésites — c'est son domaine. En revanche, dès qu'un choix <strong>coûte de l'argent</strong> (hébergement payant, domaine…), ce n'est ni à toi ni à Matthieu de trancher : ça se valide avec <strong>ton employeur</strong>. Tu peux tout préparer en version gratuite et garder ces décisions « budget » pour plus tard."
)}
${check("decisions-noted", "J'ai noté mes décisions (je peux y revenir plus tard)")}
`,
  },

  /* ===== 06 — LES COÛTS ===== */
  {
    slug: "06-les-couts",
    tag: "Budget",
    title: "Combien ça coûte ? (court / moyen / long terme)",
    sub: "Tarifs vérifiés en juin 2026 — pour ta discussion avec l'employeur",
    body: `
<p>Pour <strong>démarrer et tester, c'est 0 €.</strong> On ne paie que quand l'activité grandit. Voici les chiffres concrets à présenter à ton employeur.</p>
<h3>Prix de référence (juin 2026)</h3>
${table(
  ["Service", "Gratuit", "Payant", "Ce qui déclenche le payant"],
  [
    ["Supabase", "0 € (500 Mo, 50 000 utilisateurs)", "≈ 25 $/mois", "Usage continu sans pause + plus de 500 Mo"],
    ["Vercel", "0 € (test, non-commercial)", "≈ 20 $/mois", "Usage professionnel / commercial"],
    ["Nom de domaine", "0 € (.vercel.app)", "5-15 €/an", "Vouloir une adresse à ton nom"],
    ["Resend (emails)", "0 € (3 000/mois)", "≈ 20 $/mois", "Automatiser beaucoup de relances"],
    ["Sentry (erreurs)", "0 € (5 000/mois)", "≈ 26 $/mois", "Surveillance avancée"],
  ]
)}
<h3>Scénario 1 — Démarrage (0-6 mois) : 1-2 admins, &lt; 500 contacts</h3>
${table(["Poste", "Coût"], [["Supabase + Vercel (gratuits)", "0 €"], ["Domaine (optionnel)", "0 à ~10 €/an"], ["<strong>Total</strong>", "<strong>≈ 0 € / mois</strong>"]])}
<h3>Scénario 2 — Croissance (6-18 mois) : ~2 000 contacts, usage quotidien</h3>
${table(["Poste", "Coût/mois"], [["Supabase Pro", "≈ 25 $ (≈ 23 €)"], ["Vercel Pro", "≈ 20 $ (≈ 18 €)"], ["Domaine", "≈ 1 €"], ["<strong>Total</strong>", "<strong>≈ 42 € / mois</strong>"]])}
<h3>Scénario 3 — Établi (18 mois +) : 10 000+ contacts, usage intensif</h3>
${table(["Poste", "Coût/mois"], [["Supabase Pro (+ usage)", "≈ 25-40 $"], ["Vercel Pro", "≈ 20 $"], ["Resend (relances auto)", "≈ 20 $"], ["Sentry (optionnel)", "≈ 26 $"], ["<strong>Total</strong>", "<strong>≈ 75-110 € / mois</strong>"]])}
${warn(
  "Ordres de grandeur (tarifs juin 2026, dollar ≈ euro). Le nombre de contacts n'est pas le facteur principal : Supabase compte surtout la <strong>place</strong> et l'<strong>activité</strong>. 10 000 personnes tiennent largement dans le plan Pro."
)}
${bro(
  "Sur l'argent, soyons clairs : ce n'est pas à toi de sortir la carte bleue, et Matthieu n'est pas concerné. <strong>Le financement, c'est à voir avec ton employeur.</strong> Et tu as une super carte à jouer : tant que tu testes, c'est 0 € — donc tu peux d'abord <strong>construire une vraie démo qui marche</strong>, puis la montrer. Quand ton employeur verra l'outil tourner (relances qui ne s'oublient plus, suivi des paiements, export en un clic), la question ne sera plus « est-ce qu'on paie 40 €/mois ? » mais « pourquoi on ne l'avait pas avant ? ». La puissance de ce que tu auras créé vaudra largement ce petit budget."
)}
${check("costs-understood", "J'ai compris : je teste gratuitement, je montre, et le financement se voit avec l'employeur")}
`,
  },

  /* ===== LES 15 ÉTAPES ===== */
  step(1, "analyse-besoin", "Analyse du besoin", "Déjà fait ✅ — à comprendre",
`<p><span class="pill green">Déjà fait</span> Cette étape consiste à écrire clairement qui utilise l'app, ce qu'elle fait et ne fait pas. C'est dans <code>docs/etape-1-analyse.pdf</code>.</p>
<h3>Pour la lire</h3>
${ol([
  "Sur GitHub, ouvre le dépôt → dossier <code>docs</code> → clique <code>etape-1-analyse.pdf</code> → <strong>View raw</strong> pour le télécharger.",
  "Ou sur ton PC, ouvre le fichier dans <code>Documents/gestion_formation/docs/</code>.",
])}
<h3>À retenir</h3>
<ul><li><strong>Un seul utilisateur</strong> : l'admin (toi).</li><li><strong>Données</strong> : personnes, formations, inscriptions, paiements, relances, notes.</li><li><strong>Écrans</strong> : connexion, tableau de bord, personnes, formations, inscriptions, relances, export.</li></ul>
${warn("Ne pas coder avant d'avoir validé ce « quoi ». Sauter ça = construire la mauvaise app.")}
${check("e1", "J'ai lu l'analyse du besoin et je suis d'accord avec le périmètre")}`),

  step(2, "schema-bdd", "Schéma de base de données", "Déjà fait ✅ — à APPLIQUER dans Supabase (clic par clic)",
`<p><span class="pill green">Déjà fait</span> Le plan des 12 tables est écrit dans <code>db/schema.sql</code>. Voici comment le <strong>créer pour de vrai</strong> dans ta base Supabase.</p>
<h3>Étape par étape</h3>
${img("site-supabase-sql", "Le « SQL Editor » de Supabase : on colle le schéma dans la zone noire, puis on clique « Run ».")}
${ol([
  "Récupère le contenu du fichier <code>db/schema.sql</code> : sur GitHub, ouvre le dépôt → dossier <code>db</code> → clique <code>schema.sql</code> → clique le bouton <strong>« Raw »</strong> → sélectionne tout (Ctrl+A) → copie (Ctrl+C).",
  `Va sur ${link("https://supabase.com/dashboard", "https://supabase.com/dashboard")} et ouvre ton projet <code>gestion-formation</code>.`,
  "Dans le menu de gauche, clique l'icône <strong>« SQL Editor »</strong> (un symbole &lt;/&gt;).",
  "Clique <strong>« + New query »</strong> (ou « New snippet »).",
  "Clique dans la grande zone de texte et <strong>colle</strong> (Ctrl+V) tout le contenu du schéma.",
  "En bas à droite, clique le bouton vert <strong>« Run »</strong> (ou appuie Ctrl+Entrée).",
])}
${verif("Un message vert « Success. No rows returned » apparaît en bas → tes tables sont créées ✅.")}
${ol([
  "Pour les voir : menu de gauche → <strong>« Table Editor »</strong>. Tu dois voir la liste : <code>people</code>, <code>courses</code>, <code>enrollments</code>, etc.",
])}
${warn("Si un message rouge apparaît, lis-le : souvent une table existe déjà. Solution simple : recopie le message d'erreur à Claude Code, il te dit quoi faire. Ne supprime rien au hasard.")}
${callout("Vérifie qu'il ne te manque aucun champ utile à ton métier (financeur, n° de dossier, adresse de facturation) AVANT de mettre de vraies données. Modifier après est plus délicat.")}
${check("e2", "Le schéma est appliqué : je vois mes 12 tables dans le Table Editor de Supabase")}`),

  step(3, "creation-projet", "Création du projet", "Le squelette de l'app (sur PC)",
`<p>On crée l'ossature Next.js et on la relie à Supabase. <strong>Sur ton PC</strong>, dans le dossier du projet.</p>
<h3>1) Créer l'application Next.js</h3>
${ol(["Ouvre VS Code → Fichier → <strong>Ouvrir le dossier</strong> → choisis <code>Documents/gestion_formation</code>.", "Ouvre le terminal intégré : menu <strong>Terminal → Nouveau terminal</strong>.", "Tape la commande :"])}
${code("npx create-next-app@latest . --typescript --eslint --app --tailwind --src-dir --import-alias \"@/*\"")}
<p>S'il demande « Ok to proceed? », tape <code>y</code> puis Entrée. Réponds <strong>No</strong> à « Turbopack » si tu hésites (peu importe).</p>
${verif("Tape la commande suivante : une page Next.js doit s'ouvrir sur http://localhost:3000.")}
${code("npm run dev")}
<p>Ouvre ${link("http://localhost:3000", "http://localhost:3000")} dans ton navigateur. Tu vois la page d'accueil Next.js ✅. (Pour arrêter : reviens au terminal et fais Ctrl+C.)</p>
${check("e3a", "L'app démarre en local sur localhost:3000")}
<h3>2) Brancher Supabase</h3>
${ol(["Dans le terminal, installe la brique Supabase :"])}
${code("npm install @supabase/supabase-js @supabase/ssr")}
${ol([
  "Récupère tes 2 clés Supabase : dashboard Supabase → ⚙️ <strong>Project Settings</strong> → <strong>API</strong>. Note <strong>Project URL</strong> et la clé <strong>anon public</strong>.",
  "Dans VS Code, crée un fichier nommé exactement <code>.env.local</code> à la racine du projet (clic droit dans l'explorateur → Nouveau fichier).",
  "Colle dedans (remplace par TES valeurs) :",
])}
${code("NEXT_PUBLIC_SUPABASE_URL=colle-ici-ton-Project-URL\nNEXT_PUBLIC_SUPABASE_ANON_KEY=colle-ici-ta-cle-anon-public")}
${warn("Le fichier <code>.env.local</code> contient des clés : il ne doit JAMAIS partir sur GitHub. Vérifie qu'il est listé dans le fichier <code>.gitignore</code> (il y est par défaut avec Next.js).")}
${check("e3b", "Supabase est installé et mes clés sont dans .env.local")}
${bro("Cette étape « technique » est typiquement celle où on appelle un pote qui code. Si tu bloques sur une commande, copie-colle l'erreur à Claude Code, ou envoie un message à Matthieu. C'est exactement pour ça qu'on est là.")}`),

  step(4, "authentification", "Authentification (connexion admin)", "Le portier de l'app",
`<p>On met une page de connexion et on protège les autres pages.</p>
<h3>1) Créer ton compte admin dans Supabase (clic par clic)</h3>
${img("site-supabase-user", "Authentication → Users : on clique « Add user » pour créer ton compte admin.")}
${ol([
  "Dashboard Supabase → menu de gauche <strong>« Authentication »</strong> → onglet <strong>« Users »</strong>.",
  "Clique <strong>« Add user »</strong> → <strong>« Create new user »</strong>.",
  "Saisis ton <strong>email</strong> et un <strong>mot de passe</strong> (note-le), coche « Auto Confirm User », clique <strong>Create user</strong>.",
])}
${verif("Ton email apparaît dans la liste des utilisateurs ✅.")}
${check("e4a", "Mon compte admin existe dans Supabase")}
<h3>2) Créer la page de connexion + la protection</h3>
${img("app-login", "À quoi ressemblera ton écran de connexion (maquette).")}
<p>Là, c'est du code. Le plus simple et fiable pour un débutant : demander à Codex (ou Claude Code) de l'écrire, puis vérifier.</p>
${promptClaude("Dans ce projet Next.js (App Router) avec @supabase/ssr déjà installé, crée une page de connexion sur /login (email + mot de passe) qui utilise Supabase Auth, et un middleware qui protège toutes les pages sauf /login en redirigeant les visiteurs non connectés vers /login. Ajoute aussi un bouton de déconnexion. Explique-moi simplement ce que tu as créé.")}
${callout("Un <strong>middleware</strong> est un videur à l'entrée : il vérifie le badge avant de laisser voir la page.")}
${verif("Lance <code>npm run dev</code>. Va sur http://localhost:3000/dashboard SANS être connecté → tu es renvoyé vers /login. Connecte-toi → tu entres. ✅")}
${warn("Ne jamais écrire un mot de passe en clair dans le code. C'est Supabase qui les stocke, chiffrés.")}
${check("e4b", "Sans connexion je suis bloqué ; avec connexion j'entre")}
${bro("L'authentification impressionne sur le papier, mais Supabase fait 90 % du boulot. Si tu coinces, c'est NORMAL — appelle-moi ou sonne Matthieu. Il m'a demandé de t'aider justement pour ces étapes « techniques ».")}`),

  step(5, "module-personnes", "Module Personnes", "Le cœur du CRM",
`<p>Liste, ajout, modification, suppression, recherche et filtres des personnes.</p>
<h3>Pages à créer</h3>
${table(["Adresse", "Rôle"], [["/people", "Liste + recherche + filtre par statut"], ["/people/new", "Formulaire d'ajout"], ["/people/[id]", "Détail + modification + suppression"]])}
${img("app-people", "Maquette de la liste des personnes : recherche, filtre, ajout, export.")}
${img("app-person-form", "Maquette du formulaire d'ajout/modification d'une personne.")}
<h3>La façon simple de les créer</h3>
${promptClaude("Crée le module Personnes pour ce projet Next.js + Supabase. Table 'people' (champs : first_name, last_name, email, phone, status [prospect|inscrit|client|archive], source, notes, created_at). Pages : /people (liste avec barre de recherche par nom et filtre par statut), /people/new (formulaire d'ajout), /people/[id] (détail + modification + suppression). Refuse l'enregistrement si first_name ou last_name est vide, avec un message clair. Style simple et responsive (mobile). Explique-moi comment tester.")}
${verif("Sur /people : j'ajoute « Sophie Martin », elle apparaît dans la liste ; je la cherche, je la modifie, je la supprime. ✅")}
${callout("<strong>Validation</strong> : refuse d'enregistrer si le prénom ou le nom est vide, et affiche un message du type « Le nom est obligatoire ».")}
${check("e5", "Je peux créer, chercher, modifier et supprimer une personne")}`),

  step(6, "module-formations", "Module Formations", "Le catalogue",
`<p>Liste, ajout, modification, suppression des formations.</p>
<h3>Champs (minimum)</h3>
<p>Nom, description, type (présentiel/distanciel/mixte), prix, statut, date de début, date de fin.</p>
${promptClaude("Crée le module Formations (table 'courses' : name, description, type, price, status, start_date, end_date) sur le même modèle que mon module Personnes : page liste /courses, ajout, modification, suppression. Style cohérent avec le reste. Explique comment tester.")}
${verif("Sur /courses : je crée « Initiation Excel » à 450 €, je la modifie, je la supprime. ✅")}
${check("e6", "Je gère mes formations de bout en bout")}`),

  step(7, "module-inscriptions", "Module Inscriptions", "Relier personne et formation",
`<p>On relie une personne à une formation et on suit ses statuts.</p>
<h3>Champs</h3><p>Personne, formation, statut d'inscription, statut de présence, statut de paiement, commentaire.</p>
${img("app-enroll", "Maquette : sur la fiche d'une personne, ses inscriptions avec les 3 statuts modifiables.")}
${promptClaude("Sur la fiche d'une personne (/people/[id]), ajoute un bouton « Inscrire à une formation » qui crée une ligne dans la table 'enrollments' (person_id, course_id, enrollment_status, attendance_status, payment_status, comment). Affiche la liste des inscriptions de la personne avec des menus pour changer les 3 statuts. Empêche d'inscrire deux fois la même personne à la même formation, avec un message clair. Explique comment tester.")}
${verif("Depuis Sophie, je l'inscris à Excel ; je change son paiement de « impayé » à « payé » ; réessayer de l'inscrire à Excel affiche un message d'erreur clair. ✅")}
${check("e7", "Je peux inscrire une personne et suivre ses statuts")}`),

  step(8, "mini-crm", "Mini-CRM (relances)", "Ne plus oublier personne",
`<p>On gère les relances : quand, comment, priorité, historique.</p>
<h3>Champs</h3><p>Date de prochaine relance, priorité, canal (email/téléphone/sms), statut commercial, compte-rendu.</p>
${img("app-crm", "Maquette des relances : « à relancer aujourd'hui » et « en retard », avec priorité et canal.")}
${promptClaude("Crée un mini-CRM basé sur la table 'crm_followups' (person_id, next_followup_date, priority, channel, commercial_status, outcome, done). Permets d'ajouter une relance sur une personne, de la marquer « faite » (en gardant l'historique), et crée deux vues : /crm/today (relances dont la date est aujourd'hui ou avant, non faites) et /crm/late (relances en retard). Explique comment tester.")}
${verif("J'ajoute une relance pour demain, elle n'apparaît pas dans « aujourd'hui » ; j'en ajoute une pour hier, elle apparaît dans « en retard ». ✅")}
${check("e8", "Le CRM me dit qui relancer aujourd'hui et qui est en retard")}`),

  step(9, "tableau-de-bord", "Tableau de bord", "Les chiffres clés",
`<p>Une page d'accueil qui résume tout.</p>
<h3>Indicateurs</h3><p>Total personnes, prospects, inscrits, formations en cours, paiements en attente, relances du jour, relances en retard.</p>
${img("app-dashboard", "Maquette du tableau de bord : les 7 chiffres clés en cartes.")}
${promptClaude("Crée une page /dashboard qui affiche 7 cartes chiffrées : nombre total de personnes, nombre de prospects, nombre d'inscrits, formations en cours, paiements en attente, relances du jour, relances en retard. Chaque carte fait une requête simple à Supabase. Design en grille, responsive. Explique comment tester.")}
${verif("Sur /dashboard, les chiffres correspondent à ce que j'ai saisi (ex. 1 prospect si j'ai créé Sophie en prospect). ✅")}
${check("e9", "Mon tableau de bord affiche les bons chiffres")}`),

  step(10, "export-csv", "Export CSV", "Récupérer ses données",
`<p>Un bouton qui télécharge les données en fichier <strong>.csv</strong> (ouvrable dans Excel).</p>
${promptClaude("Ajoute un bouton « Exporter en CSV » sur les listes Personnes, Formations, Inscriptions et Relances. Le bouton génère et télécharge un fichier .csv propre (une ligne par fiche, colonnes séparées par des virgules, en-têtes en français). Explique comment tester.")}
${verif("Je clique « Exporter en CSV » sur /people, le fichier se télécharge et s'ouvre correctement dans Excel. ✅")}
${callout("<strong>CSV</strong> = un tableau en texte simple, universel. C'est aussi ta <strong>sauvegarde gratuite</strong> : fais-en régulièrement.")}
${check("e10", "Je peux récupérer toutes mes données en CSV")}`),

  step(11, "securite", "Sécurité minimale", "Protéger l'app et les données",
`<p>Quelques règles simples mais essentielles.</p>
${ol([
  "Validation des formulaires (champs obligatoires, email valide) — normalement déjà en place.",
  "Toutes les pages admin protégées par la connexion (fait à l'étape 4).",
  "Activer la « RLS » dans Supabase (voir ci-dessous).",
])}
${promptClaude("Active et configure la Row Level Security (RLS) sur toutes mes tables Supabase pour que seules les requêtes d'un utilisateur authentifié puissent lire/écrire les données. Donne-moi le SQL à exécuter dans le SQL Editor et explique-le simplement.")}
${callout("<strong>RLS (Row Level Security)</strong> = des règles DANS la base qui décident qui a le droit de lire/écrire. C'est une 2e barrière en plus du portier de l'app.")}
${verif("Dans Supabase → onglet « Advisors » (ou « Security »), il ne reste plus d'alerte « RLS disabled ». ✅")}
${warn("Vérifie régulièrement l'onglet « Advisors » de Supabase : il signale les failles de configuration courantes.")}
${check("e11", "La RLS est active et aucun secret n'est en dur dans le code")}`),

  step(12, "rgpd", "RGPD simple", "Respecter les données personnelles",
`<p>Tu gères des données de personnes : la loi (RGPD) demande quelques garanties simples.</p>
${ol([
  "Pouvoir SUPPRIMER une personne et toutes ses données (déjà prévu : suppression en cascade dans le schéma).",
  "Pouvoir EXPORTER les données d'une personne (son CSV à elle).",
  "Demander le CONSENTEMENT (case à cocher ; le champ existe déjà dans la table people).",
  "Noter une DURÉE de conservation (ex. archiver après X années sans contact).",
  "Tenir un journal minimal des actions importantes (création/suppression).",
])}
${promptClaude("Ajoute les fonctions RGPD : 1) sur la fiche personne, un bouton « Exporter ses données » (CSV de cette personne) ; 2) une case à cocher « consentement » avec date, enregistrée dans people.consent / consent_date ; 3) une table 'audit_log' simple qui enregistre les créations et suppressions de personnes (qui, quoi, quand). Explique comment tester.")}
${callout("Le RGPD en clair : ne garde que l'utile, dis aux gens ce que tu fais de leurs données, et permets-leur d'y accéder ou de les effacer.")}
${check("e12", "Je peux supprimer/exporter une personne et le consentement est géré")}`),

  step(13, "tests", "Tests", "Vérifier que tout marche, automatiquement",
`<p>Des petits programmes qui vérifient l'app à ta place.</p>
${ol(["Dans le terminal, installe l'outil de test :"])}
${code("npm install -D vitest")}
${promptClaude("Mets en place Vitest dans ce projet et écris 6 tests simples : création d'une personne, création d'une formation, inscription d'une personne, création d'une relance, génération d'un export CSV, et accès refusé à une page protégée sans connexion. Ajoute un script \"test\" dans package.json. Explique comment les lancer.")}
${ol(["Lance les tests :"])}
${code("npm test")}
${verif("Les 6 tests s'affichent en vert (« passed »). ✅")}
${callout("Un test « passe » (vert) ou « échoue » (rouge). S'il devient rouge après une modif, tu as cassé quelque chose : tu le vois tout de suite.")}
${check("e13", "Mes 6 tests de base passent au vert")}`),

  step(14, "deploiement", "Déploiement (mise en ligne)", "Rendre l'app accessible (clic par clic)",
`<p>On publie l'app sur Internet avec Vercel.</p>
<h3>1) Envoyer le code sur GitHub</h3>
${ol(["Dans le terminal du projet :"])}
${code("git add -A\ngit commit -m \"Mon avancement\"\ngit push")}
<h3>2) Importer dans Vercel</h3>
${ol([
  `Va sur ${link("https://vercel.com/new", "https://vercel.com/new")}.`,
  "Trouve ton dépôt <code>gestion_formation</code> dans la liste, clique <strong>Import</strong>. (Si tu ne le vois pas : clique « Adjust GitHub App Permissions » et autorise le dépôt.)",
  "À la section <strong>Environment Variables</strong>, ajoute tes 2 clés (les mêmes que .env.local) :",
])}
${table(["Name", "Value"], [["NEXT_PUBLIC_SUPABASE_URL", "ton URL Supabase"], ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "ta clé anon"]])}
${img("site-vercel", "L'écran d'import Vercel : importer le dépôt, coller les 2 clés, puis « Deploy ».")}
${ol(["Clique <strong>Deploy</strong> et patiente 1-2 minutes."])}
${verif("Vercel affiche « Congratulations » avec une adresse en <code>.vercel.app</code>. Ouvre-la sur ton téléphone : ton app est en ligne ! ✅")}
<h3>Revenir en arrière si ça casse</h3>
<p>Vercel → ton projet → onglet <strong>« Deployments »</strong> → choisis une version qui marchait → bouton <strong>« … » → « Promote to Production »</strong>. L'ancienne version revient en 1 clic.</p>
${warn("Ne mets jamais les clés directement dans le code : toujours dans les « Environment Variables » de Vercel.")}
${check("e14", "Mon app est en ligne et accessible depuis le téléphone")}
${bro("Le jour où l'appli s'ouvre sur ton téléphone… savoure. 🎉 Tu auras mis EN LIGNE un vrai logiciel. Envoie le lien à Matthieu, il sera fier (et un peu jaloux que tu y sois arrivé).")}`),

  step(15, "documentation", "Documentation", "Pour s'y retrouver plus tard",
`<p>On écrit un mode d'emploi simple dans le fichier <code>README.md</code> du projet.</p>
${promptClaude("Rédige un README.md clair et simple (pour débutant) qui explique : comment lancer l'app en local, comment créer une formation, comment inscrire une personne, comment faire une relance, comment exporter les données, et une section « problèmes fréquents ». Ton accessible.")}
${callout("Écris la doc <strong>au fur et à mesure</strong>, pas à la fin : c'est plus facile et tu n'oublies rien.")}
${check("e15a", "Le README explique comment lancer et utiliser l'app")}
${check("e15b", "🎉 Le MVP est terminé, en ligne, testé et documenté")}
${motMatthieu("Bravo Franck, pour de vrai. 👏 Parti de zéro, tu as construit une appli complète, étape par étape. C'est exactement ce que j'espérais. Maintenant tu n'es plus « le débutant » : tu es celui qui a fini le projet. Va le dire, et prends un moment pour être fier. 🍻")}`),

  /* ===== 98 — AGENTS IA ===== */
  {
    slug: "98-agents-ia",
    tag: "Aller plus loin",
    title: "Te faire aider par des agents IA",
    sub: "Pour maintenir le projet sans rester seul — la vérité, sans bla-bla",
    body: `
<p>Une appli n'est jamais « finie » : il faut la corriger, l'améliorer, l'entretenir. Bonne nouvelle : tu peux te faire aider par des <strong>agents IA</strong>.</p>
${callout(
  "<strong>Un agent IA, c'est quoi ?</strong> Un assistant à qui tu confies une mission en français (« ajoute un bouton pour exporter les paiements »). Il lit ton projet, fait le travail, et te montre ce qu'il a changé. Claude Code (celui qui a démarré ce projet) en est un."
)}
<h3>Comment démarrer</h3>
${ol([
  `Va sur ${link("https://code.claude.com", "https://code.claude.com")} et connecte-toi.`,
  "Ouvre ton dépôt <code>gestion_formation</code>.",
  "Écris ta demande en français, comme à un collègue (« peux-tu… »).",
  "Lis ce qu'il propose, pose des questions si tu ne comprends pas.",
  "Teste le résultat AVANT de le mettre en ligne.",
])}
${callout(
  "Tu peux aussi créer des <strong>agents qui travaillent en arrière-plan</strong> : par exemple un agent qui surveille tes modifications sur GitHub et corrige tout seul quand un test casse. Pratique pour l'entretien au long cours — Matthieu pourra t'aider à le mettre en place une première fois."
)}
<h3>La vérité, sans te mentir</h3>
${warn(
  "Un agent IA est puissant mais <strong>il peut se tromper avec aplomb</strong> (être sûr de lui en ayant tort). Ce n'est pas un pilote automatique : c'est un copilote. <strong>Toi, tu restes le chef.</strong>"
)}
<p>Trois réflexes non négociables :</p>
<ul><li><strong>Toujours relire</strong> ce que l'agent change avant d'accepter.</li><li><strong>Toujours tester</strong> avant de mettre en ligne.</li><li><strong>Toujours garder une sauvegarde</strong> (export CSV régulier).</li></ul>
${bro(
  "Pourquoi je te dis ça franchement ? Parce que Matthieu m'a demandé de t'<strong>aider</strong>, pas de te raconter que tout est facile. Un bon copilote dit la vérité. Les agents IA vont te faire gagner un temps fou — à condition que tu gardes la main et le bon sens. Et ça, tu l'as déjà."
)}
${check("ia-ok", "J'ai compris : l'IA m'aide, mais je garde la main et je vérifie toujours")}
`,
  },

  /* ===== 99 — DÉPANNAGE ===== */
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
  ["Localhost", "Ton ordinateur ; l'app tourne juste pour toi"],
])}
<h3>Problèmes fréquents et solutions</h3>
${table(["Symptôme", "Cause probable → Solution"], [
  ["« n'est pas reconnu » / « command not found »", "Logiciel pas installé ou terminal pas redémarré → ferme et rouvre le terminal, revérifie l'installation."],
  ["npm run dev échoue", "Briques manquantes → lance <code>npm install</code> puis réessaie."],
  ["Page blanche / erreur Supabase", "Clés .env.local manquantes ou fausses → recopie-les depuis Supabase (Settings → API)."],
  ["« Invalid login credentials »", "Mauvais email/mot de passe, ou compte admin pas créé → vérifie Authentication dans Supabase."],
  ["Projet Supabase « paused »", "Plan gratuit en pause après 1 semaine → clique « Restore » dans le dashboard Supabase."],
  ["Déploiement Vercel échoue", "Variables d'environnement oubliées → ajoute-les dans Vercel → Settings → Environment Variables → Redeploy."],
])}
${callout(
  "Règle d'or du dépannage : <strong>lis le message d'erreur en entier</strong> (il dit souvent quoi faire), puis colle-le à Claude Code en demandant « explique-moi cette erreur simplement et corrige-la »."
)}
<h3>Où trouver de l'aide</h3>
<ul>
<li>Doc Supabase : ${link("https://supabase.com/docs", "supabase.com/docs")} — Doc Vercel : ${link("https://vercel.com/docs", "vercel.com/docs")}.</li>
<li>Claude Code : ${link("https://code.claude.com", "code.claude.com")} — ouvre le dépôt et décris ton blocage.</li>
<li><strong>Matthieu</strong>, ton beau-frère : il m'a demandé de t'aider et il s'y connaît en dev — parfait pour un coup de main technique.</li>
</ul>
${bro(
  "Dernier rappel : <strong>demander de l'aide n'est pas tricher</strong>, c'est la bonne méthode. Utilise-moi à fond, et sollicite Matthieu sans gêne. Un blocage partagé, c'est un blocage à moitié résolu. On est une équipe, Franck."
)}
`,
  },
];

/* ----- Boîte à prompts Codex : rassemble automatiquement tous les prompts ----- */
function unesc(s) {
  return String(s).replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");
}
// Le prompt de CONTEXTE à coller en tout premier dans Codex
const CONTEXT_PROMPT =
  "Tu es mon assistant de code. Je suis débutant, explique simplement et n'agis que sur ce que je demande.\n" +
  "Projet : une PWA de gestion de formations (mini-CRM pour un organisme de formation).\n" +
  "Stack : Next.js (App Router) + TypeScript + Tailwind, base de données et authentification via Supabase (@supabase/supabase-js et @supabase/ssr).\n" +
  "La base contient déjà ces tables : users, people, organizations, trainers, courses, sessions, enrollments, payments, crm_followups, notes, documents, satisfaction_surveys (voir db/schema.sql).\n" +
  "Règles : code simple, lisible, commenté en français, responsive (mobile d'abord), pas de dépendance inutile, messages d'erreur clairs en français. Ne mets jamais de secret en dur dans le code (utilise .env.local). Après chaque tâche, explique-moi comment tester.\n" +
  "Réponds OK si tu as compris, puis attends ma première demande.";

function extractPrompts() {
  const out = [{ title: "0) À coller en TOUT PREMIER — le contexte du projet", text: CONTEXT_PROMPT }];
  const re = /<div class="prompt">[\s\S]*?<pre><code>([\s\S]*?)<\/code><\/pre>/g;
  NOTICES.forEach((n) => {
    let m;
    while ((m = re.exec(n.body))) out.push({ title: n.title, text: unesc(m[1]) });
  });
  return out;
}

const codexBody =
  `<p>Voici <strong>tous les prompts</strong> du projet, réunis ici pour que tu puisses les copier d'un seul endroit. Un « prompt », c'est juste <strong>la consigne que tu donnes à l'IA en français</strong>.</p>` +
  callout(
    "<strong>Codex, c'est quoi ?</strong> Un assistant de code : tu lui écris ce que tu veux en français, il écrit le code à ta place. Claude Code marche pareil. Le principe est toujours le même : tu colles un prompt, tu lis ce qu'il propose, tu testes, et tu gardes la main."
  ) +
  `<h3>Comment t'en servir, dans l'ordre</h3>` +
  ol([
    "Ouvre ton projet dans Codex (ou Claude Code).",
    "Colle d'abord le <strong>prompt de contexte (0)</strong> ci-dessous : il explique le projet à l'IA. Attends qu'elle réponde « OK ».",
    "Ensuite, pour chaque étape, colle le prompt correspondant.",
    "<strong>Relis</strong> ce qu'elle propose, <strong>teste</strong> en suivant ses indications, et seulement après, passe à la suite.",
  ]) +
  warn(
    "Un prompt n'est pas une formule magique : si le résultat ne te convient pas, réponds simplement à l'IA en français (« ça ne marche pas, j'ai cette erreur : … » ou « peux-tu le faire plus simplement ? »). On affine par la discussion."
  ) +
  extractPrompts()
    .map((p) => `<h3>${p.title}</h3>${code(p.text)}`)
    .join("") +
  bro(
    "Ces prompts, je te les ai écrits pour qu'ils soient clairs et précis — c'est 80 % du secret pour bien se faire aider par une IA. Avec ça, tu n'es jamais devant la page blanche : tu copies, tu colles, tu vérifies. Et si un prompt ne donne pas le bon résultat, dis-le-moi, on l'améliore ensemble."
  ) +
  check("codex-ready", "J'ai compris comment utiliser mes prompts avec Codex");

const codexNotice = {
  slug: "97-prompts-codex",
  tag: "Boîte à prompts",
  title: "Tous tes prompts prêts à l'emploi (Codex)",
  sub: "Copie-colle dans Codex / Claude Code — dans l'ordre",
  body: codexBody,
};
// On insère cette page juste avant la page « agents IA »
const _iaIndex = NOTICES.findIndex((n) => n.slug === "98-agents-ia");
NOTICES.splice(_iaIndex, 0, codexNotice);

/* Collecte toutes les clés de cases à cocher (pour la barre de progression globale) */
const ALL_KEYS = [];
NOTICES.forEach((n) => {
  (n.body.match(/data-key="([^"]+)"/g) || []).forEach((m) => ALL_KEYS.push(m.slice(10, -1)));
});

/* ============================================================
 *  STYLES communs
 * ============================================================ */
const BASE_CSS = `
:root{--blue:#1d4ed8;--slate:#0f172a;--grey:#475569;--line:#e2e8f0;--soft:#f8fafc;--green:#059669;--amber:#d97706;}
*{box-sizing:border-box;}
body{font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:var(--slate);line-height:1.6;margin:0;font-size:16px;background:#f1f5f9;}
h2{font-size:20px;margin:22px 0 8px;padding-bottom:5px;border-bottom:2px solid var(--line);}
h3{font-size:16px;margin:18px 0 6px;color:var(--blue);}
p{margin:8px 0;} ul{margin:8px 0;padding-left:22px;} li{margin:5px 0;}
a.ext{color:var(--blue);word-break:break-all;font-weight:600;}
code{background:#eef2ff;color:#3730a3;padding:1px 5px;border-radius:4px;font-size:.92em;}
table{border-collapse:collapse;width:100%;margin:12px 0;font-size:14px;}
th,td{border:1px solid var(--line);padding:7px 10px;text-align:left;vertical-align:top;}
th{background:var(--blue);color:#fff;font-weight:600;} tr:nth-child(even) td{background:var(--soft);}
ol.steps{counter-reset:s;list-style:none;padding-left:0;margin:10px 0;}
ol.steps>li{counter-increment:s;position:relative;padding:8px 10px 8px 44px;border:1px solid var(--line);background:#fff;border-radius:8px;margin:7px 0;}
ol.steps>li::before{content:counter(s);position:absolute;left:8px;top:8px;width:26px;height:26px;background:var(--blue);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;}
.verif{background:#ecfdf5;border-left:4px solid var(--green);padding:10px 14px;border-radius:6px;margin:12px 0;font-size:14.5px;}
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
.prompt{border:1px dashed #94a3b8;border-radius:8px;padding:8px 10px;margin:12px 0;background:#fff;}
.prompt-h{font-weight:600;color:#475569;font-size:13.5px;margin-bottom:4px;}
.check{display:flex;gap:10px;align-items:flex-start;background:#fff;border:1px solid var(--line);border-radius:6px;padding:10px 12px;margin:8px 0;cursor:pointer;}
.check input{margin-top:3px;width:18px;height:18px;flex:0 0 auto;}
.check span{font-size:14.5px;}
.pill{display:inline-block;color:#fff;font-size:11px;padding:1px 8px;border-radius:10px;vertical-align:middle;background:var(--blue);}
.pill.green{background:var(--green);}
.fig{margin:14px 0;}
.fig img{width:100%;border:1px solid var(--line);border-radius:10px;box-shadow:0 6px 18px rgba(15,23,42,.10);display:block;}
.fig figcaption{font-size:12.5px;color:var(--grey);margin-top:6px;text-align:center;font-style:italic;}
.bro{background:linear-gradient(135deg,#fef3c7,#fde68a);border:1px solid #fcd34d;border-radius:10px;padding:12px 16px;margin:16px 0;}
.bro-h{font-weight:700;color:#92400e;margin-bottom:2px;}
.bro p{margin:4px 0;color:#451a03;}
.bro-sign{font-size:12.5px;color:#92400e;margin-top:6px;font-style:italic;}
.matt{background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid #93c5fd;border-radius:10px;padding:12px 16px;margin:16px 0;}
.matt-h{font-weight:700;color:#1e40af;margin-bottom:2px;}
.matt p{margin:4px 0;color:#1e3a5f;}
.matt-sign{font-size:12.5px;color:#1e40af;margin-top:6px;font-style:italic;}
`;

const PAGE_JS = `
document.querySelectorAll('.copy').forEach(function(b){b.addEventListener('click',function(){var c=b.parentElement.querySelector('code').innerText;navigator.clipboard.writeText(c).then(function(){b.textContent='Copié ✓';setTimeout(function(){b.textContent='Copier';},1500);});});});
var ALL=__ALLKEYS__;
function refresh(){var done=0;ALL.forEach(function(k){if(localStorage.getItem('gf_'+k)==='1')done++;});var pct=ALL.length?Math.round(done/ALL.length*100):0;var bar=document.getElementById('pbar');if(bar)bar.style.width=pct+'%';var lbl=document.getElementById('plabel');if(lbl)lbl.textContent=done+' / '+ALL.length+' étapes cochées ('+pct+'%)';}
document.querySelectorAll('input[data-key]').forEach(function(b){var k='gf_'+b.dataset.key;if(localStorage.getItem(k)==='1')b.checked=true;b.addEventListener('change',function(){localStorage.setItem(k,b.checked?'1':'0');refresh();});});
refresh();
var burger=document.getElementById('burger'),sb=document.getElementById('sidebar');
if(burger)burger.addEventListener('click',function(){sb.classList.toggle('open');});
document.querySelectorAll('.navlink').forEach(function(a){a.addEventListener('click',function(){if(sb)sb.classList.remove('open');});});
`;

/* ============================================================
 *  GÉNÉRATION DES PAGES (mini-site multi-pages)
 * ============================================================ */
function navHtml(activeIndex) {
  return NOTICES.map(
    (n, i) =>
      `<a href="${pageName(i)}" class="navlink${i === activeIndex ? " active" : ""}"><span class="navtag">${n.tag}</span>${n.title}</a>`
  ).join("");
}
function pageName(i) {
  return String(i).padStart(2, "0") + "-" + NOTICES[i].slug.replace(/^\d+-/, "") + ".html";
}
function pageShell(i) {
  const n = NOTICES[i];
  const prev = i > 0 ? `<a class="navbtn" href="${pageName(i - 1)}">◀ Précédent</a>` : `<a class="navbtn" href="../index.html">◀ Sommaire</a>`;
  const next = i < NOTICES.length - 1 ? `<a class="navbtn primary" href="${pageName(i + 1)}">Suivant ▶</a>` : `<a class="navbtn primary" href="../index.html">Terminé — Sommaire ▶</a>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${n.title} — Kit de Franck</title>
<style>${BASE_CSS}
.topbar{position:sticky;top:0;z-index:30;background:var(--blue);color:#fff;display:flex;align-items:center;gap:12px;padding:10px 14px;}
.topbar h1{font-size:15px;margin:0;flex:1;}
.burger{background:rgba(255,255,255,.2);border:none;color:#fff;font-size:18px;border-radius:6px;padding:4px 10px;cursor:pointer;}
.progress{height:6px;background:rgba(255,255,255,.25);} .progress>div{height:100%;background:#a7f3d0;width:0;transition:width .3s;}
.plabel{font-size:11px;color:#475569;padding:4px 14px;background:#fff;border-bottom:1px solid var(--line);}
.layout{display:flex;max-width:1100px;margin:0 auto;}
.sidebar{width:280px;flex:0 0 auto;background:#fff;border-right:1px solid var(--line);padding:10px;height:calc(100vh - 52px);position:sticky;top:52px;overflow:auto;}
.navlink{display:block;padding:7px 10px;border-radius:6px;color:var(--slate);text-decoration:none;font-size:13px;border-left:3px solid transparent;}
.navlink:hover{background:var(--soft);} .navlink.active{background:#eff6ff;border-left-color:var(--blue);font-weight:600;}
.navtag{display:block;font-size:10px;color:var(--blue);font-weight:700;text-transform:uppercase;}
.content{flex:1;min-width:0;padding:18px 22px 40px;}
.card{background:#fff;border:1px solid var(--line);border-radius:10px;padding:18px 20px;}
.crumb{font-size:12px;color:var(--blue);font-weight:700;text-transform:uppercase;}
.navbar{display:flex;justify-content:space-between;gap:10px;margin-top:24px;}
.navbtn{display:inline-block;padding:11px 16px;border-radius:8px;background:#fff;border:1px solid var(--line);color:var(--slate);text-decoration:none;font-weight:600;font-size:14px;}
.navbtn.primary{background:var(--blue);color:#fff;border-color:var(--blue);}
@media(max-width:820px){
 .sidebar{position:fixed;left:0;top:52px;z-index:25;transform:translateX(-100%);transition:transform .25s;box-shadow:2px 0 12px rgba(0,0,0,.15);width:84%;max-width:320px;}
 .sidebar.open{transform:translateX(0);} .content{padding:14px;} body{font-size:15.5px;}
}
@media(min-width:821px){ .burger{display:none;} }
</style></head><body>
<div class="topbar"><button class="burger" id="burger">☰</button><h1>Le kit de Franck — ${n.tag}</h1></div>
<div class="progress"><div id="pbar"></div></div>
<div class="plabel" id="plabel"></div>
<div class="layout">
 <aside class="sidebar" id="sidebar">${navHtml(i)}</aside>
 <main class="content">
   <div class="card">
     <div class="crumb">${n.tag} — page ${i + 1} / ${NOTICES.length}</div>
     <h2 style="border:none;margin:6px 0 2px">${n.title}</h2>
     <div style="color:var(--grey);font-size:14px;margin-bottom:8px">${n.sub}</div>
     ${n.body}
     <div class="navbar">${prev}${next}</div>
   </div>
 </main>
</div>
<script>${PAGE_JS.replace("__ALLKEYS__", JSON.stringify(ALL_KEYS))}</script>
</body></html>`;
}
function buildPages() {
  if (!fs.existsSync(PAGES_DIR)) fs.mkdirSync(PAGES_DIR, { recursive: true });
  // nettoie les anciennes pages
  fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith(".html")).forEach((f) => fs.unlinkSync(path.join(PAGES_DIR, f)));
  NOTICES.forEach((n, i) => fs.writeFileSync(path.join(PAGES_DIR, pageName(i)), pageShell(i)));
  console.log("Pages générées : " + NOTICES.length + " dans pages/");
}

/* ============================================================
 *  SOMMAIRE (index.html)
 * ============================================================ */
function buildIndex() {
  const items = NOTICES.map(
    (n, i) =>
      `<a class="tile" href="pages/${pageName(i)}"><div class="tnum">${String(i).padStart(2, "0")}</div><div><div class="ttag">${n.tag}</div><div class="ttitle">${n.title}</div><div class="tsub">${n.sub}</div></div></a>`
  ).join("");
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Le kit de Franck — Sommaire</title><style>${BASE_CSS}
.hero{background:linear-gradient(135deg,#1d4ed8,#1e3a8a);color:#fff;padding:30px 22px;}
.hero h1{margin:0 0 6px;font-size:26px;} .hero p{margin:4px 0;opacity:.95;}
.wrap{max-width:900px;margin:0 auto;padding:18px;}
.plabel{font-size:13px;color:#475569;margin:6px 0 14px;}
.progress{height:8px;background:#e2e8f0;border-radius:6px;overflow:hidden;margin:8px 0 2px;} .progress>div{height:100%;background:var(--green);width:0;transition:width .3s;}
.tile{display:flex;gap:14px;align-items:center;background:#fff;border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin:8px 0;text-decoration:none;color:var(--slate);}
.tile:hover{border-color:var(--blue);box-shadow:0 2px 8px rgba(29,78,216,.08);}
.tnum{flex:0 0 auto;width:40px;height:40px;background:#eff6ff;color:var(--blue);border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;}
.ttag{font-size:10.5px;color:var(--blue);font-weight:700;text-transform:uppercase;}
.ttitle{font-weight:700;} .tsub{font-size:13px;color:var(--grey);}
</style></head><body>
<div class="hero"><div class="wrap" style="padding:0">
<h1>👋 Le kit de Franck</h1>
<p>Le guide pas-à-pas pour construire l'appli de gestion de formations — de A à Z, sans avoir jamais codé.</p>
<p style="font-size:13px">Préparé par Claude, à la demande de Matthieu (ton beau-frère). Clique une étape pour l'ouvrir.</p>
</div></div>
<div class="wrap">
<div class="progress"><div id="pbar"></div></div>
<div class="plabel" id="plabel">Progression…</div>
${items}
</div>
<script>
var ALL=${JSON.stringify(ALL_KEYS)};
var done=0;ALL.forEach(function(k){if(localStorage.getItem('gf_'+k)==='1')done++;});
var pct=ALL.length?Math.round(done/ALL.length*100):0;
document.getElementById('pbar').style.width=pct+'%';
document.getElementById('plabel').textContent=done+' / '+ALL.length+' étapes cochées ('+pct+'%) — ta progression est sauvegardée dans ce navigateur.';
</script>
</body></html>`;
  fs.writeFileSync(path.join(OUT, "index.html"), html);
  console.log("Sommaire généré : index.html");
}

/* ============================================================
 *  NOTICES PDF (version imprimable, sans JS)
 * ============================================================ */
function buildPdfPages() {
  if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR, { recursive: true });
  fs.readdirSync(PDF_DIR).filter((f) => f.endsWith(".html") || f.endsWith(".pdf")).forEach((f) => fs.unlinkSync(path.join(PDF_DIR, f)));
  NOTICES.forEach((n, i) => {
    const body = n.body.replace(/<button class="copy"[^>]*>Copier<\/button>/g, "");
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>${n.title}</title><style>${BASE_CSS}
body{background:#fff;}
@page{margin:15mm;}
.page{max-width:780px;margin:0 auto;padding:10px;}
.cover{border-bottom:4px solid var(--blue);padding-bottom:12px;margin-bottom:16px;}
.cover .kicker{color:var(--blue);font-weight:700;text-transform:uppercase;font-size:11px;letter-spacing:.06em;}
.cover h1{font-size:23px;margin:6px 0 2px;} .cover .sub{color:var(--grey);font-size:13px;}
.cover .meta{margin-top:8px;color:var(--grey);font-size:11px;}
ol.steps>li,.check,table,.callout,.warnbox,.verif,.decision,.codewrap,.prompt,.bro,.matt{break-inside:avoid;}
footer{margin-top:24px;padding-top:10px;border-top:1px solid var(--line);color:var(--grey);font-size:10.5px;text-align:center;}
</style></head><body><div class="page">
<div class="cover"><div class="kicker">Le kit de Franck — PWA Gestion de formations</div>
<h1>${n.title}</h1><div class="sub">${n.sub}</div>
<div class="meta">Notice ${String(i).padStart(2, "0")} / ${NOTICES.length - 1} &nbsp;•&nbsp; Guide perso pour Franck &nbsp;•&nbsp; juin 2026</div></div>
${body}
<footer>Le kit de Franck — Notice « ${n.tag} » • Projet PWA Gestion de formations</footer>
</div></body></html>`;
    fs.writeFileSync(path.join(PDF_DIR, pageName(i)), html);
  });
  console.log("Notices PDF (HTML) générées : " + NOTICES.length + " dans pdf/");
}

buildPages();
buildIndex();
buildPdfPages();
console.log("Terminé. " + ALL_KEYS.length + " cases à cocher au total.");
