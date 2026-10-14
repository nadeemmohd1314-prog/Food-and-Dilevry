import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, Language, UPCity, UserRole } from '../types';
import { api, tokenStorage } from '../services/api';
import {
  auth,
  initRecaptchaVerifier,
  resetRecaptchaVerifier,
  sendFirebasePhoneOtp,
  verifyFirebasePhoneOtp,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  ConfirmationResult,
  FirebaseUser,
} from '../firebase';

export interface CustomerUser {
  uid: string;
  phoneNumber: string;
  name: string;
  city: UPCity;
  deliveryAddress: string;
  addressType: 'Home' | 'Work' | 'Other';
}

interface AuthContextType {
  // Navigation & Role Mode
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  selectedCity: UPCity;
  setSelectedCity: (city: UPCity) => void;

  // Admin Auth State
  adminUser: AdminUser | null;
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, pass: string) => Promise<void>;
  adminLogout: () => Promise<void>;

  // Customer Firebase Phone Auth State
  customerUser: CustomerUser | null;
  isCustomerAuthenticated: boolean;
  phoneAuthStep: 'idle' | 'sending' | 'otp_sent' | 'verifying' | 'success' | 'error';
  phoneAuthError: string | null;
  resendCountdown: number;
  sendPhoneOtp: (phoneNumberWithCode: string) => Promise<boolean>;
  verifyOtpCode: (otpCode: string, name?: string, address?: string) => Promise<boolean>;
  resendPhoneOtp: () => Promise<boolean>;
  resetPhoneAuth: () => void;
  devLoginCustomer: (phone: string, name?: string, address?: string) => void;
  customerSignOut: () => Promise<void>;
  updateCustomerProfile: (data: Partial<CustomerUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CUSTOMER_PROFILE_KEY = 'food_dilvry_customer_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<UserRole>('customer');
  const [language, setLanguage] = useState<Language>('en');
  const [selectedCity, setSelectedCity] = useState<UPCity>('Lucknow');

  // Admin auth state
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => tokenStorage.getStoredUser());
  const isAdminAuthenticated = Boolean(adminUser && tokenStorage.get());

  // Customer Firebase Phone auth state
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(() => {
    const saved = localStorage.getItem(CUSTOMER_PROFILE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [phoneAuthStep, setPhoneAuthStep] = useState<'idle' | 'sending' | 'otp_sent' | 'verifying' | 'success' | 'error'>('idle');
  const [phoneAuthError, setPhoneAuthError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const [lastPhoneNumber, setLastPhoneNumber] = useState<string>('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Sync Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && firebaseUser.phoneNumber) {
        setCustomerUser((prev) => {
          const updated: CustomerUser = {
            uid: firebaseUser.uid,
            phoneNumber: firebaseUser.phoneNumber || '',
            name: prev?.name || 'Customer',
            city: prev?.city || selectedCity,
            deliveryAddress: prev?.deliveryAddress || '',
            addressType: prev?.addressType || 'Home',
          };
          localStorage.setItem(CUSTOMER_PROFILE_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    });
    return () => unsubscribe();
  }, [selectedCity]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: any;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Check admin session on mount
  useEffect(() => {
    if (tokenStorage.get()) {
      api.auth.me()
        .then((res) => {
          if (res.user) {
            setAdminUser(res.user);
            tokenStorage.setStoredUser(res.user);
          } else {
            setAdminUser(null);
            tokenStorage.remove();
          }
        })
        .catch(() => {
          // keep stored user if offline
        });
    }
  }, []);

  // Admin login
  const adminLogin = async (email: string, pass: string) => {
    const res = await api.auth.login(email, pass);
    setAdminUser(res.user);
  };

  // Admin logout
  const adminLogout = async () => {
    await api.auth.logout();
    setAdminUser(null);
  };

  // Customer Firebase Phone Sign-in: Send SMS OTP
  const sendPhoneOtp = async (phoneNumberWithCode: string): Promise<boolean> => {
    setPhoneAuthError(null);
    setPhoneAuthStep('sending');
    setLastPhoneNumber(phoneNumberWithCode);

    try {
      // 1. Initialize reCAPTCHA verifier
      const appVerifier = initRecaptchaVerifier('recaptcha-container');

      // 2. Call Firebase Phone Auth SDK
      const confirmation = await sendFirebasePhoneOtp(phoneNumberWithCode, appVerifier);
      setConfirmationResult(confirmation);

      // 3. Update state
      setPhoneAuthStep('otp_sent');
      setResendCountdown(60); // 60s cooldown for SMS rate limits
      return true;
    } catch (err: any) {
      console.error('Firebase Phone Auth Error:', err);
      let userFriendlyMsg = 'Failed to send verification SMS. Please check mobile number.';

      if (err.code === 'auth/invalid-phone-number') {
        userFriendlyMsg = 'Invalid phone number format. Please enter a valid 10-digit Indian mobile number.';
      } else if (err.code === 'auth/too-many-requests') {
        userFriendlyMsg = 'Too many SMS requests sent from this device. Please wait a few minutes before retrying.';
      } else if (err.code === 'auth/quota-exceeded') {
        userFriendlyMsg = 'Firebase SMS quota exceeded. For testing, add test phone numbers in Firebase Console.';
      } else if (err.code === 'auth/operation-not-allowed') {
        userFriendlyMsg = 'Phone Authentication is not enabled in Firebase Console yet. To enable real SMS: Go to Firebase Console > Authentication > Sign-in method > Enable "Phone". For now, you can use Preview Test Login below.';
      } else if (err.code === 'auth/captcha-check-failed') {
        userFriendlyMsg = 'reCAPTCHA verification failed. Please try again.';
      } else if (err.code === 'auth/network-request-failed') {
        userFriendlyMsg = 'Network error. Please check your internet connection.';
      } else if (err.message && (err.message.includes('already been rendered') || err.message.includes('reCAPTCHA'))) {
        userFriendlyMsg = 'reCAPTCHA सत्यापन रीसेट हो गया है। कृपया दोबारा "ओटीपी प्राप्त करें" दबाएँ या नीचे सीधे टेस्ट लॉगिन चुनें।';
        resetRecaptchaVerifier('recaptcha-container');
      } else if (err.message) {
        userFriendlyMsg = err.message;
      }

      setPhoneAuthError(userFriendlyMsg);
      setPhoneAuthStep('error');
      return false;
    }
  };

  // Reset phone authentication flow and reCAPTCHA state
  const resetPhoneAuth = () => {
    resetRecaptchaVerifier('recaptcha-container');
    setPhoneAuthError(null);
    setPhoneAuthStep('idle');
  };

  // Preview / Development customer login when Firebase console provider is pending
  const devLoginCustomer = (phone: string, name?: string, address?: string) => {
    const profile: CustomerUser = {
      uid: `dev_${Date.now()}`,
      phoneNumber: phone.startsWith('+91') ? phone : `+91 ${phone}`,
      name: name || 'Nadeem Mohd',
      city: selectedCity,
      deliveryAddress: address || `Flat 402, Signature Residency, ${selectedCity}, Uttar Pradesh`,
      addressType: 'Home',
    };
    setCustomerUser(profile);
    localStorage.setItem(CUSTOMER_PROFILE_KEY, JSON.stringify(profile));
    setPhoneAuthStep('success');
    setPhoneAuthError(null);
  };

  // Customer Firebase Phone Sign-in: Verify OTP Code
  const verifyOtpCode = async (otpCode: string, name?: string, address?: string): Promise<boolean> => {
    if (!confirmationResult) {
      setPhoneAuthError('No active verification session found. Please request a new OTP.');
      setPhoneAuthStep('error');
      return false;
    }

    setPhoneAuthError(null);
    setPhoneAuthStep('verifying');

    try {
      // Confirm using official Firebase SDK
      const user = await verifyFirebasePhoneOtp(confirmationResult, otpCode);

      const profile: CustomerUser = {
        uid: user.uid,
        phoneNumber: user.phoneNumber || lastPhoneNumber,
        name: name || customerUser?.name || 'Customer',
        city: selectedCity,
        deliveryAddress: address || customerUser?.deliveryAddress || '',
        addressType: 'Home',
      };

      setCustomerUser(profile);
      localStorage.setItem(CUSTOMER_PROFILE_KEY, JSON.stringify(profile));
      setPhoneAuthStep('success');
      return true;
    } catch (err: any) {
      console.error('OTP Verification Error:', err);
      let userFriendlyMsg = 'Failed to verify OTP code.';

      if (err.code === 'auth/invalid-verification-code') {
        userFriendlyMsg = 'Incorrect 6-digit OTP code entered. Please re-check the SMS on your phone.';
      } else if (err.code === 'auth/code-expired') {
        userFriendlyMsg = 'This verification code has expired. Please tap "Resend Code".';
      } else if (err.message) {
        userFriendlyMsg = err.message;
      }

      setPhoneAuthError(userFriendlyMsg);
      setPhoneAuthStep('error');
      return false;
    }
  };

  // Resend OTP
  const resendPhoneOtp = async (): Promise<boolean> => {
    if (resendCountdown > 0 || !lastPhoneNumber) {
      return false;
    }
    return sendPhoneOtp(lastPhoneNumber);
  };

  // Customer Sign Out
  const customerSignOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      // ignore
    }
    setCustomerUser(null);
    localStorage.removeItem(CUSTOMER_PROFILE_KEY);
    setPhoneAuthStep('idle');
    setPhoneAuthError(null);
  };

  const updateCustomerProfile = (data: Partial<CustomerUser>) => {
    setCustomerUser((prev) => {
      const updated = prev ? { ...prev, ...data } : ({ ...data } as CustomerUser);
      localStorage.setItem(CUSTOMER_PROFILE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        activeRole,
        setActiveRole,
        language,
        setLanguage,
        selectedCity,
        setSelectedCity,
        adminUser,
        isAdminAuthenticated,
        adminLogin,
        adminLogout,
        customerUser,
        isCustomerAuthenticated: Boolean(customerUser),
        phoneAuthStep,
        phoneAuthError,
        resendCountdown,
        sendPhoneOtp,
        verifyOtpCode,
        resendPhoneOtp,
        resetPhoneAuth,
        devLoginCustomer,
        customerSignOut,
        updateCustomerProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
