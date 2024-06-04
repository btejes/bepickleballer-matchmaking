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
          <h2 className="text-3xl font-bold mb-4 text-center text-darkGray">Check Email For Your Magic Link!</h2>
          <p className="mt-4 text-center text-black">
            A secure signin link has been sent to <big><strong>{email}</strong></big> <br></br> Click the link in the email to signin in to Matchmaking.
          </p>
        </div>
      ) : (
        <>
          <br></br>
          <h2 className="text-3xl font-bold mb-4 text-center text-darkGray">Signin</h2>
          <p className="mb-6 text-center text-darkGray">
            Enter your email to get a secure sign-in link. This magic link signs you in without needing a password no signup step required!
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
              className="btn bg-[#FF5C36] text-white px-4 py-2 hover:bg-[#3555A2] rounded-lg shadow-sm"
              disabled={emailSent}
            >
              Get Magic Link
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default EmailForm;
