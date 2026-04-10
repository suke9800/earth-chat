/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string
  readonly VITE_FIREBASE_FUNCTIONS_REGION?: string
  readonly VITE_PLAY_VERIFY_HTTP_URL?: string
  readonly VITE_ANDROID_PACKAGE_NAME?: string
  readonly VITE_SUPERCHAT_TEST_MODE?: string
  readonly VITE_TRANSLATE_MYMEMORY_EMAIL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
