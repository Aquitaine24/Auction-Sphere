import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';



const firebaseConfig = {
        apiKey: "AIzaSyAxZ_B5yefP-fBE-8aRm9DhoJWfrWXRXlE",
        authDomain: "auction-sphere-9f5ff.firebaseapp.com",
        projectId: "auction-sphere-9f5ff",
        storageBucket: "auction-sphere-9f5ff.appspot.com",
        messagingSenderId: "12044454788",
        appId: "1:12044454788:web:ae4ee0dcc5c0223dc8ebd1",
        measurementId: "G-LV3DL3Z6FP"
      };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const firestore = getFirestore(app);