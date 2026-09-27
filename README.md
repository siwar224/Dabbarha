# Dabbirha — دبّرها

Offline-first personal finance mobile app built with React Native, Expo, TypeScript, Expo Router, and SQLite.

## Current Status

The project foundation is prepared only. Screens will be implemented one by one from the Figma prototype.

## Tech Stack

- React Native
- Expo
- TypeScript
- Expo Router
- expo-sqlite for local structured data
- AsyncStorage only for lightweight preferences
- No backend, no auth, no cloud sync for V1

## Folder Structure

```text
app/
  _layout.tsx
  (tabs)/
    _layout.tsx
    index.tsx
    expense.tsx
    plan.tsx
    goals.tsx
    accounts.tsx
  goal/
    add.tsx
    [id].tsx

src/
  components/
  constants/
  db/
  hooks/
  repositories/
  services/
  theme/
  types/
  utils/

assets/
  images/
  icons/
```

## SQLite Schema Plan

Core tables planned for V1:

- `monthly_plans`
- `transactions`
- `goals`
- `goal_contributions`
- optional `categories`

The first schema draft is in `src/db/schema.ts`.

## Install

```bash
npm install
```

## Run

```bash
npm run start
```

Then open the app with Expo Go or an Android/iOS simulator.

## Useful Commands

```bash
npm run typecheck
npm run lint
```

## Assets To Replace Later

- `assets/images/logo.png` — final official logo
- app icon and splash assets when branding is finalized

