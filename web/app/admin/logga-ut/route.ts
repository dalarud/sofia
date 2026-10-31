import { redirect } from "next/navigation";
import { logout } from "@/lib/auth";

export async function GET() {
  await logout();
  redirect("/admin/login");
}
