import axios from 'axios';
import { Repository } from '../types';
import {toast} from 'react-toastify';

const getLast30DaysDate = () => {
  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - 30);
  return pastDate.toISOString().split('T')[0]; // format: YYYY-MM-DD
};

const createdAfter = getLast30DaysDate();

// GitHub API base URL
const API_BASE_URL = `https://api.github.com/search/repositories?q=created:>${createdAfter}&sort=stars&order=desc`;

// Create axios instance with common config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get most popular repositories
export const getPopularRepositories = async (): Promise<Repository[]> => {
  try {
    const response = await api.get('/search/repositories', {
      params: {
        q: 'stars:>1000',
        sort: 'stars',
        order: 'desc',
        per_page: 20,
      },
    });
    console.log(response);
    return response.data.items;
  } catch (error) {
    console.error('Error fetching repositories:', error);
    toast.error('Error fetching repositories.');
    return [];
  }
};

export default api;