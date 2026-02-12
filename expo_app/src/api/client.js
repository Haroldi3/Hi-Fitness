import axios from "axios";

export const API_BASE = "http://192.168.1.154:5000";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
});
