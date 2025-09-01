import Link from "next/link";

const Header = () => {
  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-xl font-semibold text-gray-900">
            Journal
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Feed
            </Link>
            <Link
              href="/new-post"
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              New Post
            </Link>
            <button className="text-gray-600 hover:text-gray-900">
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
