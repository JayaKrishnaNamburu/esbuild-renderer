import path from "path";
import postcss from "postcss";
import autoprefixer from "autoprefixer";
import type { Plugin } from "esbuild-wasm";
import { Compiler } from ".";
import type { Loader } from "esbuild";

export function pluginVirtualFiles(this: Compiler): Plugin {
  const files = this.files;
  const loaderMap: Record<string, Loader> = {
    ".js": "tsx",
    ".jsx": "tsx",
    ".ts": "tsx",
    ".tsx": "tsx",
    ".css": "css",
    ".json": "json",
  };

  return {
    name: "virtual-entry",
    setup(build) {
      build.onResolve({ filter: /.*/ }, async (args) => {
        const directory = path.dirname(args.importer);
        try {
          const filePath = await files.isFileExists(
            path.resolve(directory, args.path)
          );
          return {
            path: filePath,
            namespace: "virtual-file",
          };
        } catch {
          /**
           * Any dep that can't be resolved from local file system
           */
          return args;
        }
      });

      build.onLoad(
        { filter: /\.css$/, namespace: "virtual-file" },
        async (args) => {
          const content = files.fs.readFileSync(args.path, "utf8");
          if (content) {
            const result = await postcss(autoprefixer).process(content, {
              from: undefined,
            });
            return {
              contents: result.css,
              loader: "css",
            };
          }

          return args;
        }
      );

      build.onLoad({ filter: /.*/, namespace: "virtual-file" }, (args) => {
        if (files.fs.existsSync(args.path)) {
          const contents = files.fs.readFileSync(args.path, "utf8");
          const ext = path.extname(args.path);
          return {
            loader: loaderMap[ext],
            contents,
          };
        }

        return args;
      });
    },
  };
}
