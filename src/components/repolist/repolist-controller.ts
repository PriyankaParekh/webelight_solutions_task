import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { useSelector } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";
import { Repository, SortOption, SortOrder } from "../../types";
import {
  fetchRepositories,
  loadMoreRepositories,
  resetRepositories,
  setSortOption,
  setSortOrder,
  setTimePeriod,
} from "../../store/slice/reposlice";
import { SelectChangeEvent } from "@mui/material";
function RepolistController() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    repositories,
    loading,
    error,
    sortBy,
    sortOrder,
    hasMore,
    timePeriod,
  } = useSelector((state: RootState) => state.repositories);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastRepoElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || searchTerm?.trim() !== "") return; // <== ADD THIS CONDITION

      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0]?.isIntersecting && hasMore) {
          dispatch(loadMoreRepositories());
        }
      });

      if (node) observer?.current?.observe(node);
    },
    [loading, hasMore, dispatch, searchTerm]
  );

  useEffect(() => {
    dispatch(fetchRepositories());
  }, [dispatch, timePeriod]);

  useEffect(() => {
    if (repositories) {
      let filtered = [...repositories];

      if (searchTerm) {
        filtered = filtered?.filter(
          repo =>
            repo?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
            (repo?.description &&
              repo?.description
                ?.toLowerCase()
                ?.includes(searchTerm?.toLowerCase())) ||
            repo?.owner?.login
              ?.toLowerCase()
              ?.includes(searchTerm?.toLowerCase())
        );
      }

      filtered.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case "stars":
            comparison = a?.stargazers_count - b?.stargazers_count;
            break;
          case "issues":
            comparison = a?.open_issues_count - b?.open_issues_count;
            break;
          case "name":
            comparison = a?.name.localeCompare(b?.name);
            break;
          case "updated":
            comparison =
              new Date(a?.pushed_at)?.getTime() -
              new Date(b?.pushed_at)?.getTime();
            break;
          default:
            comparison = 0;
        }

        return sortOrder === "asc" ? comparison : -comparison;
      });

      setFilteredRepos(filtered);
    }
  }, [repositories, searchTerm, sortBy, sortOrder]);

  const handleSortChange = (event: SelectChangeEvent) => {
    dispatch(setSortOption(event.target.value as SortOption));
  };

  const handleOrderChange = (
    _: React.MouseEvent<HTMLElement>,
    newOrder: SortOrder
  ) => {
    if (newOrder !== null) {
      dispatch(setSortOrder(newOrder));
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleTimePeriodChange = (event: SelectChangeEvent) => {
    dispatch(setTimePeriod(Number(event.target.value)));
  };

  const handleRepoClick = (repo: Repository) => {
    window.open(repo.html_url, "_blank");
  };

  const handleRefresh = () => {
    dispatch(resetRepositories());
    dispatch(fetchRepositories());
  };

  return {
    error,
    handleRefresh,
    searchTerm,
    handleSearchChange,
    timePeriod,
    handleTimePeriodChange,
    sortBy,
    handleSortChange,
    sortOrder,
    handleOrderChange,
    filteredRepos,
    lastRepoElementRef,
    handleRepoClick,
    loading,
  };
}

export default RepolistController;
