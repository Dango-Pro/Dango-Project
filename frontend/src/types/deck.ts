export type AlgorithmType = 'SM2' | 'FSRS' | 'HALF_LIFE_REGRESSION' | 'LEITNER_SYSTEM' | 'SPRINT';

export interface Deck {
  id: number;
  name: string;
  description: string;
  templateId?: number;
  templateName?: string;
  fieldNames?: string[];
  ownerId?: number;
  isPublic?: boolean;
  algorithmType?: AlgorithmType;
}
