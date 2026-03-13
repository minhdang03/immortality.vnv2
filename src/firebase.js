import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// ⚠️ Thay thế config bên dưới bằng config từ Firebase Console
// 1. Vào https://console.firebase.google.com
// 2. Tạo project mới hoặc chọn project có sẵn
// 3. Thêm Web App → copy firebaseConfig
// 4. Bật Firestore Database (mode: test)
// 5. Bật Authentication → Email/Password
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
