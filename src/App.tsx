
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Card as BsCard, Button, Stack } from 'react-bootstrap';
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



function CardElem({ card, hidden }: { card: Card; hidden?: boolean }) {
  if (hidden) {
    return (
      <BsCard className="bg-secondary text-white text-center border-0 mx-1 d-inline-flex align-items-center justify-content-center" style={{width: '2.5rem', height: '3.5rem', fontSize: '1.5rem'}}>
        🂠
      </BsCard>
    );
  }
  const isRed = card.suit === '♥' || card.suit === '♦';
  return (
    <BsCard className={`text-center mx-1 d-inline-flex align-items-center justify-content-center ${isRed ? 'text-danger' : 'text-dark'}`}
      style={{width: '2.5rem', height: '3.5rem', fontSize: '1.5rem', background: '#fff'}}>
      {card.rank}{card.suit}
    </BsCard>
  );
}

function HandElem({ hand, revealAll }: { hand: Card[]; revealAll: boolean }) {
  if (!revealAll && hand.length > 0) {
    return (
      <Stack direction="horizontal" gap={1} className="mb-2">
        <CardElem card={hand[0]} />
        {hand.slice(1).map((_, i) => (
          <CardElem key={i + 1} card={hand[i + 1]} hidden />
        ))}
      </Stack>
    );
  }
  return (
    <Stack direction="horizontal" gap={1} className="mb-2">
      {hand.map((card, i) => <CardElem key={i} card={card} />)}
    </Stack>
  );
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
    <Container className="py-3">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <Row className="mb-4">
            <Col xs={12} md={6} className="mb-3 mb-md-0">
              <BsCard className="shadow-sm p-3 h-100">
                <BsCard.Title as="h2" className="h5">Dealer</BsCard.Title>
                <HandElem hand={game.dealerHand} revealAll={dealerRevealed} />
                {dealerRevealed ? (
                  <div className="points">Points: {dealerPoints}{dealerBusted ? ' (BUST)' : ''}</div>
                ) : (
                  <div className="points">Points: ?</div>
                )}
              </BsCard>
            </Col>
            <Col xs={12} md={6}>
              <BsCard className="shadow-sm p-3 h-100">
                <BsCard.Title as="h2" className="h5">Player</BsCard.Title>
                <HandElem hand={game.playerHand} revealAll={true} />
                <div className="points">Points: {playerPoints}{playerBusted ? ' (BUST)' : ''}</div>
                <Stack direction="horizontal" gap={2} className="mt-3">
                  {!game.gameOver && !game.playerStands && !playerBusted && (
                    <Button variant="info" className="w-100" onClick={handleHit} disabled={getBestHandValue(game.playerHand) >= 21}>Hit</Button>
                  )}
                  {!game.gameOver && !game.playerStands && (
                    <Button variant="primary" className="w-100" onClick={handleHold}>Hold</Button>
                  )}
                </Stack>
                {/* New Game button moved below the player hand panel */}
              </BsCard>
            </Col>
          </Row>
          <div className="d-flex justify-content-center mb-3">
            <Button variant="success" className="w-100" style={{maxWidth: 400}} onClick={handleReset}>New Game</Button>
          </div>
          <div className="result text-center">
            <h2 className={result.className}>{result.text}</h2>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default App;
