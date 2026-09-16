"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    label: "Home",
    href: "/dashboard",
    icon: "⌂",
  },
  {
    label: "Notes",
    href: "/dashboard/notes",
    icon: "▤",
  },
  {
    label: "Memories",
    href: "/dashboard/memories",
    icon: "▧",
  },
  {
    label: "Reminders",
    href: "/dashboard/reminders",
    icon: "◷",
  },
  {
    label: "My CV",
    href: "/dashboard/cv",
    icon: "▥",
  },
  {
    label: "Web Search",
    href: "/dashboard/search",
    icon: "⌕",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f7efef]">
      {/* Desktop Sidebar */}

      <aside className="dashboard-sidebar fixed left-0 top-0 z-50 hidden h-screen w-[245px] flex-col px-5 py-7 lg:flex">
        {/* Logo */}

        <Link
          href="/dashboard"
          className="mb-10 px-3 transition-opacity hover:opacity-85"
        >
          <div className="font-script text-4xl text-white">
            Here I Am
          </div>

          <div className="mt-1 font-body text-[8px] tracking-[0.4em] text-white/55">
            YOUR SPACE, YOUR STORY
          </div>
        </Link>

        {/* Navigation */}

        <nav className="flex flex-1 flex-col gap-2">
          {navigation.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-item ${
                  active ? "sidebar-item-active" : ""
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-lg">
                  {item.icon}
                </span>

                <span className="font-body text-xs tracking-wide">
                  {item.label}
                </span>
              </Link>
            );
          })}

          <div className="my-5 h-px bg-white/15" />

          <Link
            href="/dashboard"
            className="sidebar-item"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-lg">
              ✦
            </span>

            <span className="font-body text-xs tracking-wide">
              Daily Thoughts
            </span>
          </Link>
        </nav>

        {/* Bottom */}

        <div className="mt-auto">
          <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-script text-2xl text-white/80">
              Keep going.
            </p>

            <p className="mt-1 font-body text-[9px] leading-5 text-white/45">
              A little progress each day becomes something beautiful.
            </p>
          </div>

          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="sidebar-item w-full text-left"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-lg">
                ↪
              </span>

              <span className="font-body text-xs tracking-wide">
                Log Out
              </span>
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Top Navigation */}

      <header className="dashboard-sidebar sticky top-0 z-50 flex items-center justify-between px-5 py-4 lg:hidden">
        <Link href="/dashboard">
          <div className="font-script text-3xl text-white">
            Here I Am
          </div>

          <div className="font-body text-[7px] tracking-[0.3em] text-white/55">
            YOUR SPACE, YOUR STORY
          </div>
        </Link>

        <Link
          href="/dashboard/search"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-lg text-white"
        >
          ⌕
        </Link>
      </header>

      {/* Main Content */}

      <div className="min-h-screen lg:ml-[245px]">
        {children}
      </div>
    </div>
  );
}