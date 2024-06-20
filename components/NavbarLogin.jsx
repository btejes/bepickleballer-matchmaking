import Link from 'next/link';
import Image from 'next/image';

const NavbarBasicLogo = () => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return (
    <nav className="w-full bg-white px-4 py-2 shadow-md flex justify-between items-center">
      <div className="flex items-center">
        <Link href="https://bepickleballer.com">
          <Image
            src={`${basePath}/logo.png`}
            alt="Desktop Logo"
            className="hidden sm:block cursor-pointer mr-2"
            style={{ maxWidth: '400px', height: 'auto' }}
            width={634}
            height={117}
            quality={100}
            priority
          />
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {/* Add other items here */}
      </div>
    </nav>
  );
};

export default NavbarBasicLogo;
