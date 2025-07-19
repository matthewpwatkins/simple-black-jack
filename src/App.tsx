
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
    return values.join(' | ');
  }
  return (values[0] ?? getBestHandValue(hand)).toString();
}



// Dealer points: show possible values for upcard Ace, otherwise '?', only show real value when revealed
function formatDealerPoints(hand: Card[], revealAll: boolean): string {
  if (!revealAll) {
    if (hand.length > 0 && hand[0].rank === 'A') {
      return '1 | 11';
    }
    return '?';
  }
  return getBestHandValue(hand).toString();
}


function getResultText(state: GameState): { text: string; className: string } {
  // Always set a className so the color is always applied
  if (!state.gameOver || !state.winner) return { text: '', className: 'result-tie' };
  if (state.winner === 'player') return { text: 'You win!', className: 'result-win' };
  if (state.winner === 'dealer') return { text: 'Dealer wins!', className: 'result-lose' };
  return { text: "It's a tie!", className: 'result-tie' };
}

const App: React.FC = () => {
  const [game, setGame] = useState<GameState>(() => newGameState());

  const handleHit = () => setGame(g => playerHit(g));
  const handleHold = () => setGame(g => playerHold(g));
  const handleReset = () => setGame(() => resetGame());

  const playerPoints = formatPlayerPoints(game.playerHand, game.playerStands);
  const dealerRevealed = game.playerStands || game.gameOver;
  const dealerPoints = formatDealerPoints(game.dealerHand, dealerRevealed);
  const playerBusted = isBust(game.playerHand);
  const dealerBusted = isBust(game.dealerHand);
  const result = getResultText(game);

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
            {dealerRevealed ? (
              <div className="points">Points: {dealerPoints}{dealerBusted ? ' (BUST)' : ''}</div>
            ) : (
              <div className="points">Points: ?</div>
            )}
          </div>
        </div>
        <div className="actions">
          {!game.gameOver && !game.playerStands && !playerBusted && (
            <button onClick={handleHit} disabled={getBestHandValue(game.playerHand) >= 21}>Hit</button>
          )}
          {!game.gameOver && !game.playerStands && (
            <button onClick={handleHold}>Hold</button>
          )}
          <button onClick={handleReset}>New Game</button>
        </div>
        <div className="result">
          <h2 className={result.className}>{result.text}</h2>
        </div>
      </div>
    </div>
  );
};

export default App;
