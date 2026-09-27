import { cpSync, existsSync, rmSync } from "node:fs";

rmSync(".next/standalone/.next/static", { recursive: true, force: true });
cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });

if (existsSync("public")) {
  cpSync("public", ".next/standalone/public", { recursive: true });
}
