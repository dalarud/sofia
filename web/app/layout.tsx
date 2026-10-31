import type { Metadata } from "next";

export const metadata: Metadata = { title: "Studio Dalarud", robots: { index: false } };

// Rotlayout för administrationssidan. Den publika hemsidan renderas av route-handlers med egen HTML.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  );
}
