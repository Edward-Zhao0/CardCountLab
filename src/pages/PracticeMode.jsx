import { useState } from "react";
import StartScreen from "../components/StartScreen";
import "../styles/PracticeMode.css";

const PracticeMode = () => {
  const [started, setStarted] = useState(false);

  // If game has not started, show StartScreen
  if (!started) {
    return (
      <div className="practice-container">
        {/* Pass function as prop. Child calls prop when button is pressed, and this function sets Started to true, rerendering the page. */}
        <StartScreen onStart={() => setStarted(true)} />
      </div>
    );
  }

  // If game has started, show Reset button
  return (
    <div className="practice-container">
      <button className="reset-button" onClick={() => setStarted(false)}>Reset</button>
      {/* later you can add your game screen here */}
    </div>
  );
};

export default PracticeMode;