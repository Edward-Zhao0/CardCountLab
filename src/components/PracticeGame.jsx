// import "../styles/PracticeGame.css";
import { useState, useEffect } from "react";
import Card from "./Card.jsx";
import "../styles/PracticeGame.css";

const PracticeGame = ({ numberOfDecks, assistsEnabled }) => {
  const [deck, setDeck] = useState(shuffleDeck(generateDeck(numberOfDecks)));
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameStatus, setGameStatus] = useState("waiting"); // "waiting", "in-progress", "player-bust", "dealer-bust", "player-win", "dealer-win", "push"
  const [showStartButton, setShowStartButton] = useState(true);
  const [dealId, setDealId] = useState(0);
  const [dealerHoleHidden, setDealerHoleHidden] = useState(true);

  useEffect(() => {
    if (
      gameStatus === "player-bust" ||
      gameStatus === "dealer-bust" ||
      gameStatus === "player-win" ||
      gameStatus === "dealer-win" ||
      gameStatus === "push"
    ) {
      setShowStartButton(true);
    }
  }, [gameStatus]);

  useEffect(() => {
    if (calculateHandTotal(playerHand) > 21) setGameStatus("player-bust");
  }, [playerHand]);

  useEffect(() => {
    if (calculateHandTotal(dealerHand) > 21) setGameStatus("dealer-bust");
  }, [dealerHand]);

  function generateDeck(numDecks) {
    const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
    const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let deck = [];
    for (let i = 0; i < numDecks; i++) {
      for (let j = 0; j < suits.length; j++) {
        for (let k = 0; k < values.length; k++) {
          deck.push({ suit: suits[j], value: values[k] });
        }
      }
    }
    return deck;
  }

  function shuffleDeck(d) {
    for (let i = d.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [d[i], d[j]] = [d[j], d[i]];
    }
    return d;
  }

  function dealInitialHands(d) {
    if (d.length < 4) {
      setDeck(shuffleDeck(generateDeck(numberOfDecks)));
      return;
    }
    setPlayerHand([d[0], d[2]]);
    setDealerHand([d[1], d[3]]);
    setDeck(d.slice(4));
    setDealerHoleHidden(true);
    setDealId((p) => p + 1);
    setGameStatus("in-progress");
  }

  function dealPlayerHand(d, hand) {
    const card = d[0];
    const newHand = [...hand, card];
    setPlayerHand(newHand);
    setDeck(d.slice(1));
  }

  function dealDealerHand(d, hand) {
    const card = d[0];
    const newHand = [...hand, card];
    setDealerHand(newHand);
    setDeck(d.slice(1));
    if (calculateHandTotal(newHand) > 21) setGameStatus("player-bust");
  }

  const renderCard = (card, index) => (
    <Card key={`${card.value}-${card.suit}-${index}-${dealId}`} value={card.value} suit={card.suit} />
  );

  // Display like "8 / 18" for soft totals
  function handDisplay(hand) {
    if (!hand || hand.length === 0) return "";
    let total = 0, aces = 0;
    for (const c of hand) {
      const v = c.value;
      if (v === "A") { total += 11; aces++; }
      else if (v === "K" || v === "Q" || v === "J") total += 10;
      else total += Number(v);
    }
    let alt = null;
    if (aces > 0) alt = total - 10;
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return (alt !== null && alt > 0 && alt !== total) ? `${alt} / ${total}` : `${total}`;
  }

  function calculateHandTotal(hand) {
    let total = 0, aces = 0;
    for (const c of hand) {
      const v = c.value;
      if (v === "A") { total += 11; aces++; }
      else if (v === "K" || v === "Q" || v === "J") total += 10;
      else total += Number(v);
    }
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return total;
  }

  function hit() {
    if (gameStatus !== "in-progress") return;
    dealPlayerHand(deck, playerHand);
  }

  function stand() {
    if (gameStatus !== "in-progress") return;

    let newDeck = [...deck];
    let newDealerHand = [...dealerHand];

    while (calculateHandTotal(newDealerHand) < 17 && newDeck.length > 0) {
      const card = newDeck.shift();
      newDealerHand.push(card);
    }

    setDealerHand(newDealerHand);
    setDeck(newDeck);
    setDealerHoleHidden(false);

    const dealerTotal = calculateHandTotal(newDealerHand);
    const playerTotal = calculateHandTotal(playerHand);

    if (dealerTotal > 21) setGameStatus("dealer-bust");
    else if (dealerTotal > playerTotal) setGameStatus("dealer-win");
    else if (dealerTotal < playerTotal) setGameStatus("player-win");
    else setGameStatus("push");
  }

  return (
    <div className="game-screen">
      <p>Decks: {numberOfDecks}</p>
      <p>Assists: {assistsEnabled ? "Yes" : "No"}</p>

      {/* Ring Graphic */}
      <div className="board">
        <div className="ring" />

        {/* Dealer section */}
        <div className="dealer section">
          <div className="dealer-hand">
            {dealerHand.map((card, i) => (
              <Card
                key={`${card.value}-${card.suit}-${i}-${dealId}`}
                value={card.value}
                suit={card.suit}
                isFaceDown={i === 1 && dealerHoleHidden}
              />
            ))}
          </div>
          {dealerHand.length > 0 && (
            <div className="hand-pill dealer-pill">
              {dealerHoleHidden ? handDisplay([dealerHand[0]]) : handDisplay(dealerHand)}
            </div>
          )}
        </div>

        {/* Player section */}
        <div className="player section">
          <div className="player-hand">{playerHand.map(renderCard)}</div>
          {playerHand.length > 0 && (
            <div className="hand-pill player-pill">{handDisplay(playerHand)}</div>
          )}
        </div>

        {/* Button bar */}
        <div className="controls-bar">
          {!showStartButton ? (
            <>
              <button className="game-btn secondary" onClick={hit}>Hit</button>
              <button className="game-btn primary" onClick={stand}>Stand</button>
            </>
          ) : (
            <button
              className="game-btn primary"
              onClick={() => {
                setDealId((prev) => prev + 1);
                dealInitialHands(deck);
                setShowStartButton(false);
              }}
            >
              Deal
            </button>
          )}
        </div>
      </div>

      <div className="status">
        <p>{gameStatus}</p>
      </div>
    </div>
  );
};

export default PracticeGame;