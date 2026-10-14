import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
// CRITICAL: Initialize Firestore with specific database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test Firestore connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or database permissions pending.');
    }
    return false;
  }
}

// Global declaration for window recaptcha verifier
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

/**
 * Completely resets and cleans up any existing RecaptchaVerifier and its DOM element
 */
export function resetRecaptchaVerifier(containerId: string = 'recaptcha-container') {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      // ignore clear error
    }
    window.recaptchaVerifier = undefined;
  }

  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
  }
}

/**
 * Initializes Firebase RecaptchaVerifier safely without duplicate render collisions
 */
export function initRecaptchaVerifier(containerId: string = 'recaptcha-container'): RecaptchaVerifier {
  // 1. If we already have an active verifier, safely reuse it
  if (window.recaptchaVerifier) {
    try {
      return window.recaptchaVerifier;
    } catch (e) {
      resetRecaptchaVerifier(containerId);
    }
  }

  // 2. Ensure DOM container is clean before creating new verifier
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
  }

  try {
    const verifier = new RecaptchaVerifier(auth, container || containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved - will proceed with phone auth
      },
      'expired-callback': () => {
        console.warn('reCAPTCHA expired. User must retry.');
        resetRecaptchaVerifier(containerId);
      },
    });

    window.recaptchaVerifier = verifier;
    return verifier;
  } catch (error: any) {
    console.warn('RecaptchaVerifier initial instantiation caught:', error);

    // If reCAPTCHA was already rendered, replace DOM container with a fresh clean element and retry
    if (container && container.parentNode) {
      const freshContainer = document.createElement('div');
      freshContainer.id = containerId;
      container.parentNode.replaceChild(freshContainer, container);

      const verifier = new RecaptchaVerifier(auth, freshContainer, {
        size: 'invisible',
      });
      window.recaptchaVerifier = verifier;
      return verifier;
    }

    throw error;
  }
}

/**
 * Sends real SMS OTP to phone number using Firebase Phone Authentication
 * @param phoneNumber E.164 formatted number (e.g. +919876543210)
 * @param appVerifier RecaptchaVerifier instance
 */
export async function sendFirebasePhoneOtp(
  phoneNumber: string,
  appVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    window.confirmationResult = confirmationResult;
    return confirmationResult;
  } catch (error: any) {
    // Reset recaptcha if failed so subsequent attempt has a clean container
    resetRecaptchaVerifier();
    throw error;
  }
}

/**
 * Verifies the 6-digit SMS code against the Firebase ConfirmationResult
 */
export async function verifyFirebasePhoneOtp(
  confirmationResult: ConfirmationResult,
  otpCode: string
): Promise<FirebaseUser> {
  const result = await confirmationResult.confirm(otpCode.trim());
  return result.user;
}

export { signOut, onAuthStateChanged };
export type { ConfirmationResult, FirebaseUser };
