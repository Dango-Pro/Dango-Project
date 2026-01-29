export interface Card {
  id: number;
  term: string;
  meaning: string;
  isMemorized: boolean;
  deckId?: number;
}
