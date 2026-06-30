import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./sidebar";
import Header from "./Header";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-900">
      <SideBar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Layout Area */}
      <main
        className={`flex-1 overflow-y-auto h-full w-full transition-all duration-300 ${isSidebarOpen ? "lg:pl-64" : ""}`}
      >
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="px-4 lg:px-8 pb-8 pt-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
