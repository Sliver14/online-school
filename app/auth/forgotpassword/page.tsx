// "use client"
// import { useState, useRef, useEffect, useCallback } from 'react';
// // import axios from "axios";
// import axios from 'axios';
// import { useRouter } from "next/navigation";

// // At the top of your file or in a types file
// interface FieldErrors {
//     email?: string;
//     password?: string;
//     confirmPassword?: string;
//     // add other fields as needed
// }
// // Define the interface outside the function (at the top of your file)
// interface CustomAxiosError {
//     response?: {
//         status: number;
//         data?: {
//             message?: string;
//             [key: string]: unknown;
//         };
//         headers?: Record<string, string>;
//     };
//     request?: XMLHttpRequest;
//     message?: string;
// }



// export default function ForgotPasswordPage() {
//     const inputRefs = useRef<(HTMLInputElement | null)[]>(new Array(6).fill(null));
//     const [email, setEmail] = useState('');
//     const [code, setCode] = useState(['', '', '', '', '', '']);
//     const [newPassword, setNewPassword] = useState('');
//     const [confirmPassword, setConfirmPassword] = useState('');
//     const [currentStep, setCurrentStep] = useState('email'); // 'email', 'verify', or 'reset'
//     const [isLoading, setIsLoading] = useState(false);
//     const [isVerifying, setIsVerifying] = useState(false);
//     const [isResetting, setIsResetting] = useState(false);
//     const [resendTimer, setResendTimer] = useState(0);
//     const [popup, setPopup] = useState({ show: false, message: '', type: '' });
//     const [errorState, setErrorState] = useState(false);
//     const [verificationCode, setVerificationCode] = useState(''); // Store verified code
//     const [retryCount, setRetryCount] = useState(0);
//     const [isRateLimited, setIsRateLimited] = useState(false);
//     const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
//     const router = useRouter();

//     // Timer effect for resend button
//     useEffect(() => {
//         let interval: NodeJS.Timeout | null = null;
//         if (resendTimer > 0) {
//             interval = setInterval(() => {
//                 setResendTimer(prev => prev - 1);
//             }, 1000);
//         }
//         return () => {
//             if (interval) {
//                 clearInterval(interval);
//             }
//         };
//     }, [resendTimer]);

//     // Auto-hide popup effect
//     useEffect(() => {
//         if (popup.show) {
//             const timer = setTimeout(() => {
//                 setPopup(prev => ({ ...prev, show: false }));
//             }, 5000); // 5 seconds for better UX
//             return () => clearTimeout(timer);
//         }
//     }, [popup.show]);

//     // Clear field errors when user starts typing - Fixed dependencies
//     useEffect(() => {
//         if (fieldErrors.email && email) {
//             setFieldErrors(prev => ({ ...prev, email: undefined }));
//         }
//     }, [email, fieldErrors.email]);

//     useEffect(() => {
//         if (fieldErrors.password && newPassword) {
//             setFieldErrors(prev => ({ ...prev, password: undefined }));
//         }
//     }, [newPassword, fieldErrors.password]);

//     useEffect(() => {
//         if (fieldErrors.confirmPassword && confirmPassword) {
//             setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
//         }
//     }, [confirmPassword, fieldErrors.confirmPassword]);

//     // Validation functions
//     const validateEmail = (email: string) => {
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         return emailRegex.test(email);
//     };

//     const validatePassword = (password: string) => {
//         const errors = [];
//         if (password.length < 6) {
//             errors.push('Password must be at least 6 characters long');
//         }
//         if (!/(?=.*[a-z])/.test(password)) {
//             errors.push('Password must contain at least one lowercase letter');
//         }
//         if (!/(?=.*[A-Z])/.test(password)) {
//             errors.push('Password must contain at least one uppercase letter');
//         }
//         if (!/(?=.*\d)/.test(password)) {
//             errors.push('Password must contain at least one number');
//         }
//         return errors;
//     };

