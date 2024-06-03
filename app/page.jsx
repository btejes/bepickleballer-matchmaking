import EmailForm from "./login/EmailForm";

const LoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-lightGreen">
      <h1 className="text-5xl font-bold mb-6 text-center text-black">
        Welcome to Be a Pickle Baller Matchmaking
      </h1>
      <div className="p-6 max-w-md w-full bg-white rounded-lg shadow-md mt-4">
        <EmailForm />
      </div>
    </div>
  );
};

export default LoginPage;
