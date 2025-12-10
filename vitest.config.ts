import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: { "@": path.resolve(__dirname, "src") },
	},
	test: {
		environment: "jsdom",
		include: ["tests/unit/**/*.spec.ts", "tests/unit/**/*.spec.tsx"],
		setupFiles: ["./src/setupTests.ts"],
		css: true,
		globals: true,
	},
});
