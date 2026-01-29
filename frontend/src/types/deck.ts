export interface Deck {
  id: number;
  name: string;
  description: string;
  templateId?: number;
  templateName?: string;
  fieldNames?: string[];
}
