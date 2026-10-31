"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; count?: number };

export function Nav({ items, logo }: { items: Item[]; logo: string }) {
  const path = usePathname();
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  return (
    <nav className="a-nav" aria-label="Meny">
      <Link href="/admin" className="a-nav__logo" aria-label="Studio Dalarud, till Idag" dangerouslySetInnerHTML={{ __html: logo }} />
      {items.map((i) => (
        <Link key={i.href} href={i.href} aria-current={active(i.href) ? "page" : undefined}>
          {i.label}
          {i.count ? <span className="a-nav__count">{i.count}</span> : null}
        </Link>
      ))}
      <span className="a-nav__spacer" />
      <a className="a-nav__small" href="/" target="_blank" rel="noopener">Visa hemsidan ↗</a>
      <Link className="a-nav__small" href="/admin/logga-ut" prefetch={false}>Logga ut</Link>
    </nav>
  );
}
