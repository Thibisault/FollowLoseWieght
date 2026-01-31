# FollowLoseWieght (PWA)

PWA mobile-first (React + TypeScript + Tailwind) déployable sur GitHub Pages.

## Fonctionnement
- Tu choisis :
  - **Durée** (jours)
  - **Poids de départ**
  - **Poids objectif**
  - **Unité** (kg / lb)
- Chaque jour tu entres ton poids
- L’app calcule une **moyenne/jour à perdre** qui se **réajuste** selon le poids actuel et les jours restants.

Formule :
- poids restant à perdre = max(0, poids actuel - poids objectif)
- moyenne/jour = poids restant à perdre / jours restants

## Installation (local)
```bash
git clone https://github.com/Thibisault/FollowLoseWieght.git
cd FollowLoseWieght
npm install
npm run dev
```

## Déploiement GitHub Pages
Workflow inclus : `.github/workflows/deploy.yml`
- Push sur `main`, puis Settings → Pages → Source: GitHub Actions


## Historique
- Liste des poids du plus récent au plus ancien.
- Affiche aussi le **poids de départ**.
