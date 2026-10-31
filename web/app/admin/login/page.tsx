import { redirect } from "next/navigation";
import { isAdmin, login } from "@/lib/auth";
import { logoSvg, one, type SP } from "@/admin/ui";

export const dynamic = "force-dynamic";

async function doLogin(form: FormData) {
  "use server";
  const error = await login(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
  if (error) redirect(`/admin/login?fel=${encodeURIComponent(error)}`);
  redirect("/admin");
}

export default async function LoginPage({ searchParams }: { searchParams: SP }) {
  if (await isAdmin()) redirect("/admin");
  const fel = one((await searchParams).fel);
  return (
    <div className="login">
      <form className="a-card" action={doLogin}>
        <span style={{ display: "block", width: "11rem" }} dangerouslySetInnerHTML={{ __html: logoSvg() }} />
        <h1 style={{ fontSize: "2rem" }}>Välkommen <em>tillbaka.</em></h1>
        {fel ? <p className="a-banner a-banner--warn" role="alert">{fel}</p> : null}
        <label className="a-field"><span>E-post</span><input name="email" type="email" autoComplete="username" required /></label>
        <label className="a-field"><span>Lösenord</span><input name="password" type="password" autoComplete="current-password" required /></label>
        <button className="a-btn a-btn--big" type="submit">Logga in</button>
      </form>
    </div>
  );
}
