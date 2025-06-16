import apiClient from "../services/api-client";

/**
 * מחזירה URL מלא לתמונה (אם מגיע רק נתיב יחסי), מבוסס על baseURL שמוגדר ב־apiClient
 * @param path - נתיב יחסי שמגיע מהשרת (למשל "/uploads/xyz.jpg")
 * @returns string - URL מלא
 */
export function getFullImageUrl(path?: string): string {
  if (!path) return "https://via.placeholder.com/150"; // fallback image

  // אם כבר URL מלא, להחזיר כמו שהוא
  if (path.startsWith("http")) return path;

  // משיגים את ה־baseURL מה־apiClient
  // לפעמים baseURL נגמר ב־'/', ננקה אם צריך
  let baseURL = apiClient.defaults.baseURL || "";
  if (baseURL.endsWith("/")) baseURL = baseURL.slice(0, -1);

  // מוודאים שנתיב יחסי תמיד מתחיל ב־'/', אחרת נוסיף אותו
  let relativePath = path.startsWith("/") ? path : `/${path}`;

  return `${baseURL}${relativePath}`;
}
