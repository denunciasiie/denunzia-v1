
import { ReportData } from "../types";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Saves a report to the backend API (PostgreSQL database).
 */
/**
 * Saves a report to the backend API (PostgreSQL database).
 * Supports both JSON (no files) and Multipart/Form-Data (with files/Pinata).
 */
export const saveReportToDB = async (report: ReportData, files: File[] = []): Promise<void> => {
  try {
    console.log('[DB] Sending report to API:', API_URL);
    console.log('[DB] Report ID:', report.id);

    let body: BodyInit;
    const headers: HeadersInit = {};

    if (files.length > 0) {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('payload', JSON.stringify(report));

      files.forEach(file => {
        formData.append('files', file);
      });

      body = formData;
      // Do NOT set Content-Type header for FormData, browser sets it with boundary
    } else {
      // Use standard JSON for metadata only
      body = JSON.stringify(report);
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}/api/reports`, {
      method: 'POST',
      headers: headers,
      body: body,
    });

    console.log('[DB] Response status:', response.status);
    console.log('[DB] Response ok:', response.ok);

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (jsonError) {
        // If JSON parsing fails, try to get text
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch (textError) {
          console.error('[DB] Could not parse error response');
        }
      }

      console.error('[DB] Server error:', errorMessage);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("[DB] Report saved successfully:", result.id);
  } catch (error) {
    console.error("[DB] Error saving report:", error);
    throw error;
  }
};

/**
 * Retrieves all reports from the backend API.
 */
export const getReportsFromDB = async (): Promise<ReportData[]> => {
  try {
    const response = await fetch(`${API_URL}/api/reports`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }

    const result = await response.json();
    return result.reports || [];
  } catch (error) {
    console.error("[DB] Error retrieving reports:", error);
    return [];
  }
};

/**
 * Updates the status or any field of a report.
 */
export const updateReportInDB = async (id: string, updates: Partial<ReportData>): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/api/reports/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update report');
    }

    console.log("[DB] Report updated successfully:", id);
  } catch (error) {
    console.error("[DB] Error updating report:", error);
    throw error;
  }
};

/**
 * Get a specific report by ID with decrypted data (admin only)
 */
export const getDecryptedReportById = async (id: string): Promise<any> => {
  try {
    console.log('[ADMIN] Fetching decrypted report:', id);

    const response = await fetch(`${API_URL}/api/reports/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Report not found');
      }
      throw new Error(`Failed to fetch report: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[ADMIN] Report fetched:', {
      id: result.report.id,
      hasDecryptedNarrative: !!result.report.decrypted_narrative,
      hasDecryptedEntities: !!result.report.decrypted_entities
    });

    return result.report;
  } catch (error) {
    console.error("[ADMIN] Error retrieving decrypted report:", error);
    throw error;
  }
};

/**
 * Delete all reports (admin only - for testing)
 */
export const deleteAllReports = async (): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/api/reports/cleanup`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete reports');
    }

    console.log("[ADMIN] All reports deleted successfully");
  } catch (error) {
    console.error("[ADMIN] Error deleting reports:", error);
    throw error;
  }
};


/**
 * Get a specific report by ID
 */
export const getReportById = async (id: string): Promise<ReportData | null> => {
  try {
    const response = await fetch(`${API_URL}/api/reports/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch report');
    }

    const result = await response.json();
    return result.report;
  } catch (error) {
    console.error("[DB] Error retrieving report:", error);
    return null;
  }
};

/**
 * Check API health
 */
export const checkAPIHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error("[DB] API health check failed:", error);
    return false;
  }
};

/**
 * Clears the database (for dev purposes) - NOT IMPLEMENTED ON SERVER
 */
export const clearDB = () => {
  console.warn("[DB] clearDB is not available when using API backend");
};
