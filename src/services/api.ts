import axios from "axios";
import type { Repository } from "../types";
import { toast } from "react-toastify";

const API_BASE_URL = "https://api.github.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getPopularRepositories = async (
  page = 1,
  timePeriod = 30
): Promise<Repository[]> => {
  try {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - timePeriod);
    const dateString = pastDate.toISOString().split("T")[0]; // format: YYYY-MM-DD

    const response = await api.get("/search/repositories", {
      params: {
        q: `created:>${dateString}`,
        sort: "stars",
        order: "desc",
        per_page: 20,
        page: page,
      },
    });
    return response.data.items;
  } catch (error) {
    console.error("Error fetching repositories:", error);
    toast.error("Error fetching repositories.");
    throw error;
  }
};

export const fetchRepoStats = async (owner: string, repo: string) => {
  try {
    const commitActivityResponse = await api.get(
      `/repos/${owner}/${repo}/stats/commit_activity`
    );
    // Fetch code frequency data (additions/deletions per week)
    const codeFrequencyResponse = await api.get(
      `/repos/${owner}/${repo}/stats/code_frequency`
    );

    // Fetch contributor data
    const contributorsResponse = await api.get(
      `/repos/${owner}/${repo}/stats/contributors`
    );

    return {
      codeFrequency: codeFrequencyResponse.data,
      contributors: contributorsResponse.data,
      commitActivity: commitActivityResponse.data,
    };
  } catch (error) {
    console.error("Error fetching repository statistics:", error);
    toast.error("Error fetching repository statistics.");
    throw error;
  }
};

export default api;