//     // Type guard function (also at the top of your file)
//     const isAxiosError = (error: unknown): error is CustomAxiosError => {
//         return error !== null && typeof error === 'object';
//     };

//     // Enhanced error handling function
//     const handleApiError = (error: unknown, context: string) => {
//         console.error(`Error in ${context}:`, error);

//         let errorMessage = 'An unexpected error occurred. Please try again.';
//         let shouldRetry = true;

//         if (isAxiosError(error) && error.response) {
//             const { status, data } = error.response;

//             switch (status) {
//                 case 400:
//                     errorMessage = data?.message || 'Invalid request. Please check your input.';
//                     shouldRetry = false;
//                     break;
//                 case 401:
//                     errorMessage = 'Session expired. Please start over.';
//                     shouldRetry = false;
//                     setTimeout(() => {
//                         setCurrentStep('email');
//                         resetForm();
//                     }, 2000);
//                     break;
//                 case 403:
//                     errorMessage = 'Access denied. Please try again later.';
//                     shouldRetry = false;
//                     break;
//                 case 404:
//                     errorMessage = context === 'email'
//                         ? 'Email address not found in our system.'
//                         : 'Service not found. Please try again later.';
//                     shouldRetry = false;
//                     break;
//                 case 409:
//                     errorMessage = 'Verification code has expired. Please request a new one.';
//                     shouldRetry = true;
//                     if (context === 'verify') {
//                         clearInputs();
//                         setResendTimer(0);
//                     }
//                     break;
//                 case 429:
//                     const retryAfter = error.response.headers?.['retry-after'] || '60';
//                     const retrySeconds = parseInt(retryAfter);
//                     errorMessage = `Too many attempts. Please try again in ${retrySeconds} seconds.`;
//                     setIsRateLimited(true);
//                     setResendTimer(retrySeconds);
//                     setTimeout(() => setIsRateLimited(false), retrySeconds * 1000);
//                     shouldRetry = false;
//                     break;
//                 case 500:
//                 case 502:
//                 case 503:
//                     errorMessage = 'Server is temporarily unavailable. Please try again in a few minutes.';
//                     shouldRetry = true;
//                     break;
//                 default:
//                     errorMessage = data?.message || `Server error (${status}). Please try again.`;
//             }
//         } else if (isAxiosError(error) && error.request) {
//             // Network error
//             errorMessage = 'Network error. Please check your internet connection and try again.';
//             shouldRetry = true;
//         } else {
//             // Request setup error or unknown error
//             errorMessage = isAxiosError(error) && error.message
//                 ? error.message
//                 : 'Request failed. Please try again.';
//             shouldRetry = true;
//         }

//         showPopup(errorMessage, 'error');
//         return { message: errorMessage, shouldRetry };
//     };

//     const handleEmailSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setFieldErrors({});

//         // Client-side validation
//         if (!email.trim()) {
//             setFieldErrors({ email: 'Email address is required' });
//             showPopup('Please enter your email address', 'error');
//             return;
//         }

//         if (!validateEmail(email)) {
//             setFieldErrors({ email: 'Please enter a valid email address' });
//             showPopup('Please enter a valid email address', 'error');
//             return;
//         }

//         if (isRateLimited) {
//             showPopup('Please wait before trying again', 'error');
//             return;
//         }

//         setIsLoading(true);

//         try {
//             await axios.post("/api/auth/resetresend", {
//                 email: email.trim().toLowerCase()
//             })

//                 showPopup('Reset code sent to your email!', 'success');
//                 setCurrentStep('verify');
//                 setResendTimer(60);
//                 setRetryCount(0);

//         } catch (error) {
//             console.error(error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleInput = (value: string, index: number) => {
//         const numericValue = value.replace(/[^0-9]/g, '');

//         if (numericValue.length <= 1) {
//             const newCode = [...code];
//             newCode[index] = numericValue;
//             setCode(newCode);
//             setErrorState(false);

//             // Move to next input
//             if (numericValue && index < 5) {
//                 inputRefs.current[index + 1]?.focus();
//             }

