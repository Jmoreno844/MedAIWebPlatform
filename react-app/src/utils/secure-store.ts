import { AES, enc } from "crypto-js";

const STORAGE_KEY = "selectedEncuentro";
const SECRET_KEY = process.env.REACT_APP_STORAGE_SECRET || "your-secure-key";

export interface Encounter {
  id: number;
  id_paciente: number;
  identificador_paciente: string;
  created_at: string;
  timestamp?: number;
  // Add other keys as needed (e.g., id_paciente)
}

export const secureStore = {
  set: (encounter: Encounter) => {
    const data = { ...encounter, timestamp: Date.now() };
    const encrypted = AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
    localStorage.setItem(STORAGE_KEY, encrypted);
  },

  get: (): Encounter | null => {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) return null;
    try {
      const decrypted = AES.decrypt(encrypted, SECRET_KEY).toString(enc.Utf8);
      const data: Encounter = JSON.parse(decrypted);
      // Example: expire after 1 hour
      if (Date.now() - (data.timestamp || 0) > 3600000) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return data;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  },

  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
  },
};
