import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Box,
  CardActionArea,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";
import {
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
  ErrorOutline as ErrorOutlineIcon,
} from "@mui/icons-material";
import type { Repository } from "../../types";
import { formatRelativeTime, truncateText } from "../../utils/helpers";
import RepoDetails from "../repodetails";

interface RepoCardProps {
  repo: Repository;
  onClick: (repo: Repository) => void;
}

const RepoCard: React.FC<RepoCardProps> = ({ repo, onClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme?.breakpoints?.down("sm"));
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <Card
      sx={{
        mb: 2,
        overflow: "visible",
        position: "relative",
      }}
    >
      <CardActionArea onClick={() => onClick(repo)}>
        <CardContent sx={{ display: "flex", alignItems: "center", p: 2 }}>
          <Avatar
            src={repo?.owner?.avatar_url}
            alt={repo?.name}
            title={repo?.name}
            sx={{
              width: { xs: 48, sm: 60, md: 64 },
              height: { xs: 48, sm: 60, md: 64 },
              mr: { xs: 2, md: 3 },
              border: "2px solid",
              borderColor: "primary.main",
            }}
          />

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" component="h2" noWrap>
              {repo.name}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                overflow: "hidden",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                mb: 1.5,
              }}
            >
              {truncateText(
                repo?.description || "No description available",
                isMobile ? 60 : 100
              )}
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                alignItems: "center",
              }}
            >
              <Chip
                size={isMobile ? "small" : "medium"}
                icon={<StarIcon sx={{ fontSize: isMobile ? 16 : 20 }} />}
                label={`${repo?.stargazers_count?.toLocaleString()}`}
                color="primary"
                variant="outlined"
              />

              <Chip
                size={isMobile ? "small" : "medium"}
                icon={
                  <ErrorOutlineIcon sx={{ fontSize: isMobile ? 16 : 20 }} />
                }
                label={`${repo?.open_issues_count?.toLocaleString()}`}
                color="warning"
                variant="outlined"
              />

              {!isMobile && (
                <>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    Last pushed {formatRelativeTime(repo?.pushed_at)} by{" "}
                    {repo?.owner?.login}
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          <IconButton
            onClick={handleExpandClick}
            sx={{
              color: "text.secondary",
              transition: "transform 0.2s",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            {expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          </IconButton>
        </CardContent>
      </CardActionArea>

      <RepoDetails repo={repo} isOpen={expanded} />
    </Card>
  );
};

export default RepoCard;
