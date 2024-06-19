import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return (
    <nav className="navbar bg-white px-2 py-1 shadow-md flex justify-between items-center">
      <div className="flex items-center">
        <Link href="https://bepickleballer.com">
          <a>
            <Image
              src={`${basePath}/favicon-logo.png`}
              alt="Mobile Logo"
              className="h-8 w-8 sm:hidden cursor-pointer mr-2"
              width={32}
              height={32}
              quality={100}
              priority
            />
            <Image
              src={`${basePath}/logo.png`}
              alt="Desktop Logo"
              className="hidden sm:block h-10 sm:h-16 lg:h-20 cursor-pointer mr-2"
              width={200}  // Adjust the width to the appropriate size for the logo
              height={60}  // Adjust the height to the appropriate size for the logo
              quality={100}
              priority
            />
          </a>
        </Link>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <Link href="/homepage">
          <a className="text-black hover:underline text-sm sm:text-base">
            <span className="block lg:hidden">Find</span>
            <span className="hidden lg:block">Find Match</span>
          </a>
        </Link>
        <Link href="/matches">
          <a className="text-black hover:underline text-sm sm:text-base">
            <span className="block lg:hidden">Matches</span>
            <span className="hidden lg:block">My Matches</span>
          </a>
        </Link>
        <Link href="/faq">
          <a className="text-black hover:underline">
            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-black">
              ?
            </div>
          </a>
        </Link>
        <Link href="/profile">
          <a className="text-black hover:underline">
            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-4 h-4 sm:w-6 sm:h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM16 14H8c-2.21 0-4 1.79-4 4v1h16v-1c0-2.21-1.79-4-4-4z"
                />
              </svg>
            </div>
          </a>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
