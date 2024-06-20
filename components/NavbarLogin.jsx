import Link from 'next/link';
import Image from 'next/image';

const NavbarBasicLogo = () => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return (
    <nav className="w-full bg-white px-4 py-2 shadow-md flex justify-between items-center">
      <div className="flex items-center">
        <Link href="https://bepickleballer.com">
          <div className="max-w-full sm:max-w-[400px]">
            <Image
              src={`${basePath}/logo.png`}
              alt="Desktop Logo"
              className="cursor-pointer mr-2"
              style={{ width: '100%', height: 'auto' }}
              width={634}
              height={117}
              quality={100}
              priority
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
