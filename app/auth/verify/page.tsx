"use client"
import { useState, useRef, useEffect } from 'react';
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

// Define interfaces for better type safety
interface PopupState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

export default function VerificationPage() {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [popup, setPopup] = useState<PopupState>({ show: false, message: '', type: 'info' });
  const [errorState, setErrorState] = useState<boolean>(false);
  const [email, setEmail] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  // Get email from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem("email");
      setEmail(storedEmail);

      if (!storedEmail) {
        showPopup('No email found. Please try signing up again.', 'error');
        setTimeout(() => {
          router.push('/auth');
        }, 2000);
      }
    }
  }, [router]);

  // Timer effect for resend button
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  // Auto-hide popup effect
  useEffect(() => {
    if (popup.show) {
      const timer = setTimeout(() => {
        setPopup(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [popup.show]);

  const handleInput = (value: string, index: number): void => {
    const numericValue = value.replace(/[^0-9]/g, '');

    if (numericValue.length <= 1) {
      const newCode = [...code];
      newCode[index] = numericValue;
      setCode(newCode);
      setErrorState(false);

      // Move to next input
      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-verify when all fields are filled
      if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
        setTimeout(() => verifyCode(newCode.join('')), 100);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number): void => {
    if (event.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>): void => {
    event.preventDefault();

    const pastedData = event.clipboardData.getData('text');
    const digits = pastedData.replace(/[^0-9]/g, '').slice(0, 6);

    if (digits.length > 0) {
      const newCode: string[] = ['', '', '', '', '', ''];

      for (let i = 0; i < digits.length && i < 6; i++) {
        newCode[i] = digits[i];
      }

      setCode(newCode);
      setErrorState(false);

      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();

      if (digits.length === 6) {
        setTimeout(() => verifyCode(digits), 100);
      }

      showPopup(`${digits.length} digit${digits.length > 1 ? 's' : ''} pasted successfully!`, 'info');
    }
  };

  const verifyCode = async (codeToVerify: string = code.join('')): Promise<void> => {
    if (!email) {
      showPopup('Email not found. Please try signing up again.', 'error');
      return;
    }

    if (codeToVerify.length !== 6) {
      showPopup('Please enter all 6 digits', 'error');
      return;
    }

    setIsVerifying(true);

    try {
      await axios.post("/api/auth/signup/verify", {
        email,
        code: codeToVerify
      });

      showPopup('Account created successfully! Redirecting...', 'success');

      // Clear email from localStorage after successful verification
      if (typeof window !== 'undefined') {
        localStorage.removeItem("email");
      }

      setTimeout(() => {
        router.push('/auth');
      }, 1500);

    } catch (error) {
      console.error('Verification error:', error);

      let errorMessage = 'Invalid verification code. Please try again.';

      if (error instanceof AxiosError) {
        const errorData = error.response?.data as ApiErrorResponse;
        errorMessage = errorData?.error || errorData?.message || errorMessage;

        // Handle specific error cases
        if (error.response?.status === 400) {
          errorMessage = 'Invalid verification code. Please check and try again.';
        } else if (error.response?.status === 404) {
          errorMessage = 'User not found. Please try signing up again.';
        } else if (error.response?.status === 410) {
          errorMessage = 'Verification code has expired. Please request a new one.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }

      showPopup(errorMessage, 'error');
      setErrorState(true);
      clearInputs();
    } finally {
      setIsVerifying(false);
    }
  };

  const resendCode = async (): Promise<void> => {
    if (resendTimer > 0 || !email) return;

    try {
      await axios.post("/api/auth/resendcode", { email });
      showPopup('Verification code sent successfully!', 'info');
      clearInputs();
      setResendTimer(60);
    } catch (error) {
      console.error('Resend code error:', error);

      let errorMessage = 'Failed to resend code. Please try again.';

      if (error instanceof AxiosError) {
        const errorData = error.response?.data as ApiErrorResponse;
        errorMessage = errorData?.error || errorData?.message || errorMessage;

        // Handle specific error cases
        if (error.response?.status === 404) {
          errorMessage = 'User not found. Please try signing up again.';
        } else if (error.response?.status === 429) {
          errorMessage = 'Too many requests. Please wait before requesting another code.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }

      showPopup(errorMessage, 'error');
    }
  };

  const clearInputs = (): void => {
    setCode(['', '', '', '', '', '']);
    setErrorState(false);
    inputRefs.current[0]?.focus();
  };

  const showPopup = (message: string, type: 'success' | 'error' | 'info'): void => {
    setPopup({ show: true, message, type });
  };

  const goBack = (): void => {
    if (confirm('Are you sure you want to go back? You will need to restart the verification process.')) {
      // Clear email from localStorage when going back
      if (typeof window !== 'undefined') {
        localStorage.removeItem("email");
      }
      router.back();
    }
  };

  // Show loading state while checking for email
  if (typeof window !== 'undefined' && email === null) {
    return (
        <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-5" style={{ backgroundImage: "url('/welcome/bg welcome app.png')"}}>
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl w-full max-w-md">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-4xl text-white mx-auto mb-8">
                🔐
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading...</h1>
              <p className="text-gray-600">Please wait while we verify your session.</p>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-5" style={{ backgroundImage: "url('/welcome/bg welcome app.png')"}}>
        {/* Popup */}
        <div className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-xl text-white font-semibold shadow-lg transform transition-transform duration-300 ${
            popup.show ? 'translate-x-0' : 'translate-x-96'
        } ${
            popup.type === 'success' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                popup.type === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                    'bg-gradient-to-r from-blue-500 to-blue-600'
        } md:max-w-sm max-w-xs`}>
          {popup.message}
        </div>

        {/* Main Container */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl w-full max-w-md relative">
          {/* Back Button */}
          <button
              type="button"
              onClick={goBack}
              className="absolute top-5 left-5 text-2xl text-gray-600 hover:text-gray-800 transition-colors duration-300"
              title="Go back"
          >
            ←
          </button>

          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-4xl text-white mx-auto mb-8">
            🔐
          </div>

          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-3">
            Verify Your Code
          </h1>
          <p className="text-gray-600 text-center mb-10 leading-relaxed">
            We&apos;ve sent a 6-digit verification code to{' '}
            <span className="font-semibold text-gray-800">
              {email ? email.replace(/(.{2}).*(@.*)/, '$1***$2') : 'your email'}
            </span>
            . Please enter it below.
          </p>

          {/* Code Input */}
          <div className="flex gap-3 justify-center mb-8">
            {code.map((digit, index) => (
                <input
                    key={index}
                    ref={el => {
                      if (inputRefs.current) {
                        inputRefs.current[index] = el;
                      }
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInput(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    disabled={isVerifying}
                    className={`w-12 h-14 text-center text-gray-800 text-2xl font-semibold border-2 rounded-xl outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                        errorState
                            ? 'border-red-500 animate-pulse'
                            : 'border-gray-300 focus:border-indigo-500 focus:scale-105 focus:shadow-md'
                    }`}
                    autoFocus={index === 0}
                    aria-label={`Digit ${index + 1} of verification code`}
                />
            ))}
          </div>

          {/* Verify Button */}
          <button
              type="button"
              onClick={() => verifyCode()}
              disabled={isVerifying || code.some(digit => digit === '')}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mb-6"
          >
            {isVerifying ? (
                <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Verifying...
              </span>
            ) : 'Verify Code'}
          </button>

          {/* Resend Section */}
          <div className="text-center text-gray-600 text-sm">
            {resendTimer > 0 ? (
                <span>
              Code sent! Resend in <span className="text-indigo-600 font-semibold">{resendTimer}s</span>
            </span>
            ) : (
                <span>
            Didn&apos;t receive the code?{' '}

                  <button
                      type="button"
                      onClick={resendCode}
                      disabled={!email}
                      className="text-indigo-600 font-semibold underline hover:text-indigo-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                Resend Code
              </button>
            </span>
            )}
          </div>
        </div>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .animate-pulse {
            animation: pulse 0.5s ease-in-out;
          }
        `}</style>
      </div>
  );
}