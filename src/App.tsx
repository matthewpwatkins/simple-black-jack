
import React, { useState } from 'react';
import './App.css';
import {
  newGameState,
  resetGame,
  playerHit,
  playerHold,
  getHandValues,
  getBestHandValue,
  isBust,
  GameState,
  Card,
} from './gameLogic';

function formatHand(hand: Card[], revealAll = true): string {
  if (!revealAll && hand.length > 0) {
    return hand[0].rank + hand[0].suit + ' [hidden]';
  }
  return hand.map(card => card.rank + card.suit).join(' ');
}

function formatPlayerPoints(hand: Card[], playerStands: boolean): string {
  const values = getHandValues(hand).filter(v => v <= 21);
  if (playerStands) {
    return getBestHandValue(hand).toString();
  }
  if (values.length > 1) {
    return values.join(' / ');
  }
  return (values[0] ?? getBestHandValue(hand)).toString();
}

function formatDealerPoints(hand: Card[], revealAll: boolean): string {
  if (!revealAll) {
    // Only show first card value
    const first = hand[0];
    let v = 0;
    if (first.rank === 'A') v = 11;
    else if (['K', 'Q', 'J'].includes(first.rank)) v = 10;
    else v = parseInt(first.rank, 10);
    return v.toString() + ' + ?';
  }
  return getBestHandValue(hand).toString();
}

function getResultText(state: GameState): string {
  if (!state.gameOver || !state.winner) return '';
  if (state.winner === 'player') return 'You win!';
  if (state.winner === 'dealer') return 'Dealer wins!';
  return "It's a tie!";
}

const App: React.FC = () => {
  const [game, setGame] = useState<GameState>(() => newGameState());

  const handleHit = () => {
    setGame(g => playerHit(g));
  };

  const handleHold = () => {
    setGame(g => playerHold(g));
  };

  const handleReset = () => {
    setGame(() => resetGame());
  };

  const handlePlayAgain = () => {
    setGame(() => resetGame());
  };

  const playerPoints = formatPlayerPoints(game.playerHand, game.playerStands);
  const dealerRevealed = game.playerStands || game.gameOver;
  const dealerPoints = formatDealerPoints(game.dealerHand, dealerRevealed);
  const playerBusted = isBust(game.playerHand);
  const dealerBusted = isBust(game.dealerHand);

  return (
    <div className="App">
      <div className="game-area">
        <div className="hands">
          <div className="hand-block">
            <h2>Player</h2>
            <div className="cards">{formatHand(game.playerHand)}</div>
            <div className="points">Points: {playerPoints}{playerBusted ? ' (BUST)' : ''}</div>
          </div>
          <div className="hand-block">
            <h2>Dealer</h2>
            <div className="cards">{formatHand(game.dealerHand, dealerRevealed)}</div>
            <div className="points">Points: {dealerPoints}{dealerRevealed && dealerBusted ? ' (BUST)' : ''}</div>
          </div>
        </div>
        <div className="actions">
          {!game.gameOver && !game.playerStands && !playerBusted && (
            <button onClick={handleHit} disabled={getBestHandValue(game.playerHand) >= 21}>Hit</button>
          )}
          {!game.gameOver && !game.playerStands && (
            <button onClick={handleHold}>Hold</button>
          )}
          {!game.gameOver && (
            <button onClick={handleReset}>Reset</button>
          )}
          {game.gameOver && (
            <button onClick={handlePlayAgain}>Play Again</button>
          )}
        </div>
        <div className="result">
          <h2>{getResultText(game)}</h2>
        </div>
      </div>
    </div>
  );
};

export default App;
