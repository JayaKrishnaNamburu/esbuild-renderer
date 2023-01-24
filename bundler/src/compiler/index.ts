import esbuild from "esbuild-wasm";
import type { Plugin } from "esbuild-wasm";
import { pluginVirtualFiles } from "./virtual-files";
import debounce from "lodash.debounce";
import { provide, inject } from "../utils";
import { ProjectInterfaces } from "../types";
import { pluginJSPM } from "./plugin-jspm";
import { IImportMap } from "@jspm/import-map";
import stylePlugin from "esbuild-style-plugin";

@provide<ProjectInterfaces>("compiler")
export class Compiler {
  @inject<ProjectInterfaces>("fileSystem")
  protected files!: ProjectInterfaces["fileSystem"];

  private bundler: esbuild.BuildContext | null = null;
  private pluginVirtualFiles: () => Plugin;
  private pluginJSPM: (inputMap?: IImportMap) => Promise<Plugin>;
  protected importMap: IImportMap | null = null;

  constructor() {
    // @ts-ignore
    this.run = debounce(this.run, 500);
    this.pluginVirtualFiles = pluginVirtualFiles.bind(this);
    this.pluginJSPM = pluginJSPM.bind(this, {
      ...(this.importMap && { inputMap: this.importMap }),
      downloadDeps: false,
      resolutions: {
        react: "^17.0.2",
        "react-dom": "^17.0.2",
        "react-router": "^5.2.1",
        "react-router-dom": "^5.2.1",
      },
    });
  }

  async startBundler(entry: string) {
    if (!this.bundler) {
      await esbuild.initialize({
        wasmURL: "./node_modules/esbuild-wasm/esbuild.wasm",
      });
      if (this.files.fs.existsSync("build/")) {
        this.files.fs.rmdirSync("build");
      }
      this.files.fs.mkdirSync("build");
      this.bundler = await esbuild.context({
        entryPoints: [entry],
        plugins: [await this.pluginJSPM(), this.pluginVirtualFiles()],
        outdir: "build",
        bundle: true,
        write: false,
        platform: "browser",
        splitting: true,
        format: "esm",
      });
    }
  }

  async build() {
    if (!this.bundler) {
      throw new Error("Please inialize build");
    }

    console.log(`[COMPILER]: Bundling project`);
    const { outputFiles } = await this.bundler.rebuild();

    console.log(`[COMPILER]: Writing files`);
    outputFiles?.forEach((file) => {
      this.files.fs.writeFileSync(file.path, file.text);
    });
  }

  async run() {
    const files = this.files.getFilesFromDir("/build");
    const styleTag = document.createElement("style");
    styleTag.innerHTML = files["index.css"];
    document.head.appendChild(styleTag);

    import(
      /* @vite-ignore */
      URL.createObjectURL(
        new Blob([files["index.js"]], { type: "text/javascript" })
      )
    ).catch((err) => {
      console.log(err);
    });
  }
}
