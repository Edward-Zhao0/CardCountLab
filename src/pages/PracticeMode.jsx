import { useState, useCallback } from "react";
import StartScreen from "../components/StartScreen";
import "../styles/PracticeMode.css";
import PracticeGame from "../components/PracticeGame";
import PracticeMetrics from "../components/PracticeMetrics";

const PracticeMode = () => {
  const [started, setStarted] = useState(false);
  const [numberOfDecks, setNumberOfDecks] = useState(1);
  const [assistsEnabled, setAssistsEnabled] = useState(false);
  const [playWithMoney, setPlayWithMoney] = useState(false);
  const [startingBankroll, setStartingBankroll] = useState(1000);
  const [bankroll, setBankroll] = useState(1000);

  const [metricsOpen, setMetricsOpen] = useState(false);
  const [metrics, setMetrics] = useState({
    wins: 0,
    losses: 0,
    pushes: 0,
    results: [],
  });

  const resetPractice = () => {
    setStarted(false);
    setMetrics({ wins: 0, losses: 0, pushes: 0, results: [] });
    setMetricsOpen(false);
    setBankroll(startingBankroll);
  };

  const handleHandComplete = useCallback((status, wager = 0) => {
    let outcome = null;
    if (status === "player-win" || status === "dealer-bust") outcome = "W";
    else if (status === "dealer-win" || status === "player-bust") outcome = "L";
    else if (status === "push") outcome = "P";
    if (!outcome) return;

    setMetrics((prev) => {
      const wins = prev.wins + (outcome === "W" ? 1 : 0);
      const losses = prev.losses + (outcome === "L" ? 1 : 0);
      const pushes = prev.pushes + (outcome === "P" ? 1 : 0);
      return {
        wins,
        losses,
        pushes,
        results: [...prev.results, outcome],
      };
    });

    if (playWithMoney && wager > 0) {
      if (outcome === "W") setBankroll((b) => b + wager);
      if (outcome === "L") setBankroll((b) => Math.max(0, b - wager));
    }
  }, [playWithMoney]);

  if (!started) {
    return (
      <div className="practice-container">
        <StartScreen
          onStart={() => {
            setBankroll(startingBankroll);
            setStarted(true);
          }}
          numberOfDecks={numberOfDecks}
          setNumberOfDecks={setNumberOfDecks}
          assistsEnabled={assistsEnabled}
          setAssistsEnabled={setAssistsEnabled}
          playWithMoney={playWithMoney}
          setPlayWithMoney={setPlayWithMoney}
          startingBankroll={startingBankroll}
          setStartingBankroll={setStartingBankroll}
        />
      </div>
    );
  }

  return (
    <div className="practice-container">
      <div>
        <button className="reset-button" onClick={resetPractice}>Reset</button>
        <button className="metrics-button" onClick={() => setMetricsOpen(true)}>
          View Metrics
        </button>
      </div>

      {playWithMoney && (
        <div className="bankroll-display">Bankroll: ${bankroll}</div>
      )}

      <PracticeGame
        numberOfDecks={numberOfDecks}
        assistsEnabled={assistsEnabled}
        onHandComplete={handleHandComplete}
        playWithMoney={playWithMoney}
        bankroll={bankroll}
      />

      <PracticeMetrics
        isOpen={metricsOpen}
        onClose={() => setMetricsOpen(false)}
        metrics={metrics}
      />
    </div>
  );
};

export default PracticeMode;