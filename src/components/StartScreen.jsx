import "../styles/PracticeMode.css";

const StartScreen = ({onStart,
    numberOfDecks,
    setNumberOfDecks,
    assistsEnabled,
    setAssistsEnabled,}) => {
  return (
    <div className="start-screen">
      <p className="welcome-text">Welcome to Practice Mode</p>

      <form className="practice-form">
        <label>
          Number of decks:
          <input 
            type="number" 
            min="1" 
            max="8" 
            defaultValue="1"
            value={numberOfDecks}
            onChange={(e) => setNumberOfDecks(Number(e.target.value))}
            className="decks-input"
          />
        </label>

        <label>
          Assists:
          <input 
            type="checkbox"
            checked={assistsEnabled}
            onChange={(e) => setAssistsEnabled(e.target.checked)}
          />
        </label>
      </form>

      <button className="start-button" type="button" onClick={() => onStart()}>Start Practice</button>
    </div>
  );
};

export default StartScreen;