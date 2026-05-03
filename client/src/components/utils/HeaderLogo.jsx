import React from "react";
import { images } from "../../assets/assets.js";
import { useNavigate } from "react-router-dom";

const HeaderLogo = () => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="fixed top-3 left-3 z-30 inline-flex cursor-pointer rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
      onClick={() => navigate("/")}
      aria-label="Go to homepage"
    >
      <img
        className="h-12 w-auto md:h-16"
        src={images.blackLogo}
        alt="Sello logo"
        width="160"
        height="64"
        decoding="async"
      />
    </button>
  );
};

export default HeaderLogo;
