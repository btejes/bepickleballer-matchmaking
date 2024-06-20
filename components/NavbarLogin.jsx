import Link from 'next/link';
import Image from 'next/image';

const NavbarBasicLogo = () => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return (
    <nav className="w-full bg-white px-4 py-2 shadow-md flex justify-between items-center">
      <div className="flex items-center">
        <Link href="https://bepickleballer.com">
          <div className="relative" style={{ maxWidth: '200px', width: '100%' }}>
            <Image
              src={`${basePath}/logo.png`}
              alt="Logo"
              width={634}
              height={117}
              quality={100}
              priority
              className="cursor-pointer"
            />
          </div>
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {/* Add other items here */}
      </div>
    </nav>
  );
};

export default NavbarBasicLogo;
