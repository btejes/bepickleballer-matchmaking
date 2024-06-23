"use client";

import { useState, useEffect } from "react";

const LoginEmailForm = () => {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes countdown

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    try {
      const response = await fetch(`${apiBasePath}/api/request-magic-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      if (response.ok) {
        setEmailSent(true);
      } else {
        console.error("Error sending login link. Response not OK.");
      }
    } catch (error) {
      console.error("Error sending login link.", error);
    }
  };

  useEffect(() => {
    if (emailSent && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [emailSent, timeLeft]);

  return (
    <div>
      {emailSent ? (
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-center text-black">Check Email For Your Magic Link!</h2>
          <p className="mt-4 text-center text-black">
            A secure login link has been sent to <big><strong>{email}</strong></big> <br></br> Click the link in the email to login in to Matchmaking.
          </p>
        </div>
      ) : (
        <>
          <br></br>
          <h2 className="text-3xl font-bold mb-4 text-center text-black">Login</h2>
          <p className="mb-6 text-center text-black">
            Enter your email to get a secure login link. This magic link logs you in without needing a password!
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <div className="mb-4 w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                placeholder="Enter your email"
                required
                className="input input-bordered w-full border border-gray-400 focus:border-blue focus:ring-2 focus:ring-blue text-black bg-white rounded-lg shadow-sm px-3 text-center"
              />
            </div>
            <button
              type="submit"
              className="btn bg-button text-white px-4 py-2 hover:bg-[#3555A2] rounded-lg shadow-sm"
              disabled={emailSent}
            >
              Get Magic Link
            </button>
          </form>
        </>

        
      )}
      {/* Footer with Privacy Policy and Terms of Service */}
      <div className="mt-6 text-center text-black">
        <p className="text-xs">
          By clicking &quot;Get Magic Link&quot; and logging in, you agree to Be Pickle Baller&apos;s 
          <a href="https://bepickleballer.com/terms-of-service/" className="text-blue-500 hover:underline"> Terms of Service </a> 
          and that you have read our 
          <a href="https://bepickleballer.com/privacy-policy/" className="text-blue-500 hover:underline"> Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default LoginEmailForm;
