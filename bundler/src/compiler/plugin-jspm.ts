import { Plugin } from "esbuild-wasm";
import { IImportMap } from "@jspm/import-map";
import { Compiler } from ".";
import { fetch, Generator } from "@jspm/generator";

const PACKAGE_NAME =
  /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*\/?[a-z0-9-~][a-z-._~]*$/;

export async function pluginJSPM(
  this: Compiler,
  params: {
    inputMap?: IImportMap;
    downloadDeps?: boolean;
    resolutions?: Record<string, string>;
  }
): Promise<Plugin> {
  const { inputMap, downloadDeps, resolutions } = params;
  const installCache: Promise<void | {
    staticDeps: string[];
    dynamicDeps: string[];
  }>[] = [];

  const generator = new Generator({
    ...(inputMap && { inputMap }),
    ...(resolutions && { resolutions }),
  });
  if (inputMap) {
    await generator.reinstall();
  }

  return {
    name: "jspm-imports",
    setup(build) {
      build.onResolve(
        {
          filter: PACKAGE_NAME,
        },
        async (args) => {
          const { path, importer } = args;
          try {
            const url = generator.resolve(path, importer);
            if (downloadDeps) {
              return {
                path: url,
                external: false,
                namespace: "http-url",
              };
            }
            return {
              path: args.path,
              external: true,
            };
          } catch (error) {
            if (downloadDeps) {
              await generator.install(path);
              const url = generator.resolve(path, importer);
              return {
                path: url,
                external: false,
                namespace: "http-url",
              };
            }

            installCache.push(generator.install(path));
            return {
              path: args.path,
              external: true,
            };
          }
        }
      );

      build.onResolve({ filter: /.*/, namespace: "http-url" }, async (args) => {
        if (args.path.startsWith(".") && args.importer.startsWith("http")) {
          const url = new URL(args.path, args.importer).toString();
          return {
            path: url,
            namespace: "http-url",
          };
        }

        const url = generator.resolve(args.path, args.importer);
        if (downloadDeps && url) {
          return {
            path: url,
            external: false,
            namespace: "http-url",
          };
        }

        return args;
      });

      build.onLoad({ filter: /.*/, namespace: "http-url" }, async (args) => {
        const contents = await (await fetch(args.path)).text();
        return {
          contents,
        };
      });

      build.onEnd(async ({ outputFiles = [] }) => {
        if (installCache.length) {
          await Promise.all(installCache).catch((err) => {
            console.log(`[Plugin-JSPN]: Failed to install`);
            console.error(err);
          });
        }
        const map = JSON.stringify(generator.getMap(), null, 2);
        if (map && !downloadDeps) {
          const buf = new ArrayBuffer(map.length * 2);
          const bufView = new Uint8Array(buf);
          for (let i = 0; i <= map.length; i++) {
            bufView[i] = map.charCodeAt(i);
          }

          outputFiles.push({
            path: "/build/importmap.json",
            text: map,
            contents: bufView,
          });
        }
      });
    },
  };
}
