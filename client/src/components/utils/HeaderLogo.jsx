import React from "react";
import { images } from "../../assets/assets.js";
import { useNavigate } from "react-router-dom";

const HeaderLogo = () => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="inline cursor-pointer"
      onClick={() => navigate("/")}
      aria-label="Go to homepage"
    >
      <img className="h-24 pl-4 pt-4" src={images.blackLogo} alt="Sello logo" />
    </button>
  );
};

export default HeaderLogo;
