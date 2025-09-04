import { Routes, Route } from "react-router-dom";
import Home from "./pages/home.jsx";
import PracticeMode from "./pages/practicemode.jsx";
import Header from "./components/Header.jsx";
import "./App.css"; // add global styles

const App = () => {
  return (
    <div className="app-container">
      <header>
        <Header />
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/practice" element={<PracticeMode />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;