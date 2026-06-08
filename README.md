# Cheshbon Analyzer

Application web pour expert-comptable en Israël — analyse rapide de fichiers Excel/CSV.

## Fonctionnalités

- **Bilingue** : Hébreu (RTL) + Anglais
- **תלוש שכר (Pay Slip)** : analyse complète — brut, net, impôts, retraite, déductions
- **Architecture extensible** : ajoutez facilement de nouveaux analyseurs (טופס 106, מצב לקוח, etc.)
- **UI moderne** : drag & drop, KPI cards, insights automatiques
- **Déploiement Vercel** : prêt en un clic

## Démarrage local

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Déploiement sur Vercel

**Repo GitHub :** https://github.com/nathmsi/cheshbon-analyzer

**Déploiement en 1 clic :**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnathmsi%2Fcheshbon-analyzer&project-name=cheshbon-analyzer)

Ou manuellement :

1. Aller sur [vercel.com/new](https://vercel.com/new)
2. Importer `nathmsi/cheshbon-analyzer` — Vercel détecte Next.js automatiquement
3. Cliquer Deploy

Ou en CLI (après `npx vercel login`) :

```bash
npx vercel --prod
```

## Fichiers de test

Des fichiers Excel d'exemple sont disponibles sur la page d'accueil ou dans `public/samples/` :

- `sample-pay-slip.xlsx` — תלוש שכר (יוסי כהן)
- `sample-form-106.xlsx` — טופס 106 שנת 2024

Regénérer les samples :

```bash
npm run generate-samples
```

## Ajouter un nouvel analyseur

1. Créer `src/lib/analyzers/mon-analyseur.ts` avec une fonction `analyze(workbook, locale)`
2. L'enregistrer dans `src/lib/analyzers/registry.ts`
3. Ajouter les traductions dans `src/lib/i18n/translations.ts`
4. Mettre `available: true` dans la définition

## Structure

```
docs/                   # Full project documentation (for humans & AI)
src/
  app/                  # Pages Next.js
  components/           # UI components
  lib/
    analyzers/          # Moteur d'analyse (extensible)
    i18n/               # Traductions HE/EN
    utils/              # Helpers
```

📖 **Documentation complète :** voir le dossier [`docs/`](./docs/README.md)

## Tech Stack

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS 4
- xlsx (parsing Excel)
- Lucide Icons
