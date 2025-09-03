import "../styles/Card.css";


const Card = ({ value, suit }) => {
    const suitSymbols = {
      Hearts: "♥",
      Diamonds: "♦",
      Clubs: "♣",
      Spades: "♠",
    };
    const isRed = suit === "Hearts" || suit === "Diamonds";
  
    return (
      <div className="card" style={{ color: isRed ? "red" : "black" }}>
        <div className="corner top-left">
          <span>{value}</span>
        </div>
        <div className="center">{suitSymbols[suit]}</div>
        <div className="corner bottom-right">
          <span>{value}</span>
        </div>
      </div>
    );
  };
  
  export default Card;