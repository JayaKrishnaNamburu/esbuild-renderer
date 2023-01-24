import { Subject } from "subjecto";

export const store: {
  app: Subject<{
    swc: Subject<boolean>;
    modal: Subject<boolean>;
  }>;
  files: Subject<Record<string, string>>;
  fileId: Subject<string>;
} = {
  app: new Subject({ swc: new Subject(false), modal: new Subject(false) }),
  files: new Subject<Record<string, string>>({
    "index.html": `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Renderer</title>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
`,
    "index.js": `import React from 'react'
`,
  }),
  fileId: new Subject("index.js"),
};
