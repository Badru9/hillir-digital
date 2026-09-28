"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/", label: "Kalkulator" },
  { href: "/history", label: "History" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 rounded-full bg-slate-100 p-1 text-sm">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            className={cn(
              "rounded-full px-4 py-1.5 font-medium transition",
              active
                ? "bg-white text-brand shadow-sm"
                : "text-slate-500 hover:text-slate-900",
            )}
            href={link.href}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}