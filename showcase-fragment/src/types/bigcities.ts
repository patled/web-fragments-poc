/** Datum-Struktur der Weather-API */
export interface WeatherDate {
  year: number;
  month: number;
  day: number;
  dayOfWeek: number;
  dayOfYear: number;
  dayNumber: number;
}

/** Wetter-Daten pro Stadt */
export interface CityWeather {
  date: WeatherDate;
  temperatureC: number;
  temperatureF: number;
  summary: string;
  isAnomymous: boolean;
  authenticationSummary: string;
  lastUpdated: string;
}

/** Eintrag von GET /bigcities */
export interface BigCity {
  name: string;
  population: number;
  weather: CityWeather;
}
