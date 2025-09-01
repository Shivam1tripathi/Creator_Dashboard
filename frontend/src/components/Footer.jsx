export default function Footer() {
  return (
    <footer className="bg-gray-900/80 backdrop-blur-md border-t border-gray-700 ">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
        {/* Left - Copyright */}
        <div className="mb-3 md:mb-0">
          © {new Date().getFullYear()}{" "}
          <span className="text-white font-medium">CreatorHub</span>. All rights
          reserved.
        </div>

        {/* Middle - Links */}
        <div className="flex space-x-6">
          <a href="/privacy" className="hover:text-purple-400 transition">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-purple-400 transition">
            Terms of Service
          </a>
          <a href="/contact" className="hover:text-purple-400 transition">
            Contact Us
          </a>
        </div>

        {/* Right - Socials (Optional) */}
        <div className="flex space-x-4 mt-3 md:mt-0">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-purple-400 transition"
          >
            <i className="fab fa-twitter"></i>
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-purple-400 transition"
          >
            <i className="fab fa-linkedin"></i>
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-purple-400 transition"
          >
            <i className="fab fa-github"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}
