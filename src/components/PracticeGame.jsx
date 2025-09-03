// import "../styles/PracticeGame.css";
import { useState } from "react";
import { useEffect } from "react";
import Card from "./Card.jsx";
import "../styles/PracticeGame.css";

const PracticeGame = ({numberOfDecks, assistsEnabled}) => {
    const [deck, setDeck] = useState(shuffleDeck(generateDeck(numberOfDecks)));
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [gameStatus, setGameStatus] = useState("waiting"); // "waiting", "in-progress", "player-bust", "dealer-bust", "player-win", "dealer-win", "push"
    const [showStartButton, setShowStartButton] = useState(true);
    const [dealId, setDealId] = useState(0); //This is used so that the animation does not restart for every time I press stand or press hit
    const [dealerHoleHidden, setDealerHoleHidden] = useState(true);

    useEffect(() => {
        if (gameStatus === "player-bust" || gameStatus === "dealer-bust" || gameStatus === "player-win" || gameStatus === "dealer-win" || gameStatus === "push") {
            setShowStartButton(true);
        }
    }, [gameStatus]);

    useEffect(() => {
        if (calculateHandTotal(playerHand) > 21) {
          setGameStatus("player-bust");
        }
    }, [playerHand]);

    useEffect(() => {
        if (calculateHandTotal(dealerHand) > 21) {
          setGameStatus("dealer-bust");
        }
    }, [dealerHand]);



    function generateDeck(numDecks) {
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const values = [
            'A', '2', '3', '4', '5', '6', '7', '8', '9', '10',
            'J', 'Q', 'K'
        ];
        let deck = [];
        for (let i = 0; i<numDecks; i++) {
            for (let j = 0; j < suits.length; j++) {
                for (let k = 0; k <values.length; k++) {
                    deck.push({suit: suits[j], value: values[k]});
                }
            }
        }
        return deck;
    }

    function shuffleDeck(deck) {
        //Use the Fisher-Yates shuffle algorithm
        for (let i = deck.length - 1; i > 0; i--) {
            //Random int 0 <= j <= i
            let j = Math.floor((Math.random() * (i+1)));
            //Swap cards
            let placeholder = deck[i];
            deck[i] = deck[j];
            deck[j] = placeholder;
        }
        return deck;
    }

    function dealInitialHands(deck) {
        if (deck.length < 4) {
            //Reshuffle if not enough cards
            setDeck(shuffleDeck(generateDeck(numberOfDecks)));
            return;
        }
        setPlayerHand([deck[0], deck[2]]);
        setDealerHand([deck[1], deck[3]]);
        setDeck(deck.slice(4));

        //Hide the card of the dealer 
        setDealerHoleHidden(true);
        setDealId(prev => prev + 1); //new deal = new id


        setGameStatus("in-progress");
    }

    function dealPlayerHand(deck, hand) {
        const card = deck[0];                
        const newHand = [...hand, card];     // make a new array with the old hand + new card
        const newDeck = deck.slice(1);       // make a new deck without the first card
      
        setPlayerHand(newHand);              // update player hand state
        setDeck(newDeck);                    // update deck state
    }

    function dealDealerHand(deck, hand) {
        const card = deck[0];                
        const newHand = [...hand, card];     // make a new array with the old hand + new card
        const newDeck = deck.slice(1);       // make a new deck without the first card
      
        setDealerHand(newHand);              // update dealer hand state
        setDeck(newDeck);                    // update deck state
        if (calculateHandTotal(newHand) > 21) {
            setGameStatus("player-bust");
        }
    }

    const renderCard = (card, index) => (
        <Card
          key={`${card.value}-${card.suit}-${index}-${dealId}`} 
          value={card.value}
          suit={card.suit}
        />
    );

    function calculateHandTotal(hand) {
        let total = 0;
        for (let i = 0; i < hand.length; i++) {
            if (hand[i].value === 'A') {
                if (total + 11 > 21) {
                    total += 1;
                }
                else {
                    total += 11;
                }
            }
            else if (hand[i].value === 'K' || hand[i].value === 'Q' || hand[i].value === 'J') {
                total += 10;
            }
            else{
                total += Number((hand[i].value));
            }
        }
        return total;
    }

    function checkForBusts() {
    }

    function hit() {
        if (gameStatus !== "in-progress") return; // Only allow hit if game is in progress
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
      
        //Reveal hole card
        setDealerHoleHidden(false);
      
        const dealerTotal = calculateHandTotal(newDealerHand);
        const playerTotal = calculateHandTotal(playerHand);
      
        if (dealerTotal > 21) {
          setGameStatus("dealer-bust");
        } else if (dealerTotal > playerTotal) {
          setGameStatus("dealer-win");
        } else if (dealerTotal < playerTotal) {
          setGameStatus("player-win");
        } else {
          setGameStatus("push");
        }
    }


  return (
    <div className="game-screen">
        <p>Decks: {numberOfDecks}</p>
        <p>Assists: {assistsEnabled ? "Yes" : "No"}</p>
        <div className="dealer">
            <p>Dealer's Hand: </p>
            <div className="dealer-hand">
                {dealerHand.map((card, i) => (
                    <Card
                    key={`${card.value}-${card.suit}-${i}-${dealId}`}
                    value={card.value}
                    suit={card.suit}
                    isFaceDown={i === 1 && dealerHoleHidden} // 🔑 hide only 2nd card if hole is hidden
                    />
                ))}
            </div>
        </div>

        <div className="player">
            <p>Your Hand: </p>
            <div className="player-hand">
                {/* Map loops through every element in array and calls function */}
                {playerHand.map(renderCard)}
            </div>
            <p>Total: {calculateHandTotal(playerHand)}</p>
        </div>
        {/*  */}
        <div className="controls">
            {!showStartButton && <button className="hit-button" onClick={() => hit()}>Hit</button>}
            {!showStartButton && <button className="stand-button" onClick={() => stand()}>Stand</button>}
            {!showStartButton && <br />}
            {/* If true, show, if not, hide */}
            {showStartButton && <button
                className="deal-button"
                onClick={() => {
                    setDealId(prev => prev + 1);   // 🔑 new deal = new id
                    dealInitialHands(deck);
                    setShowStartButton(false);
                }}
                >
                Deal Cards
                </button> }
        </div>

        <div className="status">
            <p>{gameStatus}</p>
        </div>
    </div>
  );
};

export default PracticeGame;