//             // Auto-verify when all fields are filled
//             if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
//                 setTimeout(() => verifyCode(newCode.join('')), 100);
//             }
//         }
//     };

//     const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
//         if (event.key === 'Backspace' && !code[index] && index > 0) {
//             inputRefs.current[index - 1]?.focus();
//         }
//         if (event.key === 'Enter' && code.every(digit => digit !== '')) {
//             verifyCode();
//         }
//     };

//     const handlePaste = (event: React.ClipboardEvent) => {
//         event.preventDefault();

//         try {
//             const pastedData = (event.clipboardData || (window as unknown as { clipboardData?: DataTransfer }).clipboardData)?.getData('text') || '';
//             const digits = pastedData.replace(/[^0-9]/g, '').slice(0, 6);

//             if (digits.length === 0) {
//                 showPopup('No valid digits found in clipboard', 'error');
//                 return;
//             }

//             const newCode = ['', '', '', '', '', ''];

//             for (let i = 0; i < digits.length && i < 6; i++) {
//                 newCode[i] = digits[i];
//             }

//             setCode(newCode);
//             setErrorState(false);

//             const nextIndex = Math.min(digits.length, 5);
//             inputRefs.current[nextIndex]?.focus();

//             if (digits.length === 6) {
//                 setTimeout(() => verifyCode(digits), 100);
//             }

//             showPopup(`${digits.length} digit${digits.length > 1 ? 's' : ''} pasted successfully!`, 'info');
//         } catch {
//             showPopup('Failed to paste. Please enter the code manually.', 'error');
//         }
//     };

//     const verifyCode = async (codeToVerify = code.join('')) => {
//         if (codeToVerify.length !== 6) {
//             showPopup('Please enter all 6 digits', 'error');
//             setErrorState(true);
//             return;
//         }

//         if (!/^\d{6}$/.test(codeToVerify)) {
//             showPopup('Code must contain only numbers', 'error');
//             setErrorState(true);
//             return;
//         }

//         if (isRateLimited) {
//             showPopup('Please wait before trying again', 'error');
//             return;
//         }

//         setIsVerifying(true);
//         setErrorState(false);

//         try {
//             await axios.post("/api/auth/signup/verify", {
//                 email: email.trim().toLowerCase(),
//                 code: codeToVerify
//             }, {
//                 timeout: 30000,
//                 headers: {
//                     'Content-Type': 'application/json'
//                 }
//             });

//                 showPopup('Code verified! Please set your new password.', 'success');
//                 setVerificationCode(codeToVerify);
//                 setCurrentStep('reset');
//                 setRetryCount(0);

//         } catch (error) {
//             const { shouldRetry } = handleApiError(error, 'verify');
//             setErrorState(true);

//             if (shouldRetry && retryCount < 3) {
//                 setRetryCount(prev => prev + 1);
//             } else {
//                 clearInputs();
//                 setRetryCount(0);
//             }
//         } finally {
//             setIsVerifying(false);
//         }
//     };

//     const handlePasswordReset = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setFieldErrors({});

//         // Client-side validation
//         const passwordErrors = validatePassword(newPassword);
//         if (passwordErrors.length > 0) {
//             setFieldErrors({ password: passwordErrors[0] });
//             showPopup(passwordErrors[0], 'error');
//             return;
//         }

//         if (newPassword !== confirmPassword) {
//             setFieldErrors({ confirmPassword: 'Passwords do not match' });
//             showPopup('Passwords do not match', 'error');
//             return;
//         }

//         if (isRateLimited) {
//             showPopup('Please wait before trying again', 'error');
//             return;
//         }

//         setIsResetting(true);

//         try {
//             await axios.post("/api/auth/newpassword", {
//                 email: email.trim().toLowerCase(),
//                 code: verificationCode,
//                 password: newPassword
//             })
//                 showPopup('Password reset successfully! Redirecting to login...', 'success');
//                 setTimeout(() => {
//                     try {
//                         router.push('/auth');
//                     } catch {
//                         window.location.href = '/auth';
//                     }
//                 }, 2000);

