import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../config/firebaseconfig';  // Your Firestore configuration
import provider from './provider';

const auth = getAuth();

export const onUserAuthChange = () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in
            const email = user.email as string;
            const name = user.displayName as string;
            const uid = user.uid;
            const walletAddress = await connectWallet();

            if (walletAddress) {
                await createUserDocument(email, name, uid, walletAddress);
            }
        }
    });
};

const connectWallet = async (): Promise<string | null> => {
    if (provider) {
        try {
            const signer = await provider.getSigner();
            return await signer.getAddress();
        } catch (error) {
            console.error('Error connecting to wallet:', error);
            return null;
        }
    } else {
        console.log('No Ethereum provider found');
        return null;
    }
};

const createUserDocument = async (email: string, name: string, uid: string, walletAddress: string) => {
    const userRef = doc(firestore, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
        // Document doesn't exist, create a new one
        await setDoc(userRef, {
            email,
            name,
            walletAddress,
            createdAt: new Date(),
        });
        console.log(`User document created for UID: ${uid}`);
    } else {
        console.log(`User document already exists for UID: ${uid}`);
    }
};
