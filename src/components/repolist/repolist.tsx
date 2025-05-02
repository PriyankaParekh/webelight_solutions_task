import type React from "react";
import {
  Box,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import RepoCard from "../repocard";
import RepolistController from "./repolist-controller";

// Define time period options for filtering
type TimePeriodOption = {
  value: number;
  label: string;
};

const timePeriodOptions: TimePeriodOption[] = [
  { value: 7, label: "1 Week" },
  { value: 14, label: "2 Weeks" },
  { value: 30, label: "1 Month" },
];

const RepoList: React.FC = () => {
  const {
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
  } = RepolistController();

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
              value={timePeriod?.toString()}
              label="Time Period"
              onChange={handleTimePeriodChange}
              startAdornment={<AccessTimeIcon sx={{ mr: 1 }} />}
            >
              {timePeriodOptions?.map(option => (
                <MenuItem key={option?.value} value={option?.value}>
                  {option.label}
                </MenuItem>
              ))}
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

      {filteredRepos?.length > 0 ? (
        <Grid container spacing={2}>
          {filteredRepos?.map((repo, index) => (
            <Grid
              item
              xs={12}
              key={repo?.id}
              ref={
                index === filteredRepos?.length - 1 ? lastRepoElementRef : null
              }
            >
              <RepoCard repo={repo} onClick={handleRepoClick} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            {loading ? "Loading repositories..." : "No repositories found"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {!loading && "Try adjusting your search or filter criteria"}
          </Typography>
        </Box>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default RepoList;
