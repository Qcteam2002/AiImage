import api from './api';

export interface DashboardStats {
  totalProcessed: number;
  successful: number;
  failed: number;
  pending: number;
  successRate: number;
  creditsRemaining: number;
  thisWeekActivity: number;
}

export interface UsageStats {
  virtualTryOn: number;
  optimize: number;
  productImage: number;
}

export interface RecentProcess {
  id: string;
  status: string;
  createdAt: string;
  metadata: any;
  resultImageUrl?: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string | null;
  credits: number;
  joinDate: string;
  isVerified: boolean;
}

export interface DashboardData {
  user: UserInfo;
  stats: DashboardStats;
  usage: UsageStats;
  recentProcesses: RecentProcess[];
}

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardData> {
    const response = await api.get('/images/dashboard-stats');
    return response.data.data;
  },

  async getQuickStats() {
    const response = await api.get('/images/stats');
    return response.data.stats;
  }
};
