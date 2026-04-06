import { Outlet, useLocation } from "react-router";
import { Navbar } from "./Navbar";

export function Root() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const showNavbar = isHome || location.pathname.startsWith("/room");

  return (
    <div className="min-h-screen bg-[#FDFDFE] text-slate-900 font-sans selection:bg-slate-200">
      {showNavbar && <Navbar />}
      <main className={showNavbar ? "pt-16" : ""}>
        <Outlet />
      </main>
    </div>
  );
}
