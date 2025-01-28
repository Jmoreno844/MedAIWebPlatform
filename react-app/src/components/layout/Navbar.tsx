import React from "react";
import { Link } from "react-router-dom";

interface NavbarProps {
  toggleCreate?: () => void; // If toggleCreate is used elsewhere
}

export const Navbar: React.FC<NavbarProps> = ({ toggleCreate }) => {
  return (
    <nav className="bg-blue-600 h-16 flex items-center justify-center">
      <Link to="/home" className="text-white text-2xl font-bold">
        MediScribe
      </Link>
    </nav>
  );
};
