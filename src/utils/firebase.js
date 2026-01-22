// Firebase configuration for Kanaku
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDTyD59evK11cox0GUBP9WK09xNtTjNnqs",
    authDomain: "kanaku-2a555.firebaseapp.com",
    projectId: "kanaku-2a555",
    storageBucket: "kanaku-2a555.firebasestorage.app",
    messagingSenderId: "839616414910",
    appId: "1:839616414910:web:31e47d42af7f33b54b0aef",
    measurementId: "G-M58YB5TBKF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Enable offline persistence
try {
    enableMultiTabIndexedDbPersistence(db).catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn('Firestore persistence failed-precondition: Multiple tabs open?');
        } else if (err.code == 'unimplemented') {
            console.warn('Firestore persistence unimplemented: Browser not supported');
        }
    });
} catch (e) {
    console.warn('Firestore persistence init error:', e);
}

// Document reference for storing all app data
const DATA_DOC = 'kanaku-data';
const DATA_COLLECTION = 'app-data';

/**
 * Save all data to Firestore
 * @param {Object} data - { items, orders, users }
 */
export const saveToFirestore = async (data) => {
    try {
        const docRef = doc(db, DATA_COLLECTION, DATA_DOC);
        await setDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Firestore save error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Load all data from Firestore
 * @returns {Promise<Object|null>}
 */
export const loadFromFirestore = async () => {
    try {
        const docRef = doc(db, DATA_COLLECTION, DATA_DOC);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        console.error('Firestore load error:', error);
        return null;
    }
};

/**
 * Subscribe to real-time updates from Firestore
 * @param {Function} callback - Called when data changes
 * @returns {Function} Unsubscribe function
 */
export const subscribeToFirestore = (callback) => {
    const docRef = doc(db, DATA_COLLECTION, DATA_DOC);

    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data());
        }
    }, (error) => {
        console.error('Firestore subscription error:', error);
    });
};

export { db };
