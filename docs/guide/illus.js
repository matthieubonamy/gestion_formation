/**
 * Génère les ILLUSTRATIONS du kit de Franck (rendues ensuite en PNG par Chromium).
 *
 * Deux familles :
 *  - "browser" : reproductions annotées des pages partenaires (Node, GitHub,
 *    Supabase, Vercel) avec la vraie URL et le bouton à cliquer entouré.
 *    => ce sont des ILLUSTRATIONS pédagogiques, pas des captures réelles.
 *  - "app" : maquettes (mockups) des écrans de l'application à créer.
 *
 * Sortie : un fichier HTML par illustration dans img/_src/, puis le script
 * shell les transforme en img/NAME.png.
 */
const fs = require("fs");
const path = require("path");
const SRC = path.join(__dirname, "img", "_src");
fs.mkdirSync(SRC, { recursive: true });

/* ---------- styles communs ---------- */
const CSS = `
*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}
body{width:1000px;height:700px;background:#eef2f7;overflow:hidden;position:relative;}
.canvas{position:absolute;inset:0;}
/* fenêtre navigateur */
.win{position:absolute;top:30px;left:40px;right:40px;bottom:30px;background:#fff;border-radius:12px;box-shadow:0 18px 50px rgba(15,23,42,.18);overflow:hidden;border:1px solid #e2e8f0;}
.chrome{height:46px;background:#f1f5f9;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:8px;padding:0 14px;}
.dot{width:12px;height:12px;border-radius:50%;}
.url{flex:1;margin-left:10px;background:#fff;border:1px solid #e2e8f0;border-radius:20px;height:28px;display:flex;align-items:center;padding:0 14px;color:#334155;font-size:13px;}
.url b{color:#0f172a;}
.body{padding:26px 30px;height:calc(100% - 46px);position:relative;}
.brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:20px;}
h1{font-size:24px;margin:14px 0 6px;color:#0f172a;}
p.lead{color:#475569;font-size:14px;margin-bottom:18px;}
.field{background:#fff;border:1px solid #cbd5e1;border-radius:8px;height:42px;display:flex;align-items:center;padding:0 12px;color:#94a3b8;font-size:14px;margin:10px 0;max-width:440px;}
.btn{display:inline-flex;align-items:center;justify-content:center;height:42px;padding:0 20px;border-radius:8px;color:#fff;font-weight:700;font-size:14px;}
.btn.green{background:#16a34a;} .btn.black{background:#0f172a;} .btn.blue{background:#2563eb;} .btn.emerald{background:#059669;}
/* surbrillance + bulle d'annotation */
.ring{position:absolute;border:3px solid #ef4444;border-radius:10px;box-shadow:0 0 0 4px rgba(239,68,68,.18);}
.note{position:absolute;background:#ef4444;color:#fff;font-size:13px;font-weight:700;padding:7px 12px;border-radius:8px;max-width:230px;line-height:1.3;box-shadow:0 8px 20px rgba(239,68,68,.35);}
.note::after{content:"";position:absolute;width:0;height:0;border:8px solid transparent;}
.note.left::after{left:-14px;top:14px;border-right-color:#ef4444;}
.note.down::after{bottom:-14px;left:18px;border-top-color:#ef4444;}
.note.up::after{top:-14px;left:18px;border-bottom-color:#ef4444;}
.step-badge{position:absolute;width:30px;height:30px;border-radius:50%;background:#ef4444;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;box-shadow:0 4px 10px rgba(239,68,68,.4);}
.tablerow{display:grid;grid-template-columns:1.4fr 1fr .8fr 1fr;gap:0;border-bottom:1px solid #eef2f7;padding:11px 8px;font-size:13px;color:#334155;align-items:center;}
.tablehead{background:#f8fafc;font-weight:700;color:#475569;border-radius:8px 8px 0 0;}
.badge{display:inline-block;font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px;}
.b-green{background:#dcfce7;color:#166534;} .b-amber{background:#fef3c7;color:#92400e;} .b-blue{background:#dbeafe;color:#1e40af;} .b-grey{background:#e2e8f0;color:#334155;} .b-red{background:#fee2e2;color:#991b1b;}
.menu{position:absolute;left:0;top:0;bottom:0;width:200px;background:#0f172a;color:#cbd5e1;padding:18px 12px;}
.menu .logo{color:#fff;font-weight:800;font-size:15px;margin:4px 8px 18px;}
.menu a{display:block;padding:9px 12px;border-radius:8px;font-size:13.5px;color:#cbd5e1;margin:3px 0;}
.menu a.on{background:#1e293b;color:#fff;}
.app{position:absolute;inset:0;background:#f1f5f9;}
.appbar{height:54px;background:#fff;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;padding:0 20px 0 220px;font-weight:700;color:#0f172a;}
.content{position:absolute;left:200px;right:0;top:0;bottom:0;padding:20px 24px;overflow:hidden;}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px;}
.kpi{background:#fff;border:1px solid #e8edf3;border-radius:12px;padding:14px 16px;}
.kpi .n{font-size:26px;font-weight:800;color:#0f172a;} .kpi .l{font-size:12px;color:#64748b;margin-top:2px;}
.panel{background:#fff;border:1px solid #e8edf3;border-radius:12px;padding:8px 12px 14px;}
.toolbar{display:flex;gap:10px;align-items:center;margin:6px 0 12px;}
.search{flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;height:38px;display:flex;align-items:center;padding:0 12px;color:#94a3b8;font-size:13px;}
.cap{position:absolute;left:40px;bottom:6px;font-size:12px;color:#64748b;}
.tag-illus{position:absolute;top:8px;right:46px;background:#0f172a;color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:6px;opacity:.85;}
`;

