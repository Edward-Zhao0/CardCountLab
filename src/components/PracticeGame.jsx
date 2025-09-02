// import "../styles/PracticeGame.css";
import { useState } from "react";

const PracticeGame = ({numberOfDecks, assistsEnabled}) => {
    const [deck, setDeck] = useState(shuffleDeck(generateDeck(numberOfDecks)));
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [gameStatus, setGameStatus] = useState("waiting"); // "waiting", "in-progress", "player-bust", "dealer-bust", "player-win", "dealer-win", "push"
    const [showStartButton, setShowStartButton] = useState(true);



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
    }

    function renderCard(card, index) {
        return (
            <div key={index} className="card">
                <p>{card.value} of {card.suit}</p>
            </div>
        );
    }

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


  return (
    <div className="game-screen">
        <p>Decks: {numberOfDecks}</p>
        <p>Assists: {assistsEnabled ? "Yes" : "No"}</p>
        <div className="dealer">
            <p>Dealer's Hand: </p>
            <div className="hand">
                {/* Map loops through every element in array and calls function */}
                {dealerHand.map(renderCard)}
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

        <div className="controls">
            <button className="hit-button">Hit</button>
            <button className="stand-button">Stand</button>
            <button className="deal-button">Deal</button>
            <br />
            {/* If true, show, if not, hide */}
            {showStartButton && <button className="start-button2" onClick={() => {dealInitialHands(deck); setShowStartButton(false)}}>Start Game</button> }
        </div>

        <div className="status">
            <p>{gameStatus}</p>
        </div>
    </div>
  );
};

export default PracticeGame;