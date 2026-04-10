# Earth Chat (MVP)

Anonymous global chat room with a single shared space.

## Stack

- React + Vite + PWA
- Firebase Auth (anonymous)
- Firestore (realtime messages)

## Setup

1. Copy `.env.example` to `.env` and fill in your Firebase config.
2. Install dependencies:
   - `bun install`
3. Run the dev server:
   - `bun dev`

## Release-Ready Workflow

1. Complete UI/system work in local mode first.
2. Fill real Firebase + Android env values in `.env`.
3. Run release preflight:
   - `bun run preflight:release`
4. Build web bundle:
   - `bun run build`
5. Package Android app shell and connect Play Billing bridge.
6. Finish Google Play Console account/policy steps and submit.

Notes:
- This app can run in local fallback mode while Firebase is not configured.
- Play Console account approval is external and not automated by this repo.

## Firebase Notes

- Enable Anonymous sign-in in Firebase Auth.
- Create a Firestore database.
- Messages are stored in `rooms/global/messages`.
