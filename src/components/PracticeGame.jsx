// import "../styles/PracticeGame.css";

const PracticeGame = ({numberOfDecks, assistsEnabled}) => {
  return (
    <div className="game-screen">
        <p>Decks: {numberOfDecks}</p>
        <p>Assists: {assistsEnabled ? "Yes" : "No"}</p>
        <div className="dealer">
            <p>Dealer's Hand</p>
            <div className="hand">
                {/* Dealer's cards will go here */}
            </div>
        </div>

        <div className="player">
            <p>Your Hand</p>
            <div className="hand">
                {/* Player's cards will go here */}
            </div>
        </div>

        <div className="controls">
            <button className="hit-button">Hit</button>
            <button className="stand-button">Stand</button>
            <button className="deal-button">Deal</button>
        </div>

        <div className="status">
            <p>Status messages will go here</p>
        </div>
    </div>
  );
};

export default PracticeGame;