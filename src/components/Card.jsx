import "../styles/Card.css";

const Card = ({ value, suit, isFaceDown }) => {
  const suitSymbols = {
    Hearts: "♥",
    Diamonds: "♦",
    Clubs: "♣",
    Spades: "♠",
  };
  const isRed = suit === "Hearts" || suit === "Diamonds";

  return (
    <div className="card">
      <div className={`card-inner ${isFaceDown ? "face-down" : "face-up"}`}>
        {/* Front */}
        <div
          className="card-face front"
          style={{ color: isRed ? "red" : "black" }}
        >
          <div className="corner top-left">
            <span>{value}</span>
          </div>
          <div className="center">{suitSymbols[suit]}</div>
          <div className="corner bottom-right">
            <span>{value}</span>
          </div>
        </div>

        {/* Back */}
        <div className="card-face back" />
      </div>
    </div>
  );
};

export default Card;