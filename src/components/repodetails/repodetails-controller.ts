import { useEffect, useState } from "react";
import { Repository } from "../../types";
import { fetchRepoStats } from "../../services/api";
import { SelectChangeEvent } from "@mui/material";
interface RepoDetailsProps {
  repo: Repository;
  isOpen: boolean;
}

type DataType = "commits" | "additions" | "deletions";

interface ContributorData {
  author: {
    login: string;
  };
  weeks: {
    w: number; // Unix timestamp for start of week
    a: number; // Additions
    d: number; // Deletions
    c: number; // Commits
  }[];
}

type CodeFrequencyData = [number, number, number][];

interface RepoDetailsControllerResult {
  dataType: DataType;
  handleDataTypeChange: (event: SelectChangeEvent) => void;
  loading: boolean;
  error: string | null;
  commitActivityData: any[];
  codeFrequencyData: CodeFrequencyData;
  getTotalChangesOptions: () => any;
  contributorData: ContributorData[];
  getContributorChangesOptions: () => any;
}

function RepodetailsController({
  isOpen,
  repo,
}: RepoDetailsProps): RepoDetailsControllerResult {
  const [loading, setLoading] = useState(false);
  const [dataType, setDataType] = useState<DataType>("commits");
  const [contributorData, setContributorData] = useState<ContributorData[]>([]);
  const [codeFrequencyData, setCodeFrequencyData] = useState<CodeFrequencyData>(
    []
  );
  const [commitActivityData, setCommitActivityData] = useState<any[]>([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (
        isOpen &&
        contributorData?.length === 0 &&
        codeFrequencyData?.length === 0
      ) {
        setLoading(true);
        setError(null);
        try {
          const { contributors, codeFrequency, commitActivity } =
            await fetchRepoStats(repo?.owner?.login, repo?.name);
          setContributorData(Array.isArray(contributors) ? contributors : []);
          setCodeFrequencyData(
            Array.isArray(codeFrequency) ? codeFrequency : []
          );
          setCommitActivityData(
            Array.isArray(commitActivity) ? commitActivity : []
          );
        } catch (err) {
          setError("Failed to load repository statistics");
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [isOpen, repo, contributorData?.length, codeFrequencyData?.length]);

  const handleDataTypeChange = (event: SelectChangeEvent) => {
    setDataType(event.target.value as DataType);
  };

  // Prepare data for total changes chart
  const getTotalChangesOptions = () => {
    if (!codeFrequencyData || codeFrequencyData?.length === 0) {
      return {
        title: { text: "Total Changes" },
        series: [{ data: [] }],
      };
    }
    const categories: string[] = [];
    const seriesData: number[] = [];
    if (dataType === "commits") {
      commitActivityData?.forEach((week: any) => {
        const date = new Date(week?.week * 1000);
        categories.push(
          `${date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}`
        );
        seriesData.push(week?.total || 0);
      });
    } else {
      codeFrequencyData?.forEach((week: any) => {
        const date = new Date(week[0] * 1000);
        categories.push(
          `${date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}`
        );
        if (dataType === "additions") {
          seriesData.push(week[1]); // Additions
        } else {
          seriesData.push(Math.abs(week[2])); // Deletions
        }
      });
    }

    const color =
      dataType === "commits"
        ? "#8884d8"
        : dataType === "additions"
        ? "#82ca9d"
        : "#ff8042";

    return {
      chart: {
        type: "spline",
        height: 250,
      },
      title: {
        text: "Total Changes",
        align: "left",
      },
      xAxis: {
        categories,
        labels: {
          rotation: -45,
          style: {
            fontSize: "10px",
          },
        },
      },
      yAxis: {
        title: {
          text: dataType?.charAt(0)?.toUpperCase() + dataType?.slice(1),
        },
      },
      tooltip: {
        formatter: function (this: any): any {
          return `<b>Week: ${this?.x}</b><br/>
                      ${
                        dataType?.charAt(0)?.toUpperCase() + dataType?.slice(1)
                      }: ${this?.y}`;
        },
      },
      series: [
        {
          name: dataType?.charAt(0)?.toUpperCase() + dataType?.slice(1),
          data: seriesData,
          color: color,
        },
      ],
      credits: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
    };
  };

  const getContributorChangesOptions = () => {
    if (!Array.isArray(contributorData) || contributorData?.length === 0) {
      return {
        title: { text: "Contributor Changes" },
        series: [],
      };
    }

    const sortedContributors = [...contributorData]?.sort((a, b) => {
      const aTotal = a?.weeks?.reduce(
        (sum, w) =>
          sum +
          (dataType === "commits"
            ? w?.c
            : dataType === "additions"
            ? w?.a
            : Math.abs(w.d)),
        0
      );
      const bTotal = b?.weeks?.reduce(
        (sum, w) =>
          sum +
          (dataType === "commits"
            ? w?.c
            : dataType === "additions"
            ? w?.a
            : Math.abs(w.d)),
        0
      );
      return bTotal - aTotal;
    });

    const topContributors = sortedContributors?.slice(0, 10); // Limit to top 10

    const allWeeks = new Set<number>();
    topContributors?.forEach(contributor => {
      contributor?.weeks?.forEach(week => allWeeks?.add(week.w));
    });

    const sortedWeeks = Array.from(allWeeks)?.sort((a, b) => a - b);

    const categories = sortedWeeks?.map(ts => {
      const date = new Date(ts * 1000);
      return `${date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
    });

    const series = topContributors?.map(contributor => {
      const data = sortedWeeks?.map(week => {
        const match = contributor?.weeks?.find(w => w.w === week);
        return match
          ? dataType === "commits"
            ? match?.c
            : dataType === "additions"
            ? match?.a
            : Math?.abs(match?.d)
          : 0;
      });
      return {
        name: contributor?.author?.login,
        data,
      };
    });

    return {
      chart: { type: "spline", height: 250 },
      title: { text: "Top Contributors", align: "left" },
      xAxis: {
        categories,
        labels: { rotation: -45, style: { fontSize: "10px" } },
      },
      yAxis: {
        title: {
          text: dataType?.charAt(0)?.toUpperCase() + dataType?.slice(1),
        },
      },
      tooltip: {
        formatter: function (this: any): any {
          return `<b>Week: ${this?.x}</b><br/>
                    Contributor: ${this?.series?.name}<br/>
                    ${
                      dataType?.charAt(0)?.toUpperCase() + dataType?.slice(1)
                    }: ${this.y}`;
        },
      },
      legend: {
        layout: "vertical",
        align: "right",
        verticalAlign: "middle",
        itemStyle: { fontSize: "10px" },
        maxHeight: 150,
        navigation: { enabled: true },
      },
      series,
      credits: { enabled: false },
    };
  };

  if (!isOpen) {
    return {
      dataType,
      handleDataTypeChange,
      loading: false,
      error: null,
      commitActivityData: [],
      codeFrequencyData: [],
      getTotalChangesOptions: () => ({
        title: { text: "Total Changes" },
        series: [{ data: [] }],
      }),
      contributorData: [],
      getContributorChangesOptions: () => ({
        title: { text: "Contributor Changes" },
        series: [],
      }),
    };
  }
  return {
    dataType,
    handleDataTypeChange,
    loading,
    error,
    commitActivityData,
    codeFrequencyData,
    getTotalChangesOptions,
    contributorData,
    getContributorChangesOptions,
  };
}

export default RepodetailsController;
