// API du calendrier promo Duno × Majeur Mineur.
// GET  /posts         -> liste des posts
// POST /posts/<id>    -> modifie date, compte, caption ou « publié » d'un post
// GET/POST /feedback  -> retours sur l'appli (envoyés depuis le bas de page)
const SEED_URL = "https://fidelcastre44-dev.github.io/promo-duno-mm/seed.json";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...CORS } });

const POSTERS = ["", "duno", "mm", "cross"];
const isDate = s => s === "" || /^\d{4}-\d{2}-\d{2}$/.test(s);

async function load(env) {
  const saved = await env.POSTS.get("posts", "json");
  if (saved) return saved;
  const r = await fetch(SEED_URL, { cf: { cacheTtl: 0 } });
  if (!r.ok) throw new Error("Planning de départ introuvable");
  const seed = await r.json();
  await env.POSTS.put("posts", JSON.stringify(seed));
  return seed;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

    if (url.pathname === "/posts" && req.method === "GET") {
      return json(await load(env));
    }

    if (url.pathname === "/feedback" && req.method === "GET") {
      return json((await env.POSTS.get("feedback", "json")) || []);
    }
    if (url.pathname === "/feedback" && req.method === "POST") {
      let body;
      try { body = await req.json(); } catch { return json({ error: "JSON invalide" }, 400); }
      const text = typeof body.text === "string" ? body.text.trim().slice(0, 2000) : "";
      if (!text) return json({ error: "Retour vide" }, 400);
      const who = ["Hugo", "Paul", "Autre"].includes(body.who) ? body.who : "Autre";
      const list = (await env.POSTS.get("feedback", "json")) || [];
      list.push({ at: new Date().toISOString(), who, text });
      await env.POSTS.put("feedback", JSON.stringify(list.slice(-200)));
      return json({ ok: true });
    }

    const m = url.pathname.match(/^\/posts\/([A-Za-z0-9_-]{1,20})$/);
    if (m && req.method === "POST") {
      let patch;
      try { patch = await req.json(); } catch { return json({ error: "JSON invalide" }, 400); }
      const posts = await load(env);
      const p = posts.find(x => x.id === m[1]);
      if (!p) return json({ error: "Post introuvable" }, 404);
      if ("date" in patch) {
        if (typeof patch.date !== "string" || !isDate(patch.date)) return json({ error: "Date invalide" }, 400);
        p.date = patch.date;
      }
      if ("poster" in patch) {
        if (!POSTERS.includes(patch.poster)) return json({ error: "Compte invalide" }, 400);
        p.poster = patch.poster;
      }
      if ("caption" in patch) {
        if (typeof patch.caption !== "string") return json({ error: "Caption invalide" }, 400);
        p.caption = patch.caption.slice(0, 2200);
      }
      if ("done" in patch) {
        const d = patch.done || {};
        p.done = { duno: !!d.duno, mm: !!d.mm };
      }
      p.updatedAt = new Date().toISOString();
      await env.POSTS.put("posts", JSON.stringify(posts));
      return json(p);
    }

    return json({ error: "Introuvable" }, 404);
  },
};
