import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar fixed at the top */}
      <header className="fixed top-0 left-0 right-0 z-[9999]">
        <Navbar />
      </header>

      {/* Push content down so it's not hidden behind navbar */}
      <main className="flex-1 bg-gray-50 pt-[56px]">{children}</main>

      <Footer />
    </div>
  );
}
