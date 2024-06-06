import Link from 'next/link';

const NavbarBasicLogo = () => {
  // Assuming your environment variable is named NEXT_PUBLIC_BASE_PATH
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return (
    <nav className="w-full bg-white px-4 py-2 shadow-md flex justify-between items-center">
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
        
      </div>
    </nav>
  );
};

export default NavbarBasicLogo;
