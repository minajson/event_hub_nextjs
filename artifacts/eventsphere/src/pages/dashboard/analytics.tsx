import { useState } from "react";
import { Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/DashboardLayout";
import {
  useGetAnalyticsOverview, getGetAnalyticsOverviewQueryKey,
  useGetAnalyticsTrends, getGetAnalyticsTrendsQueryKey,
  useGetAnalyticsDepartments, getGetAnalyticsDepartmentsQueryKey
} from "@workspace/api-client-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { cn } from "@/lib/utils";

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [trendPeriod, setTrendPeriod] = useState<"7d" | "14d" | "30d">("14d");

  const overview = useGetAnalyticsOverview(
    { period },
    { query: { queryKey: getGetAnalyticsOverviewQueryKey({ period }) } }
  );
  const trends = useGetAnalyticsTrends(
    { period: trendPeriod },
    { query: { queryKey: getGetAnalyticsTrendsQueryKey({ period: trendPeriod }) } }
  );
  const departments = useGetAnalyticsDepartments({
    query: { queryKey: getGetAnalyticsDepartmentsQueryKey() }
  });

  const maxDept = Math.max(...(departments.data ?? []).map((d) => d.attendees));

  const ratingBreakdown = [
    { stars: 5, pct: 82, color: "bg-amber-500" },
    { stars: 4, pct: 12, color: "bg-amber-400" },
    { stars: 3, pct: 4, color: "bg-amber-300" },
    { stars: 2, pct: 1, color: "bg-amber-200" },
    { stars: 1, pct: 1, color: "bg-amber-100" },
  ];

  return (
    <DashboardLayout type="admin" userName="Robert K." userRole="System Administrator">
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between sticky top-0 z-10" data-testid="analytics-header">
          <span className="text-sm font-semibold">Analytics &amp; Reports</span>
        </header>

        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold">Platform Analytics 📊</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Comprehensive insights into event performance and user engagement.</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={period} onValueChange={(v) => setPeriod(v as "7d" | "30d" | "90d")}>
                <SelectTrigger className="h-8 w-32 text-xs gap-1.5" data-testid="period-select">
                  <Calendar className="w-3.5 h-3.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" data-testid="export-pdf-btn">
                <Download className="w-3.5 h-3.5" /> Export PDF
              </Button>
              <Button size="sm" className="gap-1.5 text-xs" data-testid="export-excel-btn">
                <Download className="w-3.5 h-3.5" /> Export Excel
              </Button>
            </div>
          </div>

          {/* Overview Stats */}
          {overview.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                {
                  label: "Total Registrations",
                  value: (overview.data?.totalRegistrations ?? 42890).toLocaleString(),
                  sub: `+${overview.data?.registrationsChange ?? 14.5}% vs previous ${period}`,
                  icon: "🎫",
                  iconColor: "bg-blue-50 text-blue-600",
                  subColor: "text-green-600",
                },
                {
                  label: "Average Attendance Rate",
                  value: `${overview.data?.averageAttendanceRate ?? 86.4}%`,
                  sub: `+${overview.data?.attendanceChange ?? 2.1}% vs previous ${period}`,
                  icon: "✓",
                  iconColor: "bg-teal-50 text-teal-600",
                  subColor: "text-green-600",
                },
                {
                  label: "Overall Feedback Score",
                  value: `${Number(overview.data?.overallFeedbackScore ?? 4.8).toFixed(1)}/5.0`,
                  sub: `Based on ${(overview.data?.totalReviews ?? 12450).toLocaleString()} student reviews`,
                  icon: "⭐",
                  iconColor: "bg-amber-50 text-amber-600",
                  subColor: "text-muted-foreground",
                },
              ].map((s) => (
                <div key={s.label} className="bg-card border border-border rounded-xl p-4" data-testid={`overview-stat-${s.label.toLowerCase().replace(/\s/g, "-")}`}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-base", s.iconColor)}>{s.icon}</div>
                  </div>
                  <p className="text-3xl font-extrabold">{s.value}</p>
                  <p className={cn("text-xs mt-0.5", s.subColor)}>{s.sub}</p>
                </div>
              ))}
            </div>
          )}

          {/* Trends Chart */}
          <div className="bg-card border border-border rounded-xl p-5 mb-5" data-testid="trends-chart">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold">Event Participation Trends</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Daily registration vs actual attendance over the last {trendPeriod === "14d" ? "14" : trendPeriod === "7d" ? "7" : "30"} days.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="w-3 h-2 rounded bg-muted-foreground/30 inline-block" /> Registrations</span>
                <span className="flex items-center gap-1 text-xs text-primary"><span className="w-3 h-2 rounded bg-primary inline-block" /> Attendance</span>
                <Select value={trendPeriod} onValueChange={(v) => setTrendPeriod(v as "7d" | "14d" | "30d")}>
                  <SelectTrigger className="h-7 w-24 text-xs" data-testid="trend-period-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 days</SelectItem>
                    <SelectItem value="14d">14 days</SelectItem>
                    <SelectItem value="30d">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {trends.isLoading ? <Skeleton className="h-48 w-full" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={trends.data ?? []} barSize={14} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="registrations" fill="hsl(var(--muted-foreground) / 0.4)" radius={[3, 3, 0, 0]} name="Registrations" />
                  <Bar dataKey="attendance" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Attendance" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Department Performance */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5" data-testid="department-performance">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold">Department Performance</h2>
                <button className="text-xs text-primary hover:underline" data-testid="view-dept-details">View Details</button>
              </div>
              {departments.isLoading ? <Skeleton className="h-40 w-full" /> : (
                <div className="space-y-3">
                  {(departments.data ?? []).map((dept) => (
                    <div key={dept.name} data-testid={`dept-${dept.name.toLowerCase().replace(/\s/g, "-")}`}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-foreground">{dept.name}</span>
                        <span className="text-muted-foreground">{dept.attendees.toLocaleString()} attendees</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${(dept.attendees / maxDept) * 100}%`, backgroundColor: dept.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Feedback Ratings */}
            <div className="bg-card border border-border rounded-xl p-5" data-testid="feedback-ratings">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold">Feedback Ratings</h2>
                <button className="text-muted-foreground" data-testid="ratings-info"><Info /></button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl font-extrabold">{overview.data?.overallFeedbackScore ?? 4.8}</span>
                <div>
                  <div className="flex gap-0.5 mb-1">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className="text-amber-400 text-base">★</span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Excellent performance across all major event categories this month.</p>
                </div>
              </div>
              <div className="space-y-2">
                {ratingBreakdown.map((r) => (
                  <div key={r.stars} className="flex items-center gap-2 text-xs">
                    <span className="w-4 text-right text-muted-foreground">{r.stars}</span>
                    <span className="text-amber-400">★</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", r.color)} style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className="w-6 text-muted-foreground">{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Info() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
}
