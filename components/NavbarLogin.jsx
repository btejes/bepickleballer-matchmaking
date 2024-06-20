import Link from 'next/link';
import Image from 'next/image';

const NavbarBasicLogo = () => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return (
    <nav className="w-full bg-white px-4 py-2 shadow-md flex justify-between items-center">
      <div className="flex items-center">
        <Link href="https://bepickleballer.com">
          <a>
            <div className="relative h-16 w-[127px] lg:h-20 lg:w-[158px] cursor-pointer">
              <Image
                src={`${basePath}/logo.png`}
                alt="Logo"
                layout="fill"
                objectFit="contain"
                priority
              />
            </div>
          </a>
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {/* Add other items here */}
      </div>
    </nav>
  );
};

export default NavbarBasicLogo;
