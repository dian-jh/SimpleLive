import { Outlet } from "react-router";
import { Navbar } from "./Navbar";

export function Root() {
  return (
    <div className="min-h-screen bg-[#FDFDFE] text-slate-900 font-sans selection:bg-slate-200">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
