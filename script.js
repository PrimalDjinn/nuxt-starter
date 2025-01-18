#!/usr/bin/env node
import { execSync } from "child_process";

const args = new Set(process.argv)
if (args.has("migrate")) {
    execSync("npm drizzle-kit generate && npm drizzle-kit push")
} else if (args.has("introspect")) {
    execSync("npm drizzle-kit introspect")
} else {
    console.log("No arguments passed")
}
