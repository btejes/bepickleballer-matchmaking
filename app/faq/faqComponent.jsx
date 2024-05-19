'use client';

import React, { useState } from 'react';

const FaqComponent = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details
      className="bg-white border border-gray-300 p-4 rounded-md shadow-md"
      open={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
    >
      <summary className="font-mulish text-lg cursor-pointer flex justify-between items-center">
        {question}
        <span className="ml-2">{isOpen ? '×' : '+'}</span>
      </summary>
      <br></br>
      <p className="mt-2 font-mulish">{answer}</p>
    </details>
  );
};

export default FaqComponent;
