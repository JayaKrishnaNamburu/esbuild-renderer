import type { Compiler } from "./compiler";
import type { FileSystem } from "./files";

export interface ProjectInterfaces {
  fileSystem: FileSystem;
  compiler: Compiler;
}