function page(inner) {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><style>${CSS}</style></head><body>${inner}</body></html>`;
}
function browser(url, body, annotations) {
  return page(`<div class="canvas">
   <div class="tag-illus">ILLUSTRATION (pas une capture réelle)</div>
   <div class="win">
     <div class="chrome"><span class="dot" style="background:#f87171"></span><span class="dot" style="background:#fbbf24"></span><span class="dot" style="background:#34d399"></span>
       <div class="url">🔒 ${url}</div>
     </div>
     <div class="body">${body}${annotations || ""}</div>
   </div></div>`);
}
function app(active, content) {
  const items = [
    ["Tableau de bord", "dashboard"],
    ["Personnes", "people"],
    ["Formations", "courses"],
    ["Inscriptions", "enroll"],
    ["Relances", "crm"],
    ["Export CSV", "csv"],
  ];
  const menu = items
    .map((i) => `<a class="${i[1] === active ? "on" : ""}">${i[0]}</a>`)
    .join("");
  return page(`<div class="canvas"><div class="app">
    <div class="appbar">📚 Gestion de formations</div>
    <div class="menu"><div class="logo">📚 Formations</div>${menu}</div>
    <div class="content">${content}</div>
  </div>
  <div class="tag-illus">MAQUETTE de l'écran à créer</div>
  </div>`);
}

/* ============================================================
 *  Les illustrations
 * ============================================================ */
const ILLUS = {};

/* ---- Sites partenaires ---- */
ILLUS["site-node"] = browser(
  "nodejs.org/en/download",
  `<div class="brand">⬡ Node.js</div>
   <h1>Download Node.js</h1>
   <p class="lead">La version recommandée pour la plupart des utilisateurs.</p>
   <div style="position:absolute;left:30px;top:150px;"><span class="btn green" style="height:52px;padding:0 26px;font-size:15px;">⬇ Download Node.js (LTS)</span></div>`,
  `<div class="ring" style="left:28px;top:144px;width:262px;height:56px;"></div>
   <div class="step-badge" style="left:300px;top:152px;">1</div>
   <div class="note left" style="left:344px;top:148px;">Clique le bouton <u>LTS</u> (version stable). Le fichier .msi se télécharge.</div>`
);

ILLUS["site-github"] = browser(
  "github.com/signup",
  `<div class="brand">🐙 GitHub</div>
   <h1>Welcome to GitHub</h1>
   <p class="lead">Let's begin the adventure — crée ton compte gratuit.</p>
   <div style="max-width:440px">
     <div class="field">Enter your email…</div>
     <div class="field">Create a password…</div>
     <div class="field">Enter a username…</div>
     <div style="margin-top:8px"><span class="btn green">Continue →</span></div>
   </div>`,
  `<div class="ring" style="left:28px;top:212px;width:444px;height:42px;"></div>
   <div class="note up" style="left:30px;top:268px;">2 — Remplis email, mot de passe, puis un nom d'utilisateur</div>
   <div class="ring" style="left:28px;top:330px;width:128px;height:42px;"></div>
   <div class="step-badge" style="left:170px;top:336px;">3</div>
   <div class="note left" style="left:214px;top:332px;">Clique « Continue », puis valide le code reçu par email</div>`
);

ILLUS["site-supabase-new"] = browser(
  "supabase.com/dashboard",
  `<div class="brand" style="color:#3ecf8e">⚡ Supabase</div>
   <h1>Create a new project</h1>
   <div style="max-width:460px">
     <p style="font-size:12px;color:#64748b;margin:6px 0 2px">Name</p><div class="field" style="color:#0f172a">gestion-formation</div>
     <p style="font-size:12px;color:#64748b;margin:10px 0 2px">Database Password</p><div class="field">Generate a password…</div>
     <p style="font-size:12px;color:#64748b;margin:10px 0 2px">Region</p><div class="field" style="color:#0f172a">Central EU (Frankfurt)</div>
     <div style="margin-top:14px"><span class="btn emerald">Create new project</span></div>
   </div>`,
  `<div class="ring" style="left:28px;top:300px;width:464px;height:42px;"></div>
   <div class="note up" style="left:30px;top:356px;">2 — Génère le mot de passe et <u>note-le</u> précieusement</div>
   <div class="ring" style="left:28px;top:392px;width:196px;height:42px;"></div>
   <div class="step-badge" style="left:238px;top:398px;">3</div>
   <div class="note left" style="left:282px;top:394px;">Clique « Create new project » et patiente ~1 min</div>`
);

ILLUS["site-supabase-sql"] = browser(
  "supabase.com/dashboard → SQL Editor",
  `<div style="display:flex;height:100%">
     <div style="width:150px;border-right:1px solid #eef2f7;padding-right:10px;font-size:12px;color:#64748b">
       <div style="font-weight:800;color:#3ecf8e;margin-bottom:10px">⚡ Supabase</div>
       <div style="padding:6px;border-radius:6px">Table Editor</div>
       <div style="padding:6px;border-radius:6px;background:#ecfdf5;color:#065f46;font-weight:700">SQL Editor</div>
       <div style="padding:6px;border-radius:6px">Authentication</div>
     </div>
     <div style="flex:1;padding-left:16px">
       <div style="background:#0f172a;color:#86efac;border-radius:8px;padding:12px;font-family:monospace;font-size:12px;height:300px;line-height:1.5">create table public.people (<br>&nbsp;&nbsp;id uuid primary key default gen_random_uuid(),<br>&nbsp;&nbsp;first_name text not null,<br>&nbsp;&nbsp;last_name text not null,<br>&nbsp;&nbsp;email text, status text …<br>);<br>— … (tout le contenu de db/schema.sql) …</div>
       <div style="display:flex;justify-content:flex-end;margin-top:12px"><span class="btn green">▶ Run</span></div>
     </div>
   </div>`,
  `<div class="ring" style="left:172px;top:60px;width:300px;height:300px;"></div>
   <div class="note up" style="left:172px;top:372px;">1 — Colle tout le contenu de <b>db/schema.sql</b> ici</div>
   <div class="ring" style="right:24px;top:330px;width:104px;height:54px;"></div>
   <div class="step-badge" style="right:150px;top:342px;">2</div>
   <div class="note up" style="right:18px;top:398px;">Clique « Run ». Message vert « Success » = tables créées ✅</div>`
);

ILLUS["site-supabase-user"] = browser(
  "supabase.com/dashboard → Authentication → Users",
  `<div class="brand" style="color:#3ecf8e">⚡ Authentication · Users</div>
   <div style="display:flex;justify-content:flex-end;margin-top:14px"><span class="btn emerald">+ Add user</span></div>
   <div style="margin-top:18px;border:1px solid #eef2f7;border-radius:10px;overflow:hidden">
     <div class="tablerow tablehead" style="grid-template-columns:1.6fr 1fr 1fr">Email<span>Créé le</span><span>Statut</span></div>
     <div class="tablerow" style="grid-template-columns:1.6fr 1fr 1fr">franck@exemple.fr<span>aujourd'hui</span><span><span class="badge b-green">Confirmé</span></span></div>
   </div>`,
  `<div class="ring" style="right:28px;top:62px;width:128px;height:42px;"></div>
   <div class="step-badge" style="right:170px;top:68px;">1</div>
   <div class="note left" style="right:200px;top:60px;">Clique « Add user » → « Create new user ». Coche « Auto Confirm »</div>
   <div class="ring" style="left:28px;top:150px;width:444px;height:46px;"></div>
   <div class="note down" style="left:30px;top:206px;">2 — Ton compte admin apparaît dans la liste ✅</div>`
);

ILLUS["site-vercel"] = browser(
  "vercel.com/new",
  `<div class="brand">▲ Vercel</div>
   <h1>Import Git Repository</h1>
   <div style="max-width:470px;margin-top:8px">
     <div style="display:flex;align-items:center;justify-content:space-between;border:1px solid #e2e8f0;border-radius:8px;padding:10px 14px;margin:8px 0"><span>🐙 matthieubonamy/gestion_formation</span><span class="btn black" style="height:34px;padding:0 16px">Import</span></div>
     <p style="font-size:12px;color:#64748b;margin:14px 0 4px">Environment Variables</p>
     <div class="field" style="font-size:12px;color:#0f172a">NEXT_PUBLIC_SUPABASE_URL = …</div>
     <div class="field" style="font-size:12px;color:#0f172a">NEXT_PUBLIC_SUPABASE_ANON_KEY = …</div>
     <div style="margin-top:12px"><span class="btn black">Deploy</span></div>
   </div>`,
  `<div class="ring" style="left:382px;top:106px;width:96px;height:46px;"></div>
   <div class="step-badge" style="left:330px;top:116px;">1</div>
   <div class="note left" style="left:498px;top:112px;">Trouve ton dépôt et clique « Import »</div>
   <div class="ring" style="left:28px;top:198px;width:446px;height:98px;"></div>
   <div class="step-badge" style="left:484px;top:230px;">2</div>
   <div class="note left" style="left:524px;top:224px;">Recopie tes 2 clés Supabase (URL + clé anon)</div>
   <div class="ring" style="left:28px;top:300px;width:122px;height:46px;"></div>
   <div class="step-badge" style="left:158px;top:312px;">3</div>
   <div class="note left" style="left:198px;top:306px;">Clique « Deploy » → adresse en .vercel.app 🎉</div>`
);

/* ---- Mockups des écrans de l'app ---- */
ILLUS["app-login"] = page(`<div class="canvas">
  <div style="position:absolute;inset:0;background:linear-gradient(135deg,#1d4ed8,#1e3a8a);display:flex;align-items:center;justify-content:center">
    <div style="background:#fff;border-radius:16px;padding:34px 38px;width:380px;box-shadow:0 24px 60px rgba(0,0,0,.25)">
      <div style="font-size:30px;text-align:center">📚</div>
      <h1 style="text-align:center;font-size:21px;margin:6px 0 2px">Gestion de formations</h1>
      <p class="lead" style="text-align:center">Connexion administrateur</p>
      <p style="font-size:12px;color:#64748b;margin:8px 0 2px">Email</p><div class="field" style="margin:4px 0">franck@exemple.fr</div>
      <p style="font-size:12px;color:#64748b;margin:8px 0 2px">Mot de passe</p><div class="field" style="margin:4px 0">••••••••</div>
      <div class="btn blue" style="width:100%;margin-top:16px">Se connecter</div>
    </div>
  </div>
  <div class="tag-illus">MAQUETTE — écran de connexion (Étape 4)</div>
</div>`);

ILLUS["app-dashboard"] = app(
  "dashboard",
  `<h1 style="font-size:20px">Tableau de bord</h1>
   <p class="lead">Vue d'ensemble de ton activité</p>
   <div class="cards">
     <div class="kpi"><div class="n">128</div><div class="l">Personnes</div></div>
     <div class="kpi"><div class="n">54</div><div class="l">Prospects</div></div>
     <div class="kpi"><div class="n">41</div><div class="l">Inscrits</div></div>
     <div class="kpi"><div class="n">3</div><div class="l">Formations en cours</div></div>
   </div>
   <div class="cards">
     <div class="kpi"><div class="n" style="color:#d97706">7</div><div class="l">Paiements en attente</div></div>
     <div class="kpi"><div class="n" style="color:#2563eb">5</div><div class="l">Relances du jour</div></div>
     <div class="kpi"><div class="n" style="color:#dc2626">2</div><div class="l">Relances en retard</div></div>
     <div class="kpi"><div class="n">450€</div><div class="l">Prix moyen</div></div>
   </div>`
);

ILLUS["app-people"] = app(
  "people",
  `<h1 style="font-size:20px">Personnes</h1>
   <div class="toolbar"><div class="search">🔍 Rechercher un nom…</div><span class="badge b-blue">Statut ▾</span><span class="btn blue" style="height:38px">+ Ajouter</span><span class="btn" style="height:38px;background:#475569">⬇ Export CSV</span></div>
   <div class="panel">
     <div class="tablerow tablehead">Nom<span>Email</span><span>Statut</span><span>Source</span></div>
     <div class="tablerow">Sophie Martin<span>sophie@mail.fr</span><span><span class="badge b-amber">Prospect</span></span><span>Site web</span></div>
     <div class="tablerow">Karim Benali<span>karim@mail.fr</span><span><span class="badge b-green">Inscrit</span></span><span>Salon</span></div>
     <div class="tablerow">Léa Dubois<span>lea@mail.fr</span><span><span class="badge b-blue">Client</span></span><span>Bouche à oreille</span></div>
     <div class="tablerow">Tom Roy<span>tom@mail.fr</span><span><span class="badge b-grey">Archivé</span></span><span>Pub</span></div>
   </div>`
);

ILLUS["app-person-form"] = app(
  "people",
  `<h1 style="font-size:20px">Nouvelle personne</h1>
   <p class="lead">Remplis la fiche (prénom et nom obligatoires)</p>
   <div class="panel" style="max-width:560px">
     <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
       <div><p style="font-size:12px;color:#64748b">Prénom *</p><div class="field" style="color:#0f172a">Sophie</div></div>
       <div><p style="font-size:12px;color:#64748b">Nom *</p><div class="field" style="color:#0f172a">Martin</div></div>
       <div><p style="font-size:12px;color:#64748b">Email</p><div class="field">sophie@mail.fr</div></div>
       <div><p style="font-size:12px;color:#64748b">Téléphone</p><div class="field">06 12 34 56 78</div></div>
       <div><p style="font-size:12px;color:#64748b">Statut</p><div class="field" style="color:#0f172a">Prospect ▾</div></div>
       <div><p style="font-size:12px;color:#64748b">Source</p><div class="field" style="color:#0f172a">Site web</div></div>
     </div>
     <div style="margin-top:8px"><p style="font-size:12px;color:#64748b">Notes</p><div class="field" style="height:60px;align-items:flex-start;padding-top:10px">Intéressée par la formation Excel…</div></div>
     <div style="display:flex;gap:10px;margin-top:14px"><span class="btn blue">Enregistrer</span><span class="btn" style="background:#e2e8f0;color:#334155">Annuler</span></div>
   </div>`
);

ILLUS["app-enroll"] = app(
  "enroll",
  `<h1 style="font-size:20px">Fiche de Sophie Martin</h1>
   <p class="lead">Inscriptions &amp; suivi</p>
   <div class="toolbar"><span class="btn blue" style="height:38px">+ Inscrire à une formation</span></div>
   <div class="panel">
     <div class="tablerow tablehead">Formation<span>Inscription</span><span>Présence</span><span>Paiement</span></div>
     <div class="tablerow">Initiation Excel<span><span class="badge b-green">Inscrit</span></span><span><span class="badge b-grey">Non défini</span></span><span><span class="badge b-red">Impayé ▾</span></span></div>
     <div class="tablerow">Word avancé<span><span class="badge b-green">Inscrit</span></span><span><span class="badge b-green">Présent</span></span><span><span class="badge b-green">Payé ▾</span></span></div>
   </div>`
);

ILLUS["app-crm"] = app(
  "crm",
  `<h1 style="font-size:20px">Relances</h1>
   <div class="toolbar"><span class="badge b-red" style="font-size:13px;padding:6px 12px">⏰ À relancer aujourd'hui (5)</span><span class="badge b-amber" style="font-size:13px;padding:6px 12px">En retard (2)</span></div>
   <div class="panel">
     <div class="tablerow tablehead">Personne<span>Date relance</span><span>Priorité</span><span>Canal</span></div>
     <div class="tablerow">Sophie Martin<span style="color:#dc2626;font-weight:700">Aujourd'hui</span><span><span class="badge b-red">Haute</span></span><span>📞 Téléphone</span></div>
     <div class="tablerow">Karim Benali<span style="color:#dc2626;font-weight:700">Hier (retard)</span><span><span class="badge b-amber">Normale</span></span><span>✉️ Email</span></div>
     <div class="tablerow">Léa Dubois<span>Aujourd'hui</span><span><span class="badge b-grey">Basse</span></span><span>✉️ Email</span></div>
   </div>`
);

/* ---- écriture des fichiers ---- */
const list = [];
Object.keys(ILLUS).forEach((name) => {
  fs.writeFileSync(path.join(SRC, name + ".html"), ILLUS[name]);
  list.push(name);
});
fs.writeFileSync(path.join(SRC, "_list.txt"), list.join("\n"));
console.log("Illustrations HTML générées : " + list.length);
console.log(list.join(", "));
