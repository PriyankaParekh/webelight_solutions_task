export interface Repository {
  id: number
  name: string
  description: string
  owner: {
    login: string
    avatar_url: string
  }
  stargazers_count: number
  open_issues_count: number
  pushed_at: string
  html_url: string
}

export interface RepositoryState {
  repositories: Repository[]
  loading: boolean
  error: string | null
  sortBy: SortOption
  sortOrder: SortOrder
  page: number
  hasMore: boolean
  timePeriod: number
}

export type SortOption = "stars" | "name" | "issues" | "updated"
export type SortOrder = "asc" | "desc"
