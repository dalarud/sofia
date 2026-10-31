import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { navCounts } from "@/lib/tasks";
import { Nav } from "@/admin/Nav";
import { logoSvg } from "@/admin/ui";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const c = await navCounts();
  const items = [
    { href: "/admin", label: "Idag" },
    { href: "/admin/kvitton", label: "Kvitton", count: c.kvitton },
    { href: "/admin/fakturor", label: "Fakturor" },
    { href: "/admin/ordrar", label: "Ordrar", count: c.ordrar },
    { href: "/admin/forfragningar", label: "Förfrågningar", count: c.forfragningar },
    { href: "/admin/hemsidan", label: "Hemsidan" },
    { href: "/admin/bokforing", label: "Bokföring" },
    { href: "/admin/installningar", label: "Inställningar" },
  ];
  return (
    <div className="a-shell">
      <Nav items={items} logo={logoSvg()} />
      <main className="a-main">{children}</main>
      <div className="a-quick"><Link className="a-btn a-btn--big" href="/admin/kvitton#ny">Fota kvitto</Link></div>
    </div>
  );
}
