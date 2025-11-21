// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

// add your credential here
const firebaseConfig = {
  apiKey: 'AIzaSyAM6ioYKby_qMJ5D53QJVPFD2ofkv3c9cI',
  authDomain: 'zens-caven.firebaseapp.com',
  projectId: 'zens-caven',
  storageBucket: 'zens-caven.firebasestorage.app',
  messagingSenderId: '448067558310',
  appId: '1:448067558310:web:e6eb8d825edc62df164d67',
  measurementId: 'G-C2V8HTFNZG',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
getAnalytics(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
