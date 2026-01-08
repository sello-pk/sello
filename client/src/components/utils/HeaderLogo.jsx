import React from "react";
import {images} from '../../assets/assets.js';
import { useNavigate } from "react-router-dom";

const HeaderLogo = () => {
  const navigate = useNavigate();
  return (
    <div className="inline cursor-pointer" onClick={() => navigate("/")}>
      <img className="h-24 pl-4 pt-4" src={images.blackLogo} alt="" />
    </div>
  );
};

export default HeaderLogo;
