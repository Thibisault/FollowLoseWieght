# FollowLoseWieght (PWA)

PWA mobile-first (React + TypeScript + Tailwind) déployable sur GitHub Pages.

## Fonctionnalités
- Choix de l’unité **kg / lb** dans la configuration
- Décimales acceptées avec **virgule** (ex: 71,6)
- Affiche :
  - Objectif total
  - Poids cible
  - **Moyenne / jour** (objectif / durée)
  - **Rythme requis / jour** recalculé selon ton poids du jour et les jours restants
- Offline (données en local)

## Pré-requis
- Node.js 20+
- Git

## Installation (local)
```bash
git clone https://github.com/Thibisault/FollowLoseWieght.git
cd FollowLoseWieght
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Déploiement sur GitHub Pages (recommandé)
Le workflow est inclus : `.github/workflows/deploy.yml`.

1) Push sur `main` :
```bash
git add .
git commit -m "Update PWA"
git push origin main
```
2) GitHub : **Settings → Pages**  
Source : **GitHub Actions**

Le site sera : `https://thibisault.github.io/FollowLoseWieght/`

## Déploiement (commande)
Publie sur la branche `gh-pages` :
```bash
npm run deploy
```
