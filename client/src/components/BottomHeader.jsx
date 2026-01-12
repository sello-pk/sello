import React from "react";
import { Link, useLocation } from "react-router-dom";

const BottomHeader = () => {
  const location = useLocation();

  if (location.pathname === "/cars") return null;
  if (location.pathname === "/about") return null;

  return (
    <div
      style={{ zIndex: 1000 }}
      className={`${
        location.pathname === "/users" || location.pathname === "/blog"
          ? "bg-primary"
          : ""
      } bg-[#F5F5F5] w-full flex flex-wrap items-center justify-end md:justify-end gap-4 md:gap-12 px-4 md:px-16 py-2 md:py-3 text-sm md:text-base`}
    >
      <Link to={"/saved-cars"} className="hover:underline">
        Save
      </Link>
      <Link to={"/filter"} className="hover:underline">
        Filter
      </Link>
    </div>
  );
};

export default BottomHeader;
