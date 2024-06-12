import Link from 'next/link';

const Navbar = () => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return (
    <nav className="navbar bg-white px-4 py-2 shadow-md flex justify-between items-center">
      <div className="flex items-center">
        <Link href="https://bepickleballer.com">
          <img
            src={`${basePath}/logo.png`}
            alt="Logo"
            className="h-12 w-auto sm:h-16 sm:w-auto lg:h-20 lg:w-auto cursor-pointer"
          />
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <Link href="/homepage" className="text-black hover:underline">
          <span className="block lg:hidden">Find</span>
          <span className="hidden lg:block">Find Match</span>
        </Link>
        <Link href="/matches" className="text-black hover:underline">
          <span className="block lg:hidden">Matches</span>
          <span className="hidden lg:block">My Matches</span>
        </Link>
        <Link href="/faq" className="text-black hover:underline">
          <div className="flex items-center justify-center w-8 h-8 rounded-full border border-black">
            ?
          </div>
        </Link>
        <Link href="/profile" className="text-black hover:underline">
          <div className="flex items-center justify-center w-8 h-8 rounded-full border border-black">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM16 14H8c-2.21 0-4 1.79-4 4v1h16v-1c0-2.21-1.79-4-4-4z"
              />
            </svg>
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
