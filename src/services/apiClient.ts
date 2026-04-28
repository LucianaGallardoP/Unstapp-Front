// src/services/apiClient.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://unstapp-api-staging.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});