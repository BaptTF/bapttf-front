import createClient from 'openapi-fetch';
import type { paths } from './v1.d.ts'; // Le fichier qu'on vient de générer

// Remplace par l'URL de ton backend Go
const BACKEND_URL = 'http://localhost:8080'; 

export const api = createClient<paths>({
    baseUrl: BACKEND_URL,
});