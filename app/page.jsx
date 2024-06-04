import EmailForm from "./login/EmailForm";
import NavbarBasicLogo from "@/components/NavbarBasicLogo";

const LoginPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#3555A2]">
      <NavbarBasicLogo />
      <div className="flex flex-col items-center justify-center flex-grow">
        <h1 className="text-5xl font-bold mb-6 text-center text-white">
        Find Your Perfect “Pickle Baller” Partner
        </h1>
        <div className="p-6 max-w-md w-full bg-white rounded-lg shadow-md mt-4">
          <EmailForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
