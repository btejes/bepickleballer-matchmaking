"use client";

import { useState } from "react";

const EmailForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/request-magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage("Check your email for the secure login link.");
      } else {
        setMessage("Error sending login link.");
      }
    } catch (error) {
      setMessage("Error sending login link.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <div className="mb-4 w-full">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="input input-bordered w-full border border-gray-400 focus:border-blue focus:ring-2 focus:ring-blue text-black bg-white rounded-lg shadow-sm px-3 text-center"
          />
        </div>
        <button
          type="submit"
          className="btn bg-blue-500 text-white px-4 py-2 hover:bg-blue-700 rounded-lg shadow-sm"
        >
          Get Login Link
        </button>
      </form>
      {message && <p className="mt-4 text-center text-black">{message}</p>}
    </div>
  );
};

export default EmailForm;
