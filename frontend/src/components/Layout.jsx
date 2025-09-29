import { useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
  const location = useLocation();

  // If we're on /video-feed, don't add extra padding
  const isVideoFeed = location.pathname === "/video-feed";

  if (isVideoFeed) {
    return (
      <div className="flex flex-col min-h-screen">
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />
        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
      <header className="fixed top-0 left-0 right-0 z-[9999]">
        <Navbar />
      </header>

      <main className="flex-1 bg-gray-50 pt-[60px]">{children}</main>

      <Footer />
    </div>
  );
}
