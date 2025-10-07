import { useState, useEffect, useRef } from "react";
import Card from "./Card.jsx";
import "../styles/PracticeGame.css";

const PracticeGame = ({ numberOfDecks, assistsEnabled, onHandComplete }) => {
  const [deck, setDeck] = useState(shuffleDeck(generateDeck(numberOfDecks)));
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameStatus, setGameStatus] = useState("waiting"); // "waiting", "in-progress", "player-bust", "dealer-bust", "player-win", "dealer-win", "push"
  const [showStartButton, setShowStartButton] = useState(true);
  const [dealId, setDealId] = useState(0);
  const [dealerHoleHidden, setDealerHoleHidden] = useState(true);
  const [runningCountValue, setRunningCountValue] = useState(0);

  const lastReportedRef = useRef({ dealId: -1 });
  useEffect(() => {
    const terminal = ["player-bust", "dealer-bust", "player-win", "dealer-win", "push"];
    if (!terminal.includes(gameStatus)) return;
    if (lastReportedRef.current.dealId === dealId) return;
    if (typeof onHandComplete === "function") onHandComplete(gameStatus);
    lastReportedRef.current = { dealId };
  }, [gameStatus, dealId, onHandComplete]);

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
    // Fisher-Yates shuffle
    // This works by iterating backwards through the array and swapping each element with a random earlier element (or itself).
    for (let i = d.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [d[i], d[j]] = [d[j], d[i]];
    }
    return d;
  }

  function dealInitialHands(d) {
    if (d.length < 4) {
      setDeck(shuffleDeck(generateDeck(numberOfDecks)));
      resetRunningCount();
      return;
    }
    setPlayerHand([d[0], d[2]]);
    setDealerHand([d[1], d[3]]);
    setDeck(d.slice(4));
    setDealerHoleHidden(true);
    setDealId((p) => p + 1); // increment deal id here (only here)
    setGameStatus("in-progress");

    // Count player cards + dealer upcard (not the hole card yet)
    updateRunningCount([d[0], d[2], d[1]]);
  }

  function dealPlayerHand(d, hand) {
    const card = d[0];
    const newHand = [...hand, card];
    setPlayerHand(newHand);
    setDeck(d.slice(1));
    updateRunningCount([card]);
  }

  function dealDealerHand(d, hand) {
    const card = d[0];
    const newHand = [...hand, card];
    setDealerHand(newHand);
    setDeck(d.slice(1));
    // FIX: dealer bust should set dealer-bust, not player-bust
    if (calculateHandTotal(newHand) > 21) setGameStatus("dealer-bust");
  }

  const renderCard = (card, index) => (
    <Card key={`${card.value}-${card.suit}-${index}-${dealId}`} value={card.value} suit={card.suit} />
  );

  // Display like "8 / 18" for soft totals
  function handDisplay(hand) {
    if (!hand || hand.length === 0) return "";
    let total = 0,
      aces = 0;
    for (const c of hand) {
      const v = c.value;
      if (v === "A") {
        total += 11;
        aces++;
      } else if (v === "K" || v === "Q" || v === "J") total += 10;
      else total += Number(v);
    }
    let alt = null;
    if (aces > 0) alt = total - 10;
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    return alt !== null && alt > 0 && alt !== total ? `${alt} / ${total}` : `${total}`;
  }

  function calculateHandTotal(hand) {
    let total = 0,
      aces = 0;
    for (const c of hand) {
      const v = c.value;
      if (v === "A") {
        total += 11;
        aces++;
      } else if (v === "K" || v === "Q" || v === "J") total += 10;
      else total += Number(v);
    }
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
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
      updateRunningCount([card]);
    }

    setDealerHand(newDealerHand);
    setDeck(newDeck);
    setDealerHoleHidden(false);

    // Reveal dealer hole card (index 1) to the count when standing
    if (newDealerHand[1]) updateRunningCount([newDealerHand[1]]);

    const dealerTotal = calculateHandTotal(newDealerHand);
    const playerTotal = calculateHandTotal(playerHand);

    if (dealerTotal > 21) setGameStatus("dealer-bust");
    else if (dealerTotal > playerTotal) setGameStatus("dealer-win");
    else if (dealerTotal < playerTotal) setGameStatus("player-win");
    else setGameStatus("push");
  }

  function numCardsLeft() {
    return deck.length;
  }

  function cardValueForCount(card) {
    const v = card.value;
    if (["2", "3", "4", "5", "6"].includes(v)) return 1;
    if (["10", "J", "Q", "K", "A"].includes(v)) return -1;
    return 0; // 7,8,9
  }

  function updateRunningCount(newCards) {
    let delta = 0;
    for (const c of newCards) delta += cardValueForCount(c);
    setRunningCountValue((prev) => prev + delta);
  }

  function resetRunningCount() {
    setRunningCountValue(0);
  }

  function runningCount() {
    return runningCountValue;
  }

  return (
    <div className="game-screen">
      <p>Decks: {numberOfDecks}</p>
      <p>Assists: {assistsEnabled ? "Yes" : "No"}</p>
      <p>Cards Left: {numCardsLeft()}</p>
      {assistsEnabled && <p>Running Count: {runningCount()}</p>}

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
              <button className="game-btn secondary" onClick={hit}>
                Hit
              </button>
              <button className="game-btn primary" onClick={stand}>
                Stand
              </button>
            </>
          ) : (
            <button
              className="game-btn primary"
              onClick={() => {
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