//         } catch (error) {
//             const { shouldRetry } = handleApiError(error, 'reset');

//             if (shouldRetry && retryCount < 3) {
//                 setRetryCount(prev => prev + 1);
//                 showPopup(`Retrying... (${retryCount + 1}/3)`, 'info');
//                 setTimeout(() => handlePasswordReset(e), 2000);
//             } else if (retryCount >= 3) {
//                 showPopup('Maximum retry attempts reached. Please try again later.', 'error');
//                 setRetryCount(0);
//             }
//         } finally {
//             setIsResetting(false);
//         }
//     };

//     const resendCode = async () => {
//         if (resendTimer > 0 || isRateLimited) {
//             showPopup('Please wait before requesting another code', 'error');
//             return;
//         }

//         try {
//             const response = await axios.post("/api/auth/resendcode", {
//                 email: email.trim().toLowerCase()
//             }, {
//                 timeout: 30000,
//                 headers: {
//                     'Content-Type': 'application/json'
//                 }
//             });

//             if (response.data?.success) {
//                 showPopup('Reset code sent successfully!', 'info');
//                 clearInputs();
//                 setResendTimer(60);
//                 setRetryCount(0);
//             } else {
//                 throw new Error(response.data?.message || 'Failed to resend code');
//             }
//         } catch (error) {
//             handleApiError(error, 'resend');
//         }
//     };

//     const clearInputs = useCallback(() => {
//         setCode(['', '', '', '', '', '']);
//         setErrorState(false);
//         setFieldErrors({});
//         setTimeout(() => {
//             inputRefs.current[0]?.focus();
//         }, 100);
//     }, []);

//     const resetForm = useCallback(() => {
//         setEmail('');
//         setCode(['', '', '', '', '', '']);
//         setNewPassword('');
//         setConfirmPassword('');
//         setVerificationCode('');
//         setErrorState(false);
//         setRetryCount(0);
//         setFieldErrors({});
//         setResendTimer(0);
//         setIsRateLimited(false);
//     }, []);

//     const showPopup = (message: string, type: string) => {
//         setPopup({ show: true, message, type });
//     };

//     const goBack = () => {
//         if (currentStep === 'reset') {
//             if (confirm('Are you sure you want to go back? You will lose your progress.')) {
//                 setCurrentStep('verify');
//                 setNewPassword('');
//                 setConfirmPassword('');
//                 setFieldErrors({});
//             }
//         } else if (currentStep === 'verify') {
//             if (confirm('Are you sure you want to go back? You will need to restart the process.')) {
//                 setCurrentStep('email');
//                 resetForm();
//             }
//         } else {
//             try {
//                 router.back();
//             } catch {
//                 window.history.back();
//             }
//         }
//     };

//     return (
//         <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-5" style={{ backgroundImage: "url('/welcome/bg welcome app.png')"}}>
//             {/* Popup */}
//             <div className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-xl text-white font-semibold shadow-lg transform transition-transform duration-300 ${
//                 popup.show ? 'translate-x-0' : 'translate-x-96'
//             } ${
//                 popup.type === 'success' ? 'bg-gradient-to-r from-green-500 to-green-600' :
//                     popup.type === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' :
//                         'bg-gradient-to-r from-blue-500 to-blue-600'
//             } md:max-w-sm max-w-xs`}>
//                 {popup.message}
//             </div>

//             {/* Main Container */}
//             <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl w-full max-w-md relative">
//                 {/* Back Button */}
//                 <button
//                     onClick={goBack}
//                     className="absolute top-5 left-5 text-2xl text-gray-600 hover:text-gray-800 transition-colors duration-300"
//                     disabled={isLoading || isVerifying || isResetting}
//                 >
//                     ←
//                 </button>

//                 {/* Icon */}
//                 <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-4xl text-white mx-auto mb-8">
//                     {currentStep === 'email' ? '🔑' : currentStep === 'verify' ? '🔐' : '🔒'}
//                 </div>

//                 {currentStep === 'email' ? (
//                     <>
//                         {/* Email Step Header */}
//                         <h1 className="text-3xl font-bold text-gray-800 text-center mb-3">
//                             Forgot Password?
//                         </h1>
//                         <p className="text-gray-600 text-center mb-10 leading-relaxed">
//                             Enter your email address and we&apos;ll send you a verification code to reset your password.
//                         </p>

//                         {/* Email Form */}
//                         <form onSubmit={handleEmailSubmit}>
//                             <div className="mb-8">
//                                 <input
//                                     type="email"
//                                     value={email}
//                                     onChange={(e) => setEmail(e.target.value)}
//                                     placeholder="Enter your email address"
//                                     // Then use:
//                                     className={`w-full px-4 py-4 text-lg border-2 rounded-xl text-gray-800 outline-none transition-all duration-300 focus:scale-105 focus:shadow-md ${
//                                         (fieldErrors as FieldErrors).email
//                                             ? 'border-red-500 focus:border-red-500'
//                                             : 'border-gray-300 focus:border-indigo-500'
//                                     }`}
//                                     required
//                                     autoFocus
//                                     disabled={isLoading}
//                                 />
//                                 {(fieldErrors as FieldErrors).email && (
//                                     <p className="text-red-500 text-sm mt-2">{(fieldErrors as FieldErrors).email}</p>
//                                 )}
//                             </div>

//                             {/* Send Code Button */}
//                             <button
//                                 type="submit"
//                                 disabled={isLoading || isRateLimited}
//                                 className="w-full cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mb-6"
//                             >
//                                 {isLoading ? 'Sending Code...' : isRateLimited ? 'Please Wait...' : 'Send Reset Code'}
//                             </button>
//                         </form>
//                     </>
//                 ) : currentStep === 'verify' ? (
//                     <>
//                         {/* Verification Step Header */}
//                         <h1 className="text-3xl font-bold text-gray-800 text-center mb-3">
//                             Verify Your Code
//                         </h1>
//                         <p className="text-gray-600 text-center mb-10 leading-relaxed">
//                             We&apos;ve sent a 6-digit verification code to {email}. Please enter it below.
//                         </p>

//                         {/* Code Input */}
//                         <div className="flex gap-3 justify-center mb-8">
//                             {code.map((digit, index) => (
//                                 <input
//                                     key={index}
//                                     ref={el => {
//                                         if (inputRefs.current) {
//                                             inputRefs.current[index] = el;
//                                         }
//                                     }}
//                                     type="text"
//                                     inputMode="numeric"
//                                     pattern="[0-9]*"
//                                     maxLength={1}
//                                     value={digit}
//                                     onChange={(e) => handleInput(e.target.value, index)}
//                                     onKeyDown={(e) => handleKeyDown(e, index)}
//                                     onPaste={handlePaste}
//                                     className={`w-12 h-14 text-center text-gray-800 text-2xl font-semibold border-2 rounded-xl outline-none transition-all duration-300 ${
//                                         errorState
//                                             ? 'border-red-500 animate-pulse'
//                                             : 'border-gray-300 focus:border-indigo-500 focus:scale-105 focus:shadow-md'
//                                     }`}
//                                     autoFocus={index === 0}
//                                     disabled={isVerifying}
//                                 />
//                             ))}
//                         </div>

//                         {/* Verify Button */}
//                         <button
//                             onClick={() => verifyCode()}
//                             disabled={isVerifying || isRateLimited || code.some(digit => digit === '')}
//                             className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mb-6"
//                         >
//                             {isVerifying ? 'Verifying...' : 'Verify Code'}
//                         </button>

//                         {/* Resend Section */}
//                         <div className="text-center text-gray-600 text-sm">
//                             {resendTimer > 0 ? (
//                                 <span>
//                                     Code sent! Resend in <span className="text-indigo-600 font-semibold">{resendTimer}s</span>
//                                 </span>
//                             ) : (
//                                 <span>
//                                     Didn&apos;t receive the code?{' '}
//                                     <button
//                                         onClick={resendCode}
//                                         disabled={isRateLimited}
//                                         className="text-indigo-600 font-semibold underline hover:text-indigo-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                                     >
//                                         Resend Code
//                                     </button>
//                                 </span>
//                             )}
//                         </div>
//                     </>
//                 ) : (
//                     <>
//                         {/* Password Reset Step Header */}
//                         <h1 className="text-3xl font-bold text-gray-800 text-center mb-3">
//                             Set New Password
//                         </h1>
//                         <p className="text-gray-600 text-center mb-10 leading-relaxed">
//                             Please enter your new password. Make sure it meets the security requirements.
//                         </p>

//                         {/* Password Reset Form */}
//                         <form onSubmit={handlePasswordReset}>
//                             <div className="mb-6">
//                                 <input
//                                     type="password"
//                                     value={newPassword}
//                                     onChange={(e) => setNewPassword(e.target.value)}
//                                     placeholder="Enter new password"
//                                     className={`w-full px-4 py-4 text-lg border-2 rounded-xl text-gray-800 outline-none transition-all duration-300 focus:scale-105 focus:shadow-md ${
//                                         (fieldErrors as FieldErrors).password
//                                             ? 'border-red-500 focus:border-red-500'
//                                             : 'border-gray-300 focus:border-indigo-500'
//                                     }`}
//                                     required
//                                     autoFocus
//                                     minLength={6}
//                                     disabled={isResetting}
//                                 />
//                                 {(fieldErrors as FieldErrors).password && (
//                                     <p className="text-red-500 text-sm mt-2">{(fieldErrors as FieldErrors).password}</p>
//                                 )}
//                             </div>

//                             <div className="mb-8">
//                                 <input
//                                     type="password"
//                                     value={confirmPassword}
//                                     onChange={(e) => setConfirmPassword(e.target.value)}
//                                     placeholder="Confirm new password"
//                                     className={`w-full px-4 py-4 text-lg border-2 rounded-xl text-gray-800 outline-none transition-all duration-300 focus:scale-105 focus:shadow-md ${
//                                         (fieldErrors as FieldErrors).confirmPassword
//                                             ? 'border-red-500 focus:border-red-500'
//                                             : 'border-gray-300 focus:border-indigo-500'
//                                     }`}
//                                     required
//                                     minLength={6}
//                                     disabled={isResetting}
//                                 />
//                                 {(fieldErrors as FieldErrors).confirmPassword && (
//                                     <p className="text-red-500 text-sm mt-2">{(fieldErrors as FieldErrors).confirmPassword}</p>
//                                 )}
//                             </div>

//                             {/* Reset Password Button */}
//                             <button
//                                 type="submit"
//                                 disabled={isResetting || isRateLimited || !newPassword || !confirmPassword}
//                                 className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mb-6"
//                             >
//                                 {isResetting ? 'Resetting Password...' : 'Reset Password'}
//                             </button>
//                         </form>

//                         {/* Password Requirements */}
//                         <div className="text-center text-gray-600 text-xs space-y-1">
//                             <p>Password requirements:</p>
//                             <p>• At least 6 characters long</p>
//                             <p>• Contains uppercase and lowercase letters</p>
//                             <p>• Contains at least one number</p>
//                         </div>
//                     </>
//                 )}
//             </div>

//             <style jsx>{`
//                 @keyframes pulse {
//                     0%, 100% { transform: scale(1); }
//                     50% { transform: scale(1.05); }
//                 }
//                 .animate-pulse {
//                     animation: pulse 0.5s ease-in-out;
//                 }
//             `}</style>
//         </div>
//     );
// }

"use client"
import React from 'react'

export default function page() {
  return (
    <div>
      
    </div>
  )
}
