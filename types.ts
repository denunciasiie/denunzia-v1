export enum UserRole {
  CITIZEN = "Ciudadano",
  GOVERNMENT = "Empleado de Gobierno",
  COMPANY = "Empresa",
  MILITARY = "Fuerzas Armadas",
  JOURNALISM = "Medios informativos (Periodismo)",
  OTHER = "Otro"
}

export enum CrimeCategory {
  LEVEL_1 = "Actos que causan la muerte o que tienen la intención de causar la muerte",
  LEVEL_2 = "Actos que causan daños o que tienen la intención de causar daños a las personas",
  LEVEL_3 = "Actos lesivos de naturaleza sexual",
  LEVEL_4 = "Actos contra la propiedad que entrañan violencia o amenaza de violencia contra las personas",
  LEVEL_5 = "Actos contra la propiedad solamente",
  LEVEL_6 = "Actos que conllevan el uso de sustancias psicoactivas u otras drogas",
  LEVEL_7 = "Actos que conllevan fraude, engaño o corrupción",
  LEVEL_8 = "Actos contra el orden público, la autoridad y las disposiciones del Estado",
  LEVEL_9 = "Actos contra la seguridad pública y la seguridad del Estado",
  LEVEL_10 = "Actos contra el entorno natural",
  LEVEL_11 = "Otros actos delictivos no clasificados en otra parte"
}

export enum CrimeType {
  // Common
  THEFT = "Robo / Asalto",
  VANDALISM = "Vandalismo",
  HARASSMENT = "Acoso",
  // High Impact
  KIDNAPPING = "Secuestro",
  HOMICIDE = "Homicidio",
  EXTORTION = "Extorsión",
  // Corruption
  FRAUD = "Fraude",
  EMBEZZLEMENT = "Malversación de Fondos",
  BRIBERY = "Soborno / Cohecho",
  INFLUENCE_PEDDLING = "Tráfico de Influencias",
  // Other
  OTHER = "Otro"
}

export interface DetailedAddress {
  street: string;
  zipCode: string;
  colony: string;
  references: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  details?: DetailedAddress;
}

export interface ReportData {
  id: string;
  isAnonymous: boolean;
  role: UserRole;
  category: CrimeCategory;
  type: CrimeType;
  customCrimeType?: string; // For when type is OTHER
  location: GeoLocation;
  timestamp: string;
  narrative: string;
  entities?: string; // Names, companies
  evidenceFiles: File[];
  trustScore?: number; // 0 to 1
  aiAnalysis?: string;

  // Encrypted payload fields (for backend API)
  encryptedData?: string;
  encryptedKey?: string;
  iv?: string;
  algorithm?: string;
}

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  intensity: number; // For heatmap
  category: CrimeCategory;
  trustScore: number;
}