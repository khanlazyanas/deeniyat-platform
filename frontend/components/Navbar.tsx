import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* 1. Logo Area */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600 tracking-wide">
              Deeniyat
            </Link>
          </div>

          {/* 2. Navigation Links (Desktop) */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition">Home</Link>
            <Link href="/courses" className="text-gray-700 hover:text-blue-600 transition">Courses</Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition">About</Link>
          </div>

          {/* 3. Auth Buttons (Login / Sign Up) */}
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-blue-600 font-medium hover:underline">
              Log in
            </Link>
            <Link 
              href="/register" 
              className="bg-blue-600 text-white px-5 py-2 rounded-md font-medium hover:bg-blue-700 transition"
            >
              Sign up
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}