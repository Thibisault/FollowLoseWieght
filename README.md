# FollowLoseWieght (PWA)

Application PWA (React + TypeScript + Tailwind) optimisée mobile, déployable sur GitHub Pages.

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
Puis ouvre l'URL indiquée par Vite.

## Build
```bash
npm run build
npm run preview
```

## Déploiement sur GitHub Pages (méthode GitHub Actions — recommandé)
Le workflow est déjà inclus : `.github/workflows/deploy.yml`.

1) Pousse le code sur `main` :
```bash
git add .
git commit -m "Initial PWA"
git push origin main
```
2) Dans GitHub : **Settings → Pages**  
   Source: **GitHub Actions**

Le site sera publié sous : `https://thibisault.github.io/FollowLoseWieght/`

## Déploiement (méthode commande)
Cette méthode publie sur la branche `gh-pages`.

```bash
npm run deploy
```

## Utilisation sur téléphone
- Ouvre le site GitHub Pages sur Chrome / Safari
- Ajoute à l’écran d’accueil (PWA)
- Les données sont stockées localement sur l’appareil
