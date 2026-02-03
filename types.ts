
export interface DailyEntry {
  id: string;
  date: string; // ISO format
  content: string;
  mood: string;
  stickers: string[];
  imageUrl?: string;
  aiEditorial?: string;
}

export enum ViewMode {
  COVER = 'COVER',
  CALENDAR = 'CALENDAR',
  ENTRY = 'ENTRY'
}

export interface Sticker {
  id: string;
  emoji: string;
  name: string;
}
