"use client";

import { useState, useEffect } from "react";

const EmailForm = () => {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes countdown

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/request-magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      if (response.ok) {
        setEmailSent(true);
      } else {
        console.error("Error sending login link.");
      }
    } catch (error) {
      console.error("Error sending login link.");
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
          <h2 className="text-3xl font-bold mb-4 text-center text-darkGray">Check Email For Your Secure Magic Link!</h2>
          <p className="mt-4 text-center text-black">
            A secure login link, expiring in 15 minutes, has been sent to <strong>{email}</strong> Click the link in the email to log in to your account.
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-bold mb-4 text-center text-darkGray">Login</h2>
          <p className="mb-6 text-center text-darkGray">
            Enter your email to get a secure login link. This magic link lets you sign in/up without needing a password.
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
              className="btn bg-blue-500 text-white px-4 py-2 hover:bg-blue-700 rounded-lg shadow-sm"
              disabled={emailSent}
            >
              Get Login Link
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default EmailForm;
