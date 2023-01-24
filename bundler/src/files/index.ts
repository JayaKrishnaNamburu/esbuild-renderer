import { fs as fileSystem, vol, IFs } from "memfs";
import EventEmitter from "events";
import path from "path";
import { ProjectInterfaces } from "../types";
import { provide } from "../utils";

@provide<ProjectInterfaces>("fileSystem")
export class FileSystem {
  private _fs: IFs;
  public watcher: EventEmitter;

  constructor() {
    const fsThis = this;
    this.watcher = new EventEmitter();
    this._fs = new Proxy(fileSystem, {
      get(target, propKey) {
        return function (...args: unknown[]) {
          const result = (target as any)[propKey]?.apply(fsThis, args);
          if (propKey === "writeFileSync" || propKey === "writeFile") {
            fsThis.watcher.emit("write", {
              path: args[0],
            });
          }
          return result;
        };
      },
    });
  }

  get fs() {
    return this._fs;
  }

  getFilesFromDir(folder: string): Record<string, string> {
    const files: Record<string, string> = {};
    const dirFiles = this.fs.readdirSync(folder) as string[];
    dirFiles.forEach((file: string) => {
      const content = this.fs.readFileSync(
        path.join(folder, file),
        "utf8"
      ) as string;
      files[file] = content;
    });
    return files;
  }

  addFiles(files: Record<string, string>) {
    vol.reset();
    vol.fromJSON(files);
  }

  async isFileExists(filePath: string): Promise<string> {
    if (path.extname(filePath)) {
      return new Promise((resolve, reject) => {
        this._fs.exists(filePath, (exists) => {
          if (exists) {
            return resolve(filePath);
          }
          return reject();
        });
      });
    }

    const exts = [".js", ".ts", ".jsx", ".tsx"];
    const promises: Promise<string>[] = exts.map(
      (ext) =>
        new Promise((resolve, reject) => {
          const pathToCheck = `${filePath}${ext}`;
          this._fs.exists(pathToCheck, (exists) => {
            if (exists) {
              return resolve(pathToCheck);
            }
            return reject();
          });
        })
    );
    return Promise.any(promises);
  }
}
