import "./App.css";
import { Repl } from "@electric-sql/pglite-repl";
import { usePGlite } from "./db/context.tsx";

const App = () => {
  const db = usePGlite();

  return (
    <div className="content">
      <h1>Rsbuild with React</h1>
      <p>Start building amazing things with Rsbuild.</p>
      <Repl pg={db} />
    </div>
  );
};

export default App;
