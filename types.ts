export enum UserRole {
  CITIZEN = "Ciudadano",
  GOVERNMENT = "Empleado de Gobierno",
  COMPANY = "Empresa",
  MILITARY = "Fuerzas Armadas",
  OTHER = "Otro"
}

export enum CrimeCategory {
  COMMON = "Delito Común",
  HIGH_IMPACT = "Alto Impacto",
  CORRUPTION = "Corrupción / Cuello Blanco"
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