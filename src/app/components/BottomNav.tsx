// src/app/components/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaTools, FaHistory } from "react-icons/fa";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", icon: <FaHome />, href: "/dashboard" },
    { label: "Manage", icon: <FaTools />, href: "/manage" },
    { label: "History", icon: <FaHistory />, href: "/history" },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive ? "active" : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
