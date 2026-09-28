import Brand from "@/app/components/Brand";
import LogoutButton from "@/app/components/dashboard/LogoutButton";
import NavLinks from "@/app/components/dashboard/NavLinks";

export default function DashboardNav({ username }: { username: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Brand />
        <NavLinks />
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-500 sm:inline">{username}</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}