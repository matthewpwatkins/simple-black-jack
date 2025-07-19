// src/gameLogic.ts
// Core Blackjack game logic, separate from UI

export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export interface Card {
  suit: Suit;
  rank: Rank;
}

export type Hand = Card[];

export interface GameState {
  deck: Card[];
  playerHand: Hand;
  dealerHand: Hand;
  playerStands: boolean;
  gameOver: boolean;
  winner: 'player' | 'dealer' | 'tie' | null;
}

// Create a new shuffled deck
export function createDeck(): Card[] {
  const suits: Suit[] = ['♠', '♥', '♦', '♣'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Get all possible hand values (for Ace handling)
export function getHandValues(hand: Hand): number[] {
  let totals = [0];
  for (const card of hand) {
    let values: number[];
    if (card.rank === 'A') {
      values = [1, 11];
    } else if (['K', 'Q', 'J'].includes(card.rank)) {
      values = [10];
    } else {
      values = [parseInt(card.rank, 10)];
    }
    const newTotals: number[] = [];
    for (const t of totals) {
      for (const v of values) {
        newTotals.push(t + v);
      }
    }
    totals = newTotals;
  }
  // Remove duplicates
  return Array.from(new Set(totals)).sort((a, b) => a - b);
}

// Get best hand value <= 21, or lowest if all bust
export function getBestHandValue(hand: Hand): number {
  const values = getHandValues(hand).filter(v => v <= 21);
  if (values.length === 0) return Math.min(...getHandValues(hand));
  return Math.max(...values);
}

export function isBust(hand: Hand): boolean {
  return getHandValues(hand).every(v => v > 21);
}

export function initialDeal(deck: Card[]): { deck: Card[]; playerHand: Hand; dealerHand: Hand } {
  const playerHand = [deck[0], deck[2]];
  const dealerHand = [deck[1], deck[3]];
  const newDeck = deck.slice(4);
  return { deck: newDeck, playerHand, dealerHand };
}

export function dealCard(deck: Card[], hand: Hand): { deck: Card[]; hand: Hand } {
  return { deck: deck.slice(1), hand: [...hand, deck[0]] };
}

export function shouldDealerDraw(hand: Hand): boolean {
  return getBestHandValue(hand) < 17 && !isBust(hand);
}

export function determineWinner(playerHand: Hand, dealerHand: Hand): 'player' | 'dealer' | 'tie' {
  const playerValue = getBestHandValue(playerHand);
  const dealerValue = getBestHandValue(dealerHand);
  const playerBust = isBust(playerHand);
  const dealerBust = isBust(dealerHand);
  if (playerBust && dealerBust) return 'tie';
  if (playerBust) return 'dealer';
  if (dealerBust) return 'player';
  if (playerValue > dealerValue) return 'player';
  if (dealerValue > playerValue) return 'dealer';
  return 'tie';
}

export function newGameState(): GameState {
  const deck = createDeck();
  const { deck: d, playerHand, dealerHand } = initialDeal(deck);
  return {
    deck: d,
    playerHand,
    dealerHand,
    playerStands: false,
    gameOver: false,
    winner: null,
  };
}

export function resetGame(): GameState {
  return newGameState();
}

export function playerHit(state: GameState): GameState {
  if (state.gameOver || state.playerStands) return state;
  const { deck, hand } = dealCard(state.deck, state.playerHand);
  const playerBust = isBust(hand);
  let gameOver = playerBust;
  let winner: GameState['winner'] = null;
  if (playerBust) {
    // Dealer's turn after player busts
    let dealerHand = state.dealerHand;
    let d = deck;
    while (shouldDealerDraw(dealerHand)) {
      const dealt = dealCard(d, dealerHand);
      d = dealt.deck;
      dealerHand = dealt.hand;
    }
    winner = determineWinner(hand, dealerHand);
    return {
      ...state,
      deck: d,
      playerHand: hand,
      dealerHand,
      gameOver: true,
      winner,
      playerStands: true,
    };
  }
  return {
    ...state,
    deck,
    playerHand: hand,
    gameOver,
    winner,
  };
}

export function playerHold(state: GameState): GameState {
  if (state.gameOver || state.playerStands) return state;
  let dealerHand = state.dealerHand;
  let deck = state.deck;
  while (shouldDealerDraw(dealerHand)) {
    const dealt = dealCard(deck, dealerHand);
    deck = dealt.deck;
    dealerHand = dealt.hand;
  }
  const winner = determineWinner(state.playerHand, dealerHand);
  return {
    ...state,
    deck,
    dealerHand,
    playerStands: true,
    gameOver: true,
    winner,
  };
}
