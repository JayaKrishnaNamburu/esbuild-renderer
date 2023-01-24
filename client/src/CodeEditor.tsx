import Editor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-textmate";
import "ace-builds/src-noconflict/theme-monokai";
import { store } from "./utils";
import { useEffect, useState } from "react";
import { Modal } from "./Modal";

export const CodeEditor = () => {
  const [files, setFiles] = useState(store.files.value);
  const [selectedFile, setSelectedFile] = useState<string>(store.fileId.value);

  useEffect(() => {
    const sub1 = store.files.subscribe((value) => setFiles(value));
    const sub2 = store.fileId.subscribe((value) => {
      setSelectedFile(value);
    });

    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
    };
  }, []);

  const deleteFile = (fileId: string) => {
    if (fileId === "index.js") {
      return;
    }
    const { [fileId]: _, ...newFiles } = files;
    store.files.next(newFiles);
  };

  const createFile = () => {
    store.app.value.modal.next(true);
  };

  const selectFile = (fileId: string) => {
    store.fileId.next(fileId);
  };

  const onChange = (ev: string) => {
    const newFiles = { ...files, [selectedFile]: ev };
    store.files.next(newFiles);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Modal />
        {Object.keys(files).map((fileId) => (
          <div
            key={fileId}
            onClick={() => selectFile(fileId)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              background: selectedFile === fileId ? "#2F3129" : "#eee",
              color: selectedFile === fileId ? "#fff" : "#000",
              width: "100px",
              padding: "4px",
              height: "25px",
              cursor: "pointer",
            }}
          >
            {fileId} <button onClick={() => deleteFile(fileId)}>x</button>
          </div>
        ))}
        <div>
          <button onClick={createFile}>New</button>
        </div>
      </div>

      <Editor
        style={{
          height: "calc(100vh - 25px)",
          width: "100%",
        }}
        placeholder="Placeholder Text"
        mode="javascript"
        theme="monokai"
        onChange={onChange}
        fontSize={14}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        value={files[selectedFile]}
        setOptions={{
          enableBasicAutocompletion: false,
          enableLiveAutocompletion: false,
          enableSnippets: false,
          showLineNumbers: true,
          tabSize: 2,
        }}
      />
    </div>
  );
};
