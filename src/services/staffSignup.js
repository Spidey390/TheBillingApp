import { deleteApp, initializeApp } from 'firebase/app';
import {
  connectAuthEmulator, createUserWithEmailAndPassword, initializeAuth,
  inMemoryPersistence, signInWithEmailAndPassword
} from 'firebase/auth';
import { app, useEmulators } from './firebaseApp';
import { newId } from '../domain/ids';

export async function getStaffAccountUid(email, password) {
  // Firebase signs in the account it just created. Keep that session separate
  // so the owner remains signed in while adding the staff profile.
  const secondary = initializeApp(app.options, `staff-signup-${newId()}`);
  try {
    const signup = initializeAuth(secondary, { persistence: inMemoryPersistence });
    if (useEmulators) connectAuthEmulator(signup, 'http://127.0.0.1:9099', { disableWarnings: true });

    try {
      return (await createUserWithEmailAndPassword(signup, email, password)).user.uid;
    } catch (error) {
      if (error.code !== 'auth/email-already-in-use') throw error;

      // Recover a retry after Auth succeeded but the profile write failed.
      try {
        return (await signInWithEmailAndPassword(signup, email, password)).user.uid;
      } catch (retryError) {
        if (retryError.code === 'auth/network-request-failed') throw retryError;
        throw new Error('This email already has an account. Check the password or use another email.');
      }
    }
  } finally {
    await deleteApp(secondary);
  }
}
