// GitHub User Profile
export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  name: string | null
  bio: string | null
  company: string | null
  location: string | null
  email: string | null
  blog: string | null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
}

// Repository Information
export interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  topics: string[]
  created_at: string
  updated_at: string
  pushed_at: string
}

// Contribution Data
export interface ContributionDay {
  date: string
  contributionCount: number
  color: string
  contributionLevel: 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE'
}

export interface ContributionWeek {
  contributionDays: ContributionDay[]
}

export interface ContributionCalendar {
  totalContributions: number
  weeks: ContributionWeek[]
}

// Language Statistics
export interface LanguageStat {
  name: string
  size: number
  color: string
  percentage: number
}

// Annual Review Data
export interface AnnualReviewData {
  year: number
  user: GitHubUser
  totalCommits: number
  totalPRs: number
  totalIssues: number
  totalStars: number
  newFollowers: number
  mostActiveRepo: Repository | null
  topLanguages: LanguageStat[]
  busiestDay: {
    date: string
    contributions: number
  } | null
  contributionCalendar: ContributionCalendar | null
  repositories: Repository[]
  monthlyContributions: MonthlyContribution[]
  commitInsights: CommitInsights | null
}

export interface MonthlyContribution {
  month: string
  commits: number
  prs: number
  issues: number
}

// API Response Types
export interface GraphQLContributionsResponse {
  user: {
    contributionsCollection: {
      contributionCalendar: ContributionCalendar
      totalCommitContributions: number
      totalPullRequestContributions: number
      totalIssueContributions: number
      totalRepositoryContributions: number
      restrictedContributionsCount: number
    }
    repositories: {
      nodes: GraphQLRepository[]
    }
    followers: {
      totalCount: number
    }
  }
}

export interface GraphQLRepository {
  name: string
  description: string | null
  url: string
  stargazerCount: number
  forkCount: number
  primaryLanguage: {
    name: string
    color: string
  } | null
  languages: {
    edges: {
      size: number
      node: {
        name: string
        color: string
      }
    }[]
  }
  defaultBranchRef: {
    target: {
      history: {
        totalCount: number
      }
    }
  } | null
}

// Auth State
export interface AuthState {
  token: string | null
  isAuthenticated: boolean
  user: GitHubUser | null
}

// Loading State
export interface LoadingState {
  isLoading: boolean
  message: string
  progress: number
}

// Commit Insights
export interface CommitInsights {
  totalCommitMessages: number
  wordFrequency: WordFrequency[]
  commitTypes: CommitType[]
  averageMessageLength: number
  longestMessage: string
  mostActiveHour: number
  commitsByHour: number[]
}

export interface WordFrequency {
  word: string
  count: number
  percentage: number
}

export interface CommitType {
  type: string
  count: number
  color: string
}
