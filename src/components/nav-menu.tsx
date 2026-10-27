"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { isNavGroup, type NavItem, type NavLink } from "@/content/site";

function idFor(label: string) {
  return `nav-${label.toLowerCase().replace(/\s+/g, "-")}`;
}

export function NavMenu({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  const isOpen = openGroup !== null || mobileOpen;

  useEffect(() => {
    if (!isOpen) return;

    function closeAll() {
      setOpenGroup(null);
      setMobileOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      const trigger = openGroup ? document.getElementById(`${idFor(openGroup)}-button`) : mobileButtonRef.current;
      closeAll();
      trigger?.focus();
    }

    function handlePointerDown(event: PointerEvent) {
      if (!navRef.current?.contains(event.target as Node)) closeAll();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen, openGroup]);

  function closeAll() {
    setOpenGroup(null);
    setMobileOpen(false);
  }

  function linkProps(link: NavLink) {
    return {
      href: link.href,
      onClick: closeAll,
      "aria-current": pathname === link.href ? ("page" as const) : undefined,
    };
  }

  return (
    <nav ref={navRef} aria-label="Main">
      <ul className="hidden items-center gap-1 lg:flex">
        {items.map((item) => {
          if (!isNavGroup(item)) {
            return (
              <li key={item.href}>
                <Link
                  {...linkProps(item)}
                  className="inline-flex min-h-11 items-center rounded-lg px-3 font-semibold text-ink no-underline hover:bg-sand aria-[current=page]:text-brand aria-[current=page]:underline"
                >
                  {item.label}
                </Link>
              </li>
            );
          }

          const id = idFor(item.label);
          const expanded = openGroup === item.label;
          return (
            <li key={item.label} className="relative">
              <button
                id={`${id}-button`}
                type="button"
                aria-expanded={expanded}
                aria-controls={id}
                onClick={() => setOpenGroup(expanded ? null : item.label)}
                className="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-lg px-3 font-semibold text-ink hover:bg-sand"
              >
                {item.label}
                <ChevronDown
                  aria-hidden="true"
                  className={`size-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                />
              </button>
              <div
                id={id}
                hidden={!expanded}
                className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-line bg-surface p-2 shadow-lg"
              >
                <ul>
                  {item.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        {...linkProps(link)}
                        className="block rounded-lg px-3 py-2 text-ink no-underline hover:bg-sand aria-[current=page]:bg-brand-tint"
                      >
                        <span className="block font-semibold">{link.label}</span>
                        {link.description && <span className="block text-sm text-muted">{link.description}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>

      <button
        ref={mobileButtonRef}
        type="button"
        aria-expanded={mobileOpen}
        aria-controls="mobile-menu"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border-2 border-ink px-3 font-semibold lg:hidden"
      >
        {mobileOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
        Menu
      </button>

      <div
        id="mobile-menu"
        hidden={!mobileOpen}
        className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-8rem)] overflow-y-auto border-b border-line bg-surface shadow-lg lg:hidden"
      >
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
          {items.map((item) =>
            isNavGroup(item) ? (
              <div key={item.label}>
                <p id={`${idFor(item.label)}-mobile`} className="text-sm font-semibold uppercase tracking-wider text-muted">
                  {item.label}
                </p>
                <ul aria-labelledby={`${idFor(item.label)}-mobile`} className="mt-2 space-y-1">
                  {item.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        {...linkProps(link)}
                        className="flex min-h-11 items-center rounded-lg px-3 font-semibold text-ink no-underline hover:bg-sand aria-[current=page]:bg-brand-tint"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <Link
                key={item.href}
                {...linkProps(item)}
                className="flex min-h-11 items-center rounded-lg px-3 font-semibold text-ink no-underline hover:bg-sand aria-[current=page]:bg-brand-tint"
              >
                {item.label}
              </Link>
            ),
          )}
        </div>
      </div>
    </nav>
  );
}
