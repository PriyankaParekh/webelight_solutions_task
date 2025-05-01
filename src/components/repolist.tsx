import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider,
  CircularProgress,
  Alert,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import {
  Search as SearchIcon,
  ImportExport as ImportExportIcon,
  FilterList as FilterListIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { RootState } from "../store";
import {
  fetchRepositories,
  setSortOption,
  setSortOrder,
} from "../store/slice/reposlice";
import { Repository, SortOption, SortOrder } from "../types";
import RepoCard from "./repocard";
import { AppDispatch } from "../store";

// Define time period options for filtering
type TimePeriod = "all" | "1week" | "2weeks" | "1month";

const RepoList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { repositories, loading, error, sortBy, sortOrder } = useSelector(
    (state: RootState) => state.repositories
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all");

  useEffect(() => {
    dispatch(fetchRepositories());
  }, [dispatch]);

  useEffect(() => {
    if (repositories) {
      let filtered = [...repositories];

      if (searchTerm) {
        filtered = filtered.filter(
          repo =>
            repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (repo.description &&
              repo.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) ||
            repo.owner.login.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filter by time period
      if (timePeriod !== "all") {
        const now = new Date();
        let timeThreshold = new Date();

        switch (timePeriod) {
          case "1week":
            timeThreshold.setDate(now.getDate() - 7); // 1 week ago
            break;
          case "2weeks":
            timeThreshold.setDate(now.getDate() - 14); // 2 weeks ago
            break;
          case "1month":
            timeThreshold.setMonth(now.getMonth() - 1); // 1 month ago
            break;
          default:
          // No filter
        }

        filtered = filtered.filter(repo => {
          const repoUpdateTime = new Date(repo.pushed_at);
          return repoUpdateTime >= timeThreshold;
        });
      }

      filtered.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case "stars":
            comparison = a.stargazers_count - b.stargazers_count;
            break;
          case "issues":
            comparison = a.open_issues_count - b.open_issues_count;
            break;
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "updated":
            comparison =
              new Date(a.pushed_at).getTime() - new Date(b.pushed_at).getTime();
            break;
          default:
            comparison = 0;
        }

        return sortOrder === "asc" ? comparison : -comparison;
      });

      setFilteredRepos(filtered);
    }
  }, [repositories, searchTerm, sortBy, sortOrder, timePeriod]);

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
    setTimePeriod(event.target.value as TimePeriod);
  };

  const handleRepoClick = (repo: Repository) => {
    window.open(repo.html_url, "_blank");
  };

  const handleRefresh = () => {
    dispatch(fetchRepositories());
  };

  if (error) {
    return (
      <Alert
        severity="error"
        sx={{ mt: 2 }}
        action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: "100%", mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          mb: 3,
          gap: 2,
        }}
      >
        <TextField
          label="Search repositories"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, maxWidth: { sm: "50%" } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="time-period-label">Time Period</InputLabel>
            <Select
              labelId="time-period-label"
              value={timePeriod}
              label="Time Period"
              onChange={handleTimePeriodChange}
              startAdornment={<AccessTimeIcon sx={{ mr: 1 }} />}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="1week">1 Week</MenuItem>
              <MenuItem value="2weeks">2 Weeks</MenuItem>
              <MenuItem value="1month">1 Month</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="sort-select-label">Sort By</InputLabel>
            <Select
              labelId="sort-select-label"
              value={sortBy}
              label="Sort By"
              onChange={handleSortChange}
              startAdornment={<FilterListIcon sx={{ mr: 1 }} />}
            >
              <MenuItem value="stars">Stars</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="issues">Issues</MenuItem>
              <MenuItem value="updated">Updated</MenuItem>
            </Select>
          </FormControl>

          <ToggleButtonGroup
            value={sortOrder}
            exclusive
            onChange={handleOrderChange}
            aria-label="sort order"
            size="small"
          >
            <ToggleButton value="asc" aria-label="ascending">
              <ImportExportIcon sx={{ mr: 0.5 }} /> ASC
            </ToggleButton>
            <ToggleButton value="desc" aria-label="descending">
              <ImportExportIcon sx={{ mr: 0.5 }} /> DESC
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredRepos.length > 0 ? (
        <Grid container spacing={2}>
          {filteredRepos.map(repo => (
            <Grid item xs={12} key={repo.id}>
              <RepoCard repo={repo} onClick={handleRepoClick} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No repositories found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filter criteria
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default RepoList;
