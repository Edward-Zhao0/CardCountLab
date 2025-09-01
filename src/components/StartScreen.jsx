import "../styles/PracticeMode.css";

const StartScreen = ({onStart}) => {
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
            className="decks-input"
          />
        </label>

        <label>
          Difficulty:
          <select className="difficulty-select">
            <option value="noAssists">No Assists</option>
            <option value="assists">Assists</option>
          </select>
        </label>
      </form>

      <button className="start-button" type="button" onClick={onStart}>Start Practice</button>
    </div>
  );
};

export default StartScreen;