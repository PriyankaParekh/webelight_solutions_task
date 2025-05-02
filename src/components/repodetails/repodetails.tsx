import type React from "react";

import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
} from "@mui/material";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import type { Repository } from "../../types";
import RepodetailsController from "./repodetails-controller";

interface RepoDetailsProps {
  repo: Repository;
  isOpen: boolean;
}

const RepoDetails: React.FC<RepoDetailsProps> = ({ repo, isOpen }) => {
  const {
    dataType,
    handleDataTypeChange,
    loading,
    error,
    commitActivityData,
    codeFrequencyData,
    getTotalChangesOptions,
    contributorData,
    getContributorChangesOptions,
  } = RepodetailsController({ isOpen, repo });

  return (
    <Collapse in={isOpen} timeout="auto" unmountOnExit>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mt: 1,
          mb: 2,
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6" component="h3">
            Repository Statistics
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="data-type-label">Data Type</InputLabel>
            <Select
              labelId="data-type-label"
              value={dataType}
              label="Data Type"
              onChange={handleDataTypeChange}
            >
              <MenuItem value="commits">Commits</MenuItem>
              <MenuItem value="additions">Additions</MenuItem>
              <MenuItem value="deletions">Deletions</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ py: 2 }}>
            {error}
          </Typography>
        ) : (
          <Box>
            {(!Array.isArray(commitActivityData) ||
              commitActivityData?.length === 0) &&
            (!Array.isArray(codeFrequencyData) ||
              codeFrequencyData?.length === 0) ? (
              <Typography sx={{ mb: 3 }}>
                No commit and code frequency data available.
              </Typography>
            ) : (
              <>
                {dataType === "commits" ? (
                  Array.isArray(commitActivityData) &&
                  commitActivityData?.length > 0 ? (
                    <Box sx={{ mb: 3 }}>
                      <HighchartsReact
                        highcharts={Highcharts}
                        options={getTotalChangesOptions()}
                      />
                    </Box>
                  ) : (
                    <Typography sx={{ mb: 3 }}>
                      No commit data available.
                    </Typography>
                  )
                ) : Array.isArray(codeFrequencyData) &&
                  codeFrequencyData?.length > 0 &&
                  codeFrequencyData?.some(
                    week => week[1] !== 0 || week[2] !== 0
                  ) ? (
                  <Box sx={{ mb: 3 }}>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={getTotalChangesOptions()}
                    />
                  </Box>
                ) : (
                  <Typography sx={{ mb: 3 }}>
                    No code frequency data available.
                  </Typography>
                )}
              </>
            )}
            {Array.isArray(contributorData) && contributorData?.length > 0 ? (
              <Box>
                <HighchartsReact
                  highcharts={Highcharts}
                  options={getContributorChangesOptions()}
                />
              </Box>
            ) : (
              <Typography>No contributor data available.</Typography>
            )}
          </Box>
        )}
      </Paper>
    </Collapse>
  );
};

export default RepoDetails;
