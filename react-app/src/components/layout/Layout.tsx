import React from "react";
import { useLocation } from "react-router-dom";
import { ModeProvider } from "../../context/ModeContext";
import { Navbar } from "./Navbar";
import { DocumentationNavbar } from "./DocumentationNavbar";
import Sidebar from "./Sidebar";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isDocumentacionPage = location.pathname === "/documentacion";

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {isDocumentacionPage ? (
          <ModeProvider>
            <DocumentationNavbar />
            <main className="p-4 flex-1 overflow-auto">{children}</main>
          </ModeProvider>
        ) : (
          <>
            <Navbar />
            <main className="p-4 flex-1 overflow-auto">{children}</main>
          </>
        )}
      </div>
    </div>
  );
};

export default Layout;
