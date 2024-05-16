import EmailForm from "./login/EmailForm";

const LoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-lightGreen">
      <h1 className="text-4xl font-bold mb-6 text-center text-black">
        Welcome to Be a Pickle Baller Matchmaking
      </h1>
      <div className="p-6 max-w-md w-full bg-white rounded-lg shadow-md mt-4">
        <h2 className="text-3xl font-bold mb-4 text-center text-darkGray">Login</h2>
        <p className="mb-6 text-center text-darkGray">
          Enter your email to receive a secure login link. This will sign you into the matchmaking page.
        </p>
        <EmailForm />
      </div>
    </div>
  );
};

export default LoginPage;
