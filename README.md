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

## GitHub Pages Realtime Setup

If GitHub Pages is deployed without Firebase env values, the app falls back to device-local mode and messages do not sync across phone and PC.

To enable realtime sync on the deployed site, add these repository secrets in GitHub:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Optional repository variables:

- `VITE_FIREBASE_FUNCTIONS_REGION`
- `VITE_ANDROID_PACKAGE_NAME`
- `VITE_SUPERCHAT_TEST_MODE`
- `VITE_TRANSLATE_MYMEMORY_EMAIL`

After those values are set and Firebase Auth anonymous sign-in plus Firestore are enabled, pushing to `main` deploys a realtime-enabled Pages build.

## Firebase Notes

- Enable Anonymous sign-in in Firebase Auth.
- Create a Firestore database.
- Messages are stored in `rooms/global/messages`.
