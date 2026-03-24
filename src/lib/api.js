const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8000';

export const SENTIMENT_API_URL = `${API_ORIGIN}/api/sentiment`;
export const RAG_API_URL = `${API_ORIGIN}/api/rag`;
