import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import glob from "glob";
import fs from "fs";

let pageEntry: any = {};

(function generateInput() {
  try {
    const allEntry = glob.sync("./src/views/**/*.{ts,js}");
    const temp = fs.readFileSync("./demo.html");
    if (!fs.existsSync("./templates")) {
      fs.mkdirSync("./templates");
    }
    allEntry.forEach((entry) => {
      console.log("file not exists, star over build ");
      const index = temp.toString().indexOf("</body>");
      let content = "";
      if (index !== -1) {
        content =
          temp.toString().slice(0, index) +
          `<script type="module" src=".${entry}"></script>` +
          temp.toString().slice(index);
      }
      const pad = entry.split("/");
      const name = pad[pad.length - 2];
      fs.writeFile(
        `./templates/${name}.html`,
        content,
        { flag: "w" },
        (err) => {}
      );
      const key = path.basename(name, ".html");
      const value = path.resolve(__dirname, `/templates/${name}.html`);
      pageEntry[key] = value;
    });
  } catch (e) {
    console.error(e);
  }
})();

export default defineConfig(({ command, mode }) => {
  if (command === "serve") {
    pageEntry.index = path.join(__dirname, "demo.html");
  }

  return {
    plugins: [vue()],
    build: {
      rollupOptions: {
        input: pageEntry,
      },
    },
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./"),
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      host: true,
      port: 3333,
    },
  };
});
