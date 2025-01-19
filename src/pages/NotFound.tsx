import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-6 bg-white shadow-md rounded-lg max-w-lg w-full">
        <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Oops! Page Not Found</h2>
        <p className="text-gray-500 mb-6">
          We're sorry, but the page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          Go Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
