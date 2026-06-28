export type SeverityLevel = "Low" | "Medium" | "High" | "Critical";

export type IssueStatus = "Reported" | "In Progress" | "Resolved";

export interface CivicIssue {
  id: string;
  description: string;
  location: string;
  imageUrl?: string; // base64 encoded string or URL
  category: string;
  severity: SeverityLevel;
  summary: string;
  complaintLetter: string;
  status: IssueStatus;
  createdAt: string;
  mapX?: number; // percentage width on City Map (0 - 100)
  mapY?: number; // percentage height on City Map (0 - 100)
  lat?: number; // Real Map Latitude
  lng?: number; // Real Map Longitude
  reporterId?: string; // Optional user who reported this issue
  reporterName?: string; // Optional user name of who reported this issue
}

export interface AnalyzeResponse {
  category: string;
  severity: SeverityLevel;
  summary: string;
  complaintLetter: string;
  isMocked?: boolean;
}
