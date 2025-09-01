import { useState } from "react";
import StartScreen from "../components/StartScreen";
import "../styles/PracticeMode.css";
import PracticeGame from "../components/PracticeGame";

const PracticeMode = () => {
  const [started, setStarted] = useState(false);
  const [numberOfDecks, setNumberOfDecks] = useState(1);
  const [assistsEnabled, setAssistsEnabled] = useState(false);


  // If game has not started, show StartScreen
  if (!started) {
    return (
        <div className="practice-container">
            <StartScreen
            onStart={() => setStarted(true)}
            numberOfDecks={numberOfDecks}
            setNumberOfDecks={setNumberOfDecks}
            assistsEnabled={assistsEnabled}
            setAssistsEnabled={setAssistsEnabled}
            />
        </div>
    );
  }

  // If game has started, show Reset button
  return (
    <div className="practice-container">
      <button className="reset-button" onClick={() => setStarted(false)}>Reset</button>
      <PracticeGame numberOfDecks={numberOfDecks} assistsEnabled={assistsEnabled}/>
    </div>
  );
};

export default PracticeMode;