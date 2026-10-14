import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../translations';
import { resetRecaptchaVerifier } from '../firebase';
import { Phone, ShieldCheck, RefreshCw, X, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const {
    language,
    phoneAuthStep,
    phoneAuthError,
    resendCountdown,
    sendPhoneOtp,
    verifyOtpCode,
    resendPhoneOtp,
    resetPhoneAuth,
    devLoginCustomer,
  } = useAuth();

  const [rawPhone, setRawPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Clean reCAPTCHA widget safely whenever modal opens, closes, or unmounts
  useEffect(() => {
    if (isOpen) {
      resetRecaptchaVerifier('recaptcha-container');
    }
    return () => {
      resetRecaptchaVerifier('recaptcha-container');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const t = translations[language];

  // Validate Indian 10-digit mobile number
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const cleanNumber = rawPhone.replace(/\D/g, '');
    if (cleanNumber.length !== 10) {
      setLocalError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    const fullPhoneNumber = `+91${cleanNumber}`;
    const sent = await sendPhoneOtp(fullPhoneNumber);
    if (!sent) {
      // Error handled by AuthContext
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (otpCode.trim().length < 6) {
      setLocalError('Please enter the full 6-digit OTP received via SMS.');
      return;
    }

    const verified = await verifyOtpCode(otpCode, customerName.trim() || 'Food Lover');
    if (verified) {
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-red-600 to-amber-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {language === 'hi' ? 'फोन नंबर से लॉगिन करें' : 'Sign in with Phone'}
              </h3>
              <p className="text-xs text-white/80">
                {language === 'hi' ? 'सुरक्षित एसएमएस ओटीपी प्रमाणीकरण' : 'Real Firebase SMS OTP Verification'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Invisible reCAPTCHA container required by Firebase */}
          <div id="recaptcha-container" className="my-1"></div>

          {/* Error Banner with Firebase Activation Guide & Preview Fallback */}
          {(localError || phoneAuthError) && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-2.5 text-xs text-red-700">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div className="flex-1 font-semibold leading-relaxed">
                  {localError || phoneAuthError}
                </div>
              </div>

              {(phoneAuthError?.includes('reCAPTCHA') || phoneAuthError?.includes('already been rendered')) && (
                <div className="pt-2 border-t border-red-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      resetPhoneAuth();
                      setLocalError(null);
                    }}
                    className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>🔄 reCAPTCHA रीसेट करें (Reset & Try Again)</span>
                  </button>
                </div>
              )}

              {(phoneAuthError?.includes('Firebase Console') || phoneAuthError?.includes('operation-not-allowed') || phoneAuthError?.includes('Phone Authentication')) && (
                <div className="pt-2 border-t border-red-200/80 space-y-2">
                  <div className="bg-white p-3 rounded-xl border border-red-200 text-[11px] text-gray-800 space-y-1.5 shadow-xs">
                    <p className="font-extrabold text-red-700 flex items-center space-x-1">
                      <span>🔥 Firebase में Phone Auth कैसे चालू (स्वीकार) करें:</span>
                    </p>
                    <p>1. नीचे दिए गए लिंक पर क्लिक करके Firebase Console खोलें:</p>
                    <a
                      href="https://console.firebase.google.com/project/encoded-xenops-05p7n/authentication/providers"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block py-1 px-2.5 bg-blue-50 text-blue-700 font-bold border border-blue-200 rounded-lg underline hover:bg-blue-100"
                    >
                      🔗 यहाँ क्लिक करके Firebase Console खोलें ↗
                    </a>
                    <p>2. <strong>Sign-in method</strong> में <strong>Phone (फ़ोन)</strong> पर क्लिक करें और <strong>Enable</strong> चालू करें।</p>
                    <p>3. <strong>Phone numbers for testing</strong> में नंबर जैसे <code>+91 9999999999</code> और ओटीपी <code>123456</code> जोड़कर <strong>Save</strong> कर दें।</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      devLoginCustomer(rawPhone || '9876543210', customerName || 'Nadeem Mohd');
                      if (onSuccess) onSuccess();
                      onClose();
                    }}
                    className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>अभी टेस्ट मोड में सीधे लॉगिन करें (+91 {rawPhone || '98765 43210'})</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 1: Phone Input */}
          {(phoneAuthStep === 'idle' || phoneAuthStep === 'sending' || (phoneAuthStep === 'error' && !otpCode)) && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  {language === 'hi' ? 'आपका नाम' : 'Your Full Name'} (Optional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Nadeem Khan"
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  {language === 'hi' ? 'मोबाइल नंबर' : 'Indian Mobile Number'}
                </label>
                <div className="flex rounded-xl border border-gray-200 bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-red-500 focus-within:bg-white transition-all">
                  <div className="px-3.5 py-2.5 bg-gray-100/80 border-r border-gray-200 text-sm font-semibold text-gray-700 flex items-center space-x-1.5 select-none">
                    <span className="text-base">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={rawPhone}
                    onChange={(e) => setRawPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    autoFocus
                    required
                    className="flex-1 px-4 py-2.5 text-sm bg-transparent focus:outline-none font-medium tracking-wide"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5 flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>An actual 6-digit SMS verification code will be sent to your phone.</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={phoneAuthStep === 'sending' || rawPhone.length < 10}
                className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {phoneAuthStep === 'sending' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending SMS Code...</span>
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4" />
                    <span>{language === 'hi' ? 'ओटीपी प्राप्त करें' : 'Get SMS Verification Code'}</span>
                  </>
                )}
              </button>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    devLoginCustomer(rawPhone || '9876543210', customerName || 'Nadeem Mohd');
                    if (onSuccess) onSuccess();
                    onClose();
                  }}
                  className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors border border-gray-200 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>⚡ बिना SMS के तुरंत टेस्ट लॉगिन करें (+91 {rawPhone || '98765 43210'})</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {(phoneAuthStep === 'otp_sent' || phoneAuthStep === 'verifying' || (phoneAuthStep === 'error' && otpCode)) && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center pb-2">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-full mb-2">
                  <Phone className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-gray-900 text-base">Enter 6-Digit SMS Code</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Sent to <span className="font-semibold text-gray-800">+91 {rawPhone}</span>
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  autoFocus
                  required
                  className="w-full text-center tracking-[0.5em] text-2xl font-bold py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 transition-all font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={phoneAuthStep === 'verifying' || otpCode.length < 6}
                className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {phoneAuthStep === 'verifying' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'hi' ? 'सत्यापित करें एवं आगे बढ़ें' : 'Verify & Continue'}</span>
                  </>
                )}
              </button>

              {/* Resend Section */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setOtpCode('');
                    handleSendOtp({ preventDefault: () => {} } as any);
                  }}
                  disabled={resendCountdown > 0}
                  className="text-red-600 hover:text-red-700 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {resendCountdown > 0 ? `Resend Code in ${resendCountdown}s` : 'Resend SMS Code'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpCode('');
                    // reset to step 1
                    handleSendOtp({ preventDefault: () => {} } as any);
                  }}
                  className="text-gray-500 hover:text-gray-800 transition-colors font-medium"
                >
                  Change Number
                </button>
              </div>
            </form>
          )}

          {/* Development & Firebase Setup Tip */}
          <div className="mt-5 pt-4 border-t border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50 p-3.5 rounded-xl border border-amber-200/90 space-y-2">
            <p className="text-xs font-bold text-amber-950 flex items-center space-x-1.5">
              <span>🔥</span>
              <span>{language === 'hi' ? 'Firebase फ़ोन OTP स्वीकार (Enable) कैसे करें:' : 'How to Enable Firebase Phone SMS Auth:'}</span>
            </p>
            <div className="text-[11px] text-amber-900 leading-relaxed space-y-1">
              <p>
                1. Firebase Console में <strong>Authentication &rarr; Sign-in method</strong> में जाएँ:
              </p>
              <a
                href="https://console.firebase.google.com/project/encoded-xenops-05p7n/authentication/providers"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-xs font-bold text-blue-700 underline bg-white/80 px-2 py-1 rounded-md border border-amber-200 hover:bg-white"
              >
                <span>🌐 Firebase Console खोलें (encoded-xenops-05p7n) ↗</span>
              </a>
              <p>
                2. <strong>Phone</strong> पर क्लिक करके <strong>Enable</strong> टॉगल ऑन करें।
              </p>
              <p>
                3. टेस्ट करने के लिए <strong>Phone numbers for testing</strong> में <code className="bg-white/80 px-1 rounded font-bold">+91 9999999999</code> और OTP <code className="bg-white/80 px-1 rounded font-bold">123456</code> डाल कर <strong>Save</strong> करें।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
