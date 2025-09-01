import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/home.jsx";
import PracticeMode from "./pages/practicemode.jsx";

const App = () => {
  return (
    <div>
      <header>
        <nav>
          <Link to="/" style={{ marginRight: "1rem" }}>Home</Link>
          <Link to="/practice">Practice Mode</Link>
        </nav>
      </header>

      <main style={{ padding: "1rem" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/practice" element={<PracticeMode />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;