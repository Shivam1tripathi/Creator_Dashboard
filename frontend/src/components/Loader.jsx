import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Loader = ({ path = "login" }) => {
  const [count, setCount] = useState(3);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevValue) => --prevValue);
    }, 1000);
    count === 0 &&
      navigate(`/${path}`, {
        state: location.pathname,
      });
    return () => clearInterval(interval);
  }, [count, navigate, location, path]);
  return (
    <>
      <div className="flex flex-col justify-center items-center h-[90vh]">
        <h1 className="text-xl font-semibold mb-4">
          Redirecting you to login page in {count} sec
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    </>
  );
};

export default Loader;
