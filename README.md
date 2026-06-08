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

1. Push le repo sur GitHub
2. Aller sur [vercel.com/new](https://vercel.com/new)
3. Importer le repo — Vercel détecte Next.js automatiquement
4. Deploy

Ou en CLI :

```bash
npx vercel
```

## Ajouter un nouvel analyseur

1. Créer `src/lib/analyzers/mon-analyseur.ts` avec une fonction `analyze(workbook, locale)`
2. L'enregistrer dans `src/lib/analyzers/registry.ts`
3. Ajouter les traductions dans `src/lib/i18n/translations.ts`
4. Mettre `available: true` dans la définition

## Structure

```
src/
  app/                    # Pages Next.js
  components/             # UI components
  lib/
    analyzers/            # Moteur d'analyse (extensible)
    i18n/                 # Traductions HE/EN
    utils/                # Helpers
```

## Tech Stack

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS 4
- xlsx (parsing Excel)
- Lucide Icons
