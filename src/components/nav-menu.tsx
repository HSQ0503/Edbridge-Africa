"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { isNavGroup, type NavGroup, type NavItem, type NavLink } from "@/content/site";

function idFor(label: string) {
  return `nav-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
}

function groupContaining(items: NavItem[], pathname: string) {
  const group = items.find((item): item is NavGroup => isNavGroup(item) && item.links.some((link) => link.href === pathname));
  return group?.label ?? null;
}

// Wide screens get one row of menus that each open a two-column panel. Below that the menu is a short list of
// sections that expand one at a time, so a phone never has to scroll past every page to reach Contact.
export function NavMenu({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
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

  function toggleMobileMenu() {
    if (!mobileOpen) setMobileGroup(groupContaining(items, pathname));
    setMobileOpen(!mobileOpen);
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
      <ul className="hidden items-center gap-1 xl:flex">
        {items.map((item) => {
          if (!isNavGroup(item)) {
            return (
              <li key={item.href}>
                <Link
                  {...linkProps(item)}
                  className="inline-flex min-h-11 items-center whitespace-nowrap px-3 font-medium text-ink no-underline"
                >
                  <span className="nav-link">{item.label}</span>
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
                className="inline-flex min-h-11 cursor-pointer items-center gap-1 whitespace-nowrap px-3 font-medium text-ink"
              >
                <span className="nav-link">{item.label}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={`size-4 transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
                />
              </button>
              <div
                id={id}
                hidden={!expanded}
                className="absolute left-0 top-full z-50 mt-2 w-[36rem] rounded-xl border border-line bg-surface p-2 shadow-[0_12px_32px_rgb(26_26_23/0.12)]"
              >
                <ul className="grid grid-cols-2 gap-1">
                  {item.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        {...linkProps(link)}
                        className="block h-full rounded-lg px-3 py-2.5 text-ink no-underline hover:bg-sand aria-[current=page]:bg-brand-tint"
                      >
                        <span className="block font-medium">{link.label}</span>
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
        onClick={toggleMobileMenu}
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-ink/30 px-3 font-medium transition-colors duration-150 hover:border-ink xl:hidden"
      >
        {mobileOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
        Menu
      </button>

      <div
        id="mobile-menu"
        hidden={!mobileOpen}
        className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-8rem)] overflow-y-auto border-b border-line bg-surface shadow-[0_12px_32px_rgb(26_26_23/0.12)] xl:hidden"
      >
        <ul className="mx-auto max-w-6xl divide-y divide-line px-4 py-2 sm:px-6 lg:px-8">
          {items.map((item) => {
            if (!isNavGroup(item)) {
              return (
                <li key={item.href}>
                  <Link
                    {...linkProps(item)}
                    className="flex min-h-14 items-center text-lg font-medium text-ink no-underline aria-[current=page]:text-brand"
                  >
                    {item.label}
                  </Link>
                </li>
              );
            }

            const id = `${idFor(item.label)}-mobile`;
            const expanded = mobileGroup === item.label;
            return (
              <li key={item.label}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={id}
                  onClick={() => setMobileGroup(expanded ? null : item.label)}
                  className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 text-left text-lg font-medium text-ink"
                >
                  {item.label}
                  <ChevronDown
                    aria-hidden="true"
                    className={`size-5 shrink-0 transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
                <ul id={id} hidden={!expanded} className="grid gap-1 pb-4 sm:grid-cols-2">
                  {item.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        {...linkProps(link)}
                        className="flex min-h-11 items-center rounded-lg px-3 font-medium text-ink no-underline hover:bg-sand aria-[current=page]:bg-brand-tint"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
