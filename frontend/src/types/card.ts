export interface Card {
  id: number;
  content: Record<string, string>;
  isMemorized: boolean;
  deckId?: number;
  fields?: string[];
  nextReview?: string;
  status?: string;
  templateFieldNames?: string[];
  // Legacy support for older components (if any still use it)
  term?: string;
  meaning?: string;
}
