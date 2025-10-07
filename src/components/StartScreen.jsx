import "../styles/PracticeMode.css";

const StartScreen = ({
  onStart,
  numberOfDecks,
  setNumberOfDecks,
  assistsEnabled,
  setAssistsEnabled,
  playWithMoney,
  setPlayWithMoney,
  startingBankroll,
  setStartingBankroll,
}) => {
  return (
    <div className="start-screen">
      <div className="row">
        <label>Number of Decks</label>
        <input
          type="number"
          min="1"
          max="8"
          value={numberOfDecks}
          onChange={(e) => setNumberOfDecks(parseInt(e.target.value || "1", 10))}
        />
      </div>

      <div className="row">
        <label>Assists</label>
        <input
          type="checkbox"
          checked={assistsEnabled}
          onChange={(e) => setAssistsEnabled(e.target.checked)}
        />
      </div>

      <div className="row">
        <label>Play With Money</label>
        <input
          type="checkbox"
          checked={playWithMoney}
          onChange={(e) => setPlayWithMoney(e.target.checked)}
        />
      </div>

      {playWithMoney && (
        <div className="row">
          <label>Starting Bankroll ($)</label>
          <input
            type="number"
            min="1"
            step="1"
            value={startingBankroll}
            onChange={(e) =>
              setStartingBankroll(parseInt(e.target.value || "0", 10))
            }
          />
        </div>
      )}

      <button className="start-button" onClick={onStart}>
        Start
      </button>
    </div>
  );
};

export default StartScreen;