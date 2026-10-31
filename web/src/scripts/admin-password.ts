// Skapar hashen till ADMIN_PASSWORD_HASH. Kör: npm run admin:password
import readline from "node:readline";
import { hashPassword } from "../lib/auth";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("Välj ett lösenord (minst 12 tecken): ", (pw) => {
  rl.close();
  if (pw.length < 12) { console.error("Lösenordet måste vara minst 12 tecken."); process.exit(1); }
  console.log("\nLägg in den här raden som miljövariabel (i .env och hos Vercel):\n");
  console.log(`ADMIN_PASSWORD_HASH=${hashPassword(pw)}\n`);
});
