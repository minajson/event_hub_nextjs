import { Link } from "wouter";
import { Search, Bell, ScanLine, Plus, ChevronRight, Upload, Award, Download, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/DashboardLayout";
import { useGetOrganizerDashboard, getGetOrganizerDashboardQueryKey } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

function StatCard({ label, value, sub, icon, color }: { label: string; value: string | number; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>{icon}</div>
      </div>
      <p className="text-3xl font-extrabold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

const statusColors = {
  registered: "bg-green-100 text-green-700",
  waitlist: "bg-amber-100 text-amber-700",
  checked_in: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

const eventStatusColors = {
  ongoing: "bg-green-100 text-green-700",
  upcoming: "bg-amber-100 text-amber-700",
  completed: "bg-muted text-muted-foreground",
};

export default function OrganizerDashboard() {
  const { data, isLoading } = useGetOrganizerDashboard({
    query: { queryKey: getGetOrganizerDashboardQueryKey() }
  });

  return (
    <DashboardLayout type="organizer" userName={data?.organizerName ?? "Sarah Jenkins"} userRole="Event Coordinator">
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between sticky top-0 z-10" data-testid="organizer-header">
          <span className="text-sm font-semibold">Organizer Dashboard</span>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Search events, participants..." className="pl-8 h-8 w-52 text-xs" data-testid="organizer-search" />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs hidden md:flex" data-testid="scan-qr-btn">
              <ScanLine className="w-3.5 h-3.5" /> Scan QR
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 relative" data-testid="notifications-btn">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full" />
            </Button>
          </div>
        </header>

        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold">Welcome back, {data?.organizerName?.split(" ")[0] ?? "Sarah"}!</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Here is what's happening with your events today.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" data-testid="new-announcement-btn">
                <span className="text-primary">✈</span> New Announcement
              </Button>
              <Button size="sm" className="gap-1.5 text-xs" data-testid="create-event-btn">
                <Plus className="w-3.5 h-3.5" /> Create Event
              </Button>
            </div>
          </div>

          {/* Stats */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Registrations" value={(data?.totalRegistrations ?? 1248).toLocaleString()} sub={`+${data?.registrationsChange ?? 12}% from last month`} icon={<span className="text-blue-600 text-base">👥</span>} color="bg-blue-50" />
              <StatCard label="Active Events" value={data?.activeEventsCount ?? 3} sub={`2 upcoming this week`} icon={<span className="text-amber-600 text-base">📊</span>} color="bg-amber-50" />
              <StatCard label="Average Attendance" value={`${data?.averageAttendance ?? 85}%`} sub={`+${data?.attendanceChange ?? 4}% across all events`} icon={<span className="text-teal-600 text-base">👤</span>} color="bg-teal-50" />
              <StatCard label="Avg. Feedback Rating" value={data?.avgFeedbackRating ?? 4.8} sub={`Based on 450 reviews`} icon={<span className="text-yellow-600 text-base">⭐</span>} color="bg-yellow-50" />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left — main content */}
            <div className="lg:col-span-2 space-y-5">
              {/* Active Events Overview */}
              <div className="bg-card border border-border rounded-xl p-5" data-testid="active-events">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold">Active Events Overview</h2>
                  <Link href="/explore" className="text-xs text-primary flex items-center gap-1 hover:underline" data-testid="view-all-events">
                    View All Events <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {(data?.activeEvents ?? []).map((event) => {
                    const pct = Math.round((event.checkedIn / event.totalRegistrations) * 100);
                    const cfg = eventStatusColors[event.status as keyof typeof eventStatusColors] ?? eventStatusColors.upcoming;
                    return (
                      <div key={event.id} className="border border-border rounded-xl p-4" data-testid={`active-event-${event.id}`}>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <h3 className="font-semibold text-sm">{event.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span>📅 {event.startDate ? new Date(event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : ""}</span>
                              <span>📍 {event.venue}</span>
                            </div>
                          </div>
                          <Badge className={cn("text-xs shrink-0", cfg)} variant="outline">
                            {event.status === "ongoing" ? "Live Now" : event.status === "upcoming" ? "Upcoming" : "Completed"}
                          </Badge>
                        </div>
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Check-ins / Total Registrations</span>
                            <span className="font-medium">{event.checkedIn} / {event.totalRegistrations}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm" className="text-xs" data-testid={`manage-checkins-${event.id}`}>Manage Check-ins</Button>
                          <Button variant="outline" size="sm" className="text-xs" data-testid={`send-update-${event.id}`}>Send Update</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Registrations */}
              <div className="bg-card border border-border rounded-xl p-5" data-testid="recent-registrations">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold">Recent Registrations</h2>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input placeholder="Search names..." className="pl-6 h-7 w-36 text-xs" data-testid="search-registrations" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs" data-testid="registrations-table">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left font-medium text-muted-foreground py-2">Participant</th>
                        <th className="text-left font-medium text-muted-foreground py-2">Event</th>
                        <th className="text-left font-medium text-muted-foreground py-2">Ticket Type</th>
                        <th className="text-left font-medium text-muted-foreground py-2">Status</th>
                        <th className="text-left font-medium text-muted-foreground py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {(data?.recentRegistrations ?? []).map((reg) => {
                        const statusCfg = statusColors[reg.status as keyof typeof statusColors] ?? statusColors.registered;
                        return (
                          <tr key={reg.id} data-testid={`reg-row-${reg.id}`}>
                            <td className="py-2.5">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-[9px]">{reg.userName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{reg.userName}</p>
                                  <p className="text-muted-foreground text-[10px]">{reg.userEmail}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 text-muted-foreground">{reg.eventTitle}</td>
                            <td className="py-2.5 text-muted-foreground">{reg.ticketType === "vip" ? "VIP Pass" : "General Pass"}</td>
                            <td className="py-2.5">
                              <Badge className={cn("text-[10px]", statusCfg)} variant="outline">
                                {reg.status === "checked_in" ? "Checked In" : reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="py-2.5">
                              {reg.status === "registered" ? (
                                <Button variant="outline" size="sm" className="h-6 text-[10px]" data-testid={`checkin-${reg.id}`}>Check In</Button>
                              ) : (
                                <Button variant="ghost" size="icon" className="h-6 w-6" data-testid={`menu-${reg.id}`}>
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3 text-xs" data-testid="view-all-participants">View All Participants</Button>
              </div>
            </div>

            {/* Right panel */}
            <div className="space-y-5">
              {/* Quick Actions */}
              <div className="bg-card border border-border rounded-xl p-4" data-testid="quick-actions">
                <h3 className="text-sm font-bold mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { icon: <ScanLine className="w-4 h-4 text-blue-600" />, label: "Open Scanner", sub: "Scan participant QR codes", bg: "bg-blue-50" },
                    { icon: <Upload className="w-4 h-4 text-teal-600" />, label: "Upload Media", sub: "Add gallery photos & videos", bg: "bg-teal-50" },
                    { icon: <Award className="w-4 h-4 text-purple-600" />, label: "Generate Certificates", sub: "For completed events", bg: "bg-purple-50" },
                    { icon: <Download className="w-4 h-4 text-amber-600" />, label: "Export Reports", sub: "Download attendance CSV/PDF", bg: "bg-amber-50" },
                  ].map((action) => (
                    <button key={action.label} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors text-left" data-testid={`action-${action.label.toLowerCase().replace(/\s/g, "-")}`}>
                      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", action.bg)}>{action.icon}</div>
                      <div>
                        <p className="text-xs font-semibold">{action.label}</p>
                        <p className="text-[10px] text-muted-foreground">{action.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Feedback */}
              <div className="bg-card border border-border rounded-xl p-4" data-testid="recent-feedback">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold">Recent Feedback</h3>
                  <Link href="/dashboard/analytics" className="text-xs text-primary hover:underline">View All</Link>
                </div>
                <div className="space-y-3">
                  {(data?.recentFeedback ?? []).map((f) => (
                    <div key={f.id} className="bg-muted/30 rounded-xl p-3" data-testid={`feedback-${f.id}`}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold">UI/UX Masterclass</p>
                        <div className="flex">
                          {[1,2,3,4,5].map((s) => (
                            <span key={s} className={`text-xs ${s <= Math.round(f.rating) ? "text-amber-400" : "text-muted"}`}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground italic">"{f.comment}"</p>
                      <p className="text-[10px] text-muted-foreground mt-1">- {f.userName}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
