import { CodeEditor } from "./CodeEditor";
import { Preview } from "./Preview";
import { store } from "./utils";

const App = () => {
  return (
    <div className="layout">
      <CodeEditor />
      <Preview />
    </div>
  );
};

export default App;
