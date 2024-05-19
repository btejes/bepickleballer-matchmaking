'use client';

import Link from 'next/link';

const ClientButtons = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Link href="/tournament" legacyBehavior>
        <a className="w-48 bg-yellow-400 text-black font-bold py-2 px-4 rounded-full shadow-md text-center hover:bg-yellow-500">
          Tournament
        </a>
      </Link>
      <Link href="/local-play" legacyBehavior>
        <a className="w-48 bg-blue-500 text-white font-bold py-2 px-4 rounded-full shadow-md text-center hover:bg-blue-700">
          Local Play
        </a>
      </Link>
    </div>
  );
};

export default ClientButtons;
