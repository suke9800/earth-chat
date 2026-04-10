import { initializeApp } from 'firebase/app'
import {
  GoogleAuthProvider,
  getAuth,
  linkWithPopup,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  type User,
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

const readEnv = (value?: string): string => (value ?? '').trim()

const firebaseConfig = {
  apiKey: readEnv(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: readEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: readEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: readEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: readEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: readEnv(import.meta.env.VITE_FIREBASE_APP_ID),
}

export const firebaseReady = Object.values(firebaseConfig).every(
  (value) => value.length > 0
)

let firebaseApp: ReturnType<typeof initializeApp> | null = null
let authPromise: Promise<string> | null = null

export type AuthMode = 'none' | 'anonymous' | 'google.com' | 'other'

function getFirebaseApp() {
  if (!firebaseReady) {
    throw new Error('Firebase config missing')
  }
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig)
  }
  return firebaseApp
}

export function getFirebaseDb() {
  return getFirestore(getFirebaseApp())
}

export function getFirebaseFunctions() {
  const region = readEnv(import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION)
  return region.length > 0
    ? getFunctions(getFirebaseApp(), region)
    : getFunctions(getFirebaseApp())
}

function resolveAuthMode(user: User | null): AuthMode {
  if (!user) {
    return 'none'
  }
  if (user.providerData.some((entry) => entry.providerId === 'google.com')) {
    return 'google.com'
  }
  if (user.isAnonymous) {
    return 'anonymous'
  }
  return 'other'
}

export function getCurrentAuthMode(): AuthMode {
  if (!firebaseReady) {
    return 'none'
  }
  return resolveAuthMode(getAuth(getFirebaseApp()).currentUser)
}

export function subscribeAuthMode(
  callback: (mode: AuthMode, uid: string | null) => void
): () => void {
  if (!firebaseReady) {
    callback('none', null)
    return () => {}
  }

  return onAuthStateChanged(getAuth(getFirebaseApp()), (user) => {
    callback(resolveAuthMode(user), user?.uid ?? null)
  })
}

export async function ensureAnonymousAuth(): Promise<string> {
  if (!firebaseReady) {
    throw new Error('Firebase config missing')
  }

  const auth = getAuth(getFirebaseApp())
  if (auth.currentUser) {
    return auth.currentUser.uid
  }

  if (!authPromise) {
    authPromise = signInAnonymously(auth)
      .then((result) => result.user.uid)
      .catch((error) => {
        authPromise = null
        throw error
      })
  }

  return authPromise
}

export async function ensureGooglePaymentAuth(): Promise<string> {
  if (!firebaseReady) {
    throw new Error('Firebase config missing')
  }

  const auth = getAuth(getFirebaseApp())
  if (!auth.currentUser) {
    await ensureAnonymousAuth()
  }

  const currentUser = auth.currentUser
  if (!currentUser) {
    throw new Error('Auth user missing')
  }

  if (resolveAuthMode(currentUser) === 'google.com') {
    return currentUser.uid
  }

  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  if (currentUser.isAnonymous) {
    const linked = await linkWithPopup(currentUser, provider)
    return linked.user.uid
  }

  const signed = await signInWithPopup(auth, provider)
  return signed.user.uid
}
