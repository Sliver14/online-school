"use client"
import { useState, useRef, useEffect } from 'react';
import axios from "axios";
import {useRouter} from "next/navigation";

export default function VerificationPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });
  const [errorState, setErrorState] = useState(false);
  const email = localStorage.getItem("email");
  const inputRefs = useRef([]);
  const router = useRouter();


  // Timer effect for resend button
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
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

  const handleInput = (value, index) => {
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

  const handleKeyDown = (event, index) => {
    if (event.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const pastedData = (event.clipboardData || window.clipboardData).getData('text');
    const digits = pastedData.replace(/[^0-9]/g, '').slice(0, 6);

    if (digits.length > 0) {
      const newCode = ['', '', '', '', '', ''];

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

  const verifyCode = (codeToVerify = code.join('')) => {
    if (codeToVerify.length !== 6) {
      showPopup('Please enter all 6 digits', 'error');
      return;
    }

    setIsVerifying(true);

    // Simulate API call
    setTimeout(() => {
      try{
        await axios.post("/api/auth/signup/verify", {email,code })
        showPopup('Account created successfully! Redirecting...', 'success');
        router.push('/auth');
      }catch(error){
        console.log(error.message);
        showPopup('Invalid verification code. Please try again.', 'error');
        setErrorState(true);
        clearInputs();
      }
      // if (codeToVerify === '123456') {
      //   showPopup('Account created successfully! Redirecting...', 'success');
      //   setTimeout(() => {
      //     // Simulate redirect - in real app, use router.push()
      //     console.log('Redirecting to dashboard...');
      //   }, 2000);
      // } else {
      //   showPopup('Invalid verification code. Please try again.', 'error');
      //   setErrorState(true);
      //   clearInputs();
      // }
      setIsVerifying(false);
    }, 1500);
  };

  const resendCode = () => {
    if (resendTimer > 0) return;

    showPopup('Verification code sent successfully!', 'info');
    clearInputs();
    setResendTimer(60);
  };

  const clearInputs = () => {
    setCode(['', '', '', '', '', '']);
    setErrorState(false);
    inputRefs.current[0]?.focus();
  };

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
  };

  const goBack = () => {
    if (confirm('Are you sure you want to go back? You will need to restart the verification process.')) {
      // In real Next.js app, use router.back()
      window.history.back();
    }
  };

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
              onClick={goBack}
              className="absolute top-5 left-5 text-2xl text-gray-600 hover:text-gray-800 transition-colors duration-300"
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
            We've sent a 6-digit verification code to your email address. Please enter it below.
          </p>

          {/* Code Input */}
          <div className="flex gap-3 justify-center mb-8">
            {code.map((digit, index) => (
                <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleInput(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    className={`w-12 h-14 text-center text-2xl font-semibold border-2 rounded-xl outline-none transition-all duration-300 ${
                        errorState
                            ? 'border-red-500 animate-pulse'
                            : 'border-gray-300 focus:border-indigo-500 focus:scale-105 focus:shadow-md'
                    }`}
                    autoFocus={index === 0}
                />
            ))}
          </div>

          {/* Verify Button */}
          <button
              onClick={() => verifyCode()}
              disabled={isVerifying}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mb-6"
          >
            {isVerifying ? 'Verifying...' : 'Verify Code'}
          </button>

          {/* Resend Section */}
          <div className="text-center text-gray-600 text-sm">
            {resendTimer > 0 ? (
                <span>
              Code sent! Resend in <span className="text-indigo-600 font-semibold">{resendTimer}s</span>
            </span>
            ) : (
                <span>
              Didn't receive the code?{' '}
                  <button
                      onClick={resendCode}
                      className="text-indigo-600 font-semibold underline hover:text-indigo-800 transition-colors duration-300"
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