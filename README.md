# Promo Duno × Majeur Mineur

Calendrier partagé des posts (Reels, Reels d'essai, stories) pour la promo du single *tout c'que je vois c'est toi*. Chaque jour montre ce que Duno et Majeur Mineur doivent poster, avec un lien direct vers la vidéo dans Google Drive.

## Utiliser l'appli

- **Changer une date** : glisser un post sur un autre jour (ordinateur), ou ouvrir le post et choisir la date (téléphone).
- **Publier** : « Ouvrir la vidéo » ouvre le fichier dans Google Drive. Sur téléphone, dans l'appli Drive : ⋮ → *Envoyer une copie* → Instagram ou TikTok.
- **Cocher « Publié »** sur chaque compte une fois le post en ligne.
- Un cadre orange signale deux formats proches à moins de 3 jours d'écart.
- Sur iPhone : Safari → Partager → *Sur l'écran d'accueil* pour l'avoir comme une appli.

## Structure

| Fichier | Rôle |
| --- | --- |
| `index.html` | L'appli (GitHub Pages) |
| `api.json` | Adresse du serveur, réécrite automatiquement au déploiement |
| `worker/` | Serveur Cloudflare (Worker + KV) qui garde les dates et les cases « Publié » |
| `worker/src/seed.json` | Planning de départ, chargé au premier lancement du serveur |

## Mise en route

1. **Settings › Pages** : source *Deploy from a branch*, branche `main`, dossier `/ (root)`.
2. **Settings › Secrets and variables › Actions** : ajouter `CLOUDFLARE_API_TOKEN` (dash.cloudflare.com › My Profile › API Tokens, modèle **Edit Cloudflare Workers**), le même que pour l'appli Cycle convient.
3. **Actions** › « Déployer le serveur du calendrier » › *Run workflow*. Le workflow se relance seul à chaque modification de `worker/`.

Le stockage KV `promo-duno-mm` existe déjà sur le compte Cloudflare.

## Remettre le planning à zéro

`seed.json` n'est lu que si le stockage est vide. Pour repartir d'un nouveau planning, supprimer la clé `posts` du KV `promo-duno-mm` dans le tableau de bord Cloudflare, puis recharger l'appli.

## Limite

L'adresse du serveur est publique : toute personne qui a le lien de l'appli peut modifier les dates. Ne pas le diffuser au-delà de l'équipe.
