import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";
// import basicSsl from "@vitejs/plugin-basic-ssl";
import svgr from "vite-plugin-svgr";
// import purgeCSSPlugin from "vite-plugin-purgecss";
// import { Plugin } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      // basicSsl({
      //   /** name of certification */
      //   name: "test",
      //   /** custom trust domains */
      //   domains: ["*.custom.com"],
      //   /** custom certification directory */
      //   certDir: "/Users/.../.devServer/cert",
      // }),
      react(),
      svgr({
        include: "**/*.svg?react",
        exclude: "",
      }),
      // purgeCSSPlugin({
      // 	content: ["./index.html", "./src/**/*.{tsx,ts,jsx,js}"],
      // 	safelist: {
      // 		standard: [
      // 			/^active/,
      // 			/^show/,
      // 			/^sidebar/, // Keep all sidebar-related classes
      // 			"sidebar--true",
      // 			"sidebar--false",
      // 			/^sidebar__/, // Keep all sidebar BEM classes
      // 		],
      // 		// You can also use deep and greedy if needed
      // 		deep: [/^sidebar/],
      // 		greedy: [/^sidebar.*--/], // Keep all sidebar modifier classes
      // 	},
      // }) as Plugin,
    ],
    server: {
      host: true,
      proxy: {
        "/aurora": {
          target: env.VITE_AURORA_ENDPOINT,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/aurora/, ""),
        },
        "/files": {
          target: env.VITE_AURORA_FILES || "https://pretest-aurora.rdfymir.com",
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(/^\/files/, "/backend/public/storage/patch-notes"),
        },
      },
    },
    assetsInclude: ["**/*.md", "**/*.txt"],
  };
});
