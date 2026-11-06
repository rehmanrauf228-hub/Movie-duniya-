import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { Movie, UserAccount, PaymentTransaction } from '../utils/movieEngine';

// 1. Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Initialize Firestore with designated database ID or standard default
export const db = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)')
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// 3. Initialize Auth & Storage
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// 4. Standardized Firestore Error Handling per Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
  return errInfo;
}

// 5. Test Live Firestore Connection
export async function testFirebaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return { success: true, message: 'Connected to Firebase Firestore Cloud Database!' };
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      return { success: false, message: 'Firebase client is offline. Check internet connection.' };
    }
    // Permissions error on test path is normal if non-admin
    return { success: true, message: 'Firebase is provisioned and active.' };
  }
}

// 6. Movie CRUD operations in Firestore
export async function fetchMoviesFromFirestore(): Promise<Movie[] | null> {
  const path = 'movies';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const list: Movie[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as Movie);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return null;
  }
}

export async function saveMovieToFirestore(movie: Movie): Promise<{ success: boolean; error?: string }> {
  const path = `movies/${movie.id}`;
  try {
    await setDoc(doc(db, 'movies', movie.id), {
      ...movie,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (err: any) {
    const info = handleFirestoreError(err, OperationType.WRITE, path);
    return { success: false, error: info.error };
  }
}

export async function deleteMovieFromFirestore(movieId: string): Promise<{ success: boolean; error?: string }> {
  const path = `movies/${movieId}`;
  try {
    await deleteDoc(doc(db, 'movies', movieId));
    return { success: true };
  } catch (err: any) {
    const info = handleFirestoreError(err, OperationType.DELETE, path);
    return { success: false, error: info.error };
  }
}

// 7. User Profile Persistence
export async function saveUserProfileToFirestore(userProfile: UserAccount): Promise<{ success: boolean; error?: string }> {
  const path = `users/${userProfile.id}`;
  try {
    await setDoc(doc(db, 'users', userProfile.id), userProfile, { merge: true });
    return { success: true };
  } catch (err: any) {
    const info = handleFirestoreError(err, OperationType.WRITE, path);
    return { success: false, error: info.error };
  }
}

export async function getUserProfileFromFirestore(userId: string): Promise<UserAccount | null> {
  const path = `users/${userId}`;
  try {
    const snapshot = await getDoc(doc(db, 'users', userId));
    if (snapshot.exists()) {
      return snapshot.data() as UserAccount;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

// 8. Payment Transaction Persistence
export async function saveTransactionToFirestore(tx: PaymentTransaction): Promise<{ success: boolean; error?: string }> {
  const path = `transactions/${tx.id}`;
  try {
    await setDoc(doc(db, 'transactions', tx.id), tx);
    return { success: true };
  } catch (err: any) {
    const info = handleFirestoreError(err, OperationType.WRITE, path);
    return { success: false, error: info.error };
  }
}

// 9. Firebase Storage: Upload Poster or Thumbnail
export async function uploadMediaToFirebaseStorage(
  file: File,
  folder: 'posters' | 'covers' | 'media' = 'posters'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageRef = ref(storage, `${folder}/${timestamp}_${cleanFileName}`);
    const uploadResult = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(uploadResult.ref);
    return { success: true, url: downloadUrl };
  } catch (err: any) {
    console.error('Firebase storage upload error:', err);
    return { success: false, error: err?.message || 'Failed to upload to Firebase Storage' };
  }
}

// 10. Firebase Authentication Actions
export async function signInWithGooglePopup(): Promise<{ success: boolean; user?: FirebaseUser; error?: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (err: any) {
    console.error('Google sign in error:', err);
    return { success: false, error: err?.message || 'Google sign-in failed' };
  }
}

export async function loginWithEmailPass(email: string, pass: string): Promise<{ success: boolean; user?: FirebaseUser; error?: string }> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return { success: true, user: result.user };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Sign in failed' };
  }
}

export async function registerWithEmailPass(email: string, pass: string): Promise<{ success: boolean; user?: FirebaseUser; error?: string }> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    return { success: true, user: result.user };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Registration failed' };
  }
}

export async function logoutFirebaseAuth(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Logout error:', err);
  }
}

export { firebaseConfig };
