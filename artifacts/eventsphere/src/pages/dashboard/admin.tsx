import { useState } from "react";
import { Search, Download, AlertTriangle, Shield, Info, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import DashboardLayout from "@/components/DashboardLayout";
import { useGetAdminDashboard, getGetAdminDashboardQueryKey, useApproveEvent } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

function StatCard({ label, value, sub, icon, color, subColor }: { label: string; value: string | number; sub: string; icon: React.ReactNode; color: string; subColor?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>{icon}</div>
      </div>
      <p className="text-3xl font-extrabold">{value}</p>
      <p className={cn("text-xs mt-0.5", subColor ?? "text-muted-foreground")}>{sub}</p>
    </div>
  );
}

const alertIcons = {
  error: <AlertTriangle className="w-4 h-4 text-red-500" />,
  warning: <Shield className="w-4 h-4 text-amber-500" />,
  info: <Info className="w-4 h-4 text-blue-500" />,
};
const alertBg = {
  error: "bg-red-50 border-red-100",
  warning: "bg-amber-50 border-amber-100",
  info: "bg-blue-50 border-blue-100",
};

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetAdminDashboard({
    query: { queryKey: getGetAdminDashboardQueryKey() }
  });
  const approve = useApproveEvent();

  function handleApprove(eventId: number, action: "approve" | "reject") {
    approve.mutate(
      { eventId, data: { action } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() }) }
    );
  }

  return (
    <DashboardLayout type="admin" userName="Robert K." userRole="System Administrator">
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between sticky top-0 z-10" data-testid="admin-header">
          <span className="text-sm font-semibold">Admin Dashboard</span>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Search users, events, IDs..." className="pl-8 h-8 w-52 text-xs" data-testid="admin-search" />
            </div>
            <kbd className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">⌘K</kbd>
            <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center" data-testid="admin-avatar">
              <span className="text-xs text-white font-bold">R</span>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold">Platform Overview 🌐</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Monitor system health, approve events, and manage users.</p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" data-testid="export-logs-btn">
              <Download className="w-3.5 h-3.5" /> Export Logs
            </Button>
          </div>

          {/* Stats */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Active Users" value={(data?.totalActiveUsers ?? 0).toLocaleString()} sub={`+${data?.usersChange ?? 8.2}% vs last month`} icon={<span className="text-blue-600">👥</span>} color="bg-blue-50" subColor="text-green-600" />
              <StatCard label="Total Events Hosted" value={data?.totalEventsHosted ?? 342} sub={`+${data?.newEventsThisWeek ?? 12} new this week`} icon={<span className="text-teal-600">📅</span>} color="bg-teal-50" subColor="text-green-600" />
              <StatCard label="Pending Approvals" value={data?.pendingApprovals ?? 14} sub="Needs review within 24h" icon={<span className="text-amber-600">📋</span>} color="bg-amber-50" />
              <StatCard label="System Alerts" value={data?.systemAlertsCount ?? 3} sub={`${data?.criticalAlerts ?? 1} Critical issue detected`} icon={<span className="text-red-600">⚠️</span>} color="bg-red-50" subColor="text-red-600" />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left */}
            <div className="lg:col-span-2 space-y-5">
              {/* Event Approval */}
              <div className="bg-card border border-border rounded-xl p-5" data-testid="event-approvals">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold">Event Approval Workflow</h2>
                  <button className="text-xs text-primary hover:underline" data-testid="view-all-pending">
                    View All Pending ({data?.pendingApprovals ?? 14})
                  </button>
                </div>
                <div className="space-y-4">
                  {(data?.pendingEvents ?? []).map((event) => (
                    <div key={event.id} className="border border-border rounded-xl p-4" data-testid={`pending-event-${event.id}`}>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                          {event.imageUrl && <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{event.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            👤 {event.organizerName} ({event.organizerDept}) &nbsp;
                            📅 {event.startDate ? new Date(event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                          </p>
                          <div className="flex gap-2 mt-1.5">
                            <Badge variant="secondary" className="text-[10px]">{event.category}</Badge>
                            <Badge variant="secondary" className="text-[10px]">Capacity: {event.capacity.toLocaleString()}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleApprove(event.id, "reject")}
                          disabled={approve.isPending}
                          data-testid={`reject-event-${event.id}`}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleApprove(event.id, "approve")}
                          disabled={approve.isPending}
                          data-testid={`approve-event-${event.id}`}
                        >
                          Approve Event
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Management */}
              <div className="bg-card border border-border rounded-xl p-5" data-testid="user-management">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold">User Management</h2>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input placeholder="Search users..." className="pl-6 h-7 w-36 text-xs" data-testid="search-users" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs" data-testid="users-table">
                    <thead>
                      <tr className="border-b border-border">
                        {["User", "Role", "Status", "Joined Date", "Actions"].map((h) => (
                          <th key={h} className="text-left font-medium text-muted-foreground py-2 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {(data?.recentUsers ?? []).map((user) => (
                        <tr key={user.id} data-testid={`user-row-${user.id}`}>
                          <td className="py-2.5 pr-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-[9px]">{user.fullName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.fullName}</p>
                                <p className="text-[10px] text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 pr-4">
                            <span className={cn("text-[10px] font-semibold",
                              user.role === "organizer" ? "text-blue-600" :
                              user.role === "admin" ? "text-purple-600" : "text-teal-600"
                            )}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className="py-2.5 pr-4">
                            <span className={cn("text-[10px] font-semibold",
                              user.status === "active" ? "text-green-600" : "text-red-600"
                            )}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-2.5 pr-4 text-muted-foreground">
                            {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}
                          </td>
                          <td className="py-2.5">
                            <Button variant="ghost" size="icon" className="w-6 h-6" data-testid={`user-menu-${user.id}`}>
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3 text-xs" data-testid="view-all-users">View All Users</Button>
              </div>
            </div>

            {/* Right panel */}
            <div className="space-y-5">
              {/* System Alerts */}
              <div className="bg-card border border-border rounded-xl p-4" data-testid="system-alerts">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold">System Alerts</h3>
                  <Badge className="text-[10px] bg-red-100 text-red-700" variant="outline">
                    {data?.systemAlertsCount ?? 3} New
                  </Badge>
                </div>
                <div className="space-y-2.5">
                  {(data?.systemAlerts ?? []).map((alert) => {
                    const type = alert.type as "error" | "warning" | "info";
                    return (
                      <div key={alert.id} className={cn("p-3 rounded-xl border", alertBg[type])} data-testid={`alert-${alert.id}`}>
                        <div className="flex items-start gap-2">
                          {alertIcons[type]}
                          <div>
                            <p className="text-xs font-semibold">{alert.title}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{alert.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {Math.round((Date.now() - new Date(alert.createdAt).getTime()) / 60000)} mins ago
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3 text-xs text-primary" data-testid="go-to-moderation">
                  Go to Moderation Panel
                </Button>
              </div>

              {/* Participation Trend Chart */}
              <div className="bg-card border border-border rounded-xl p-4" data-testid="participation-trend">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold">Participation Trend</h3>
                  <button className="text-muted-foreground" data-testid="trend-menu"><span>•••</span></button>
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={data?.participationTrend ?? []} barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                    <Bar dataKey="attendance" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="registrations" fill="hsl(var(--primary) / 0.3)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-2xl font-extrabold">{(data?.weeklyParticipants ?? 4280).toLocaleString()}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Total Participants (This Week)</p>
                    <button className="text-xs text-primary hover:underline" data-testid="full-report-btn">Full Report</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
