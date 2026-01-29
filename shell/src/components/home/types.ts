export interface ShowcaseMessage {
  type: string;
  timestamp?: string;
  payload?: {
    accent?: string;
    density?: string;
    motion?: string;
    counter?: number;
  };
}

export interface ShowcaseSettings {
  accent?: string;
  density?: string;
  motion?: string;
  counter?: number;
}

export interface DensityStyles {
  padding: string;
  gap: string;
  fontSize: string;
  sectionMargin: string;
  statusPadding: string;
  statusFontSize: string;
  h1FontSize: string;
  h2FontSize: string;
}
