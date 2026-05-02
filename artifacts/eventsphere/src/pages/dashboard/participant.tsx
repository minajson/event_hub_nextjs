import { useState } from "react";
import { Link } from "wouter";
import {
  Search, Bell, Calendar, Award, Ticket, Clock, MapPin,
  Star, Download, CheckCircle, AlertCircle, ChevronRight, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardLayout from "@/components/DashboardLayout";
import { useGetParticipantDashboard, getGetParticipantDashboardQueryKey } from "@workspace/api-client-react";
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

const statusConfig = {
  registered: { label: "Registered", color: "bg-green-100 text-green-700" },
  waitlist: { label: "Waitlist", color: "bg-amber-100 text-amber-700" },
  completed: { label: "Completed", color: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function ParticipantDashboard() {
  const [review, setReview] = useState("");
  const [reviewRating, setReviewRating] = useState(0);

  const { data, isLoading } = useGetParticipantDashboard({
    query: { queryKey: getGetParticipantDashboardQueryKey() }
  });

  return (
    <DashboardLayout type="participant" userName={data?.userName ?? "Alex Johnson"} userRole="Student • Year 3">
      <div className="min-h-screen bg-background">
        {/* Top bar */}
        <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between sticky top-0 z-10" data-testid="dashboard-header">
          <span className="text-sm font-semibold text-foreground">Participant Dashboard</span>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Search events, tags..." className="pl-8 h-8 w-52 text-xs" data-testid="dashboard-search" />
            </div>
            <kbd className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5 hidden md:block">⌘K</kbd>
            <Button variant="ghost" size="icon" className="w-8 h-8 relative" data-testid="notifications-btn">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </Button>
          </div>
        </header>

        <div className="p-6">
          {/* Welcome */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">
                Welcome back, {data?.userName?.split(" ")[0] ?? "Alex"}!
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                You have {data?.upcomingCount ?? 1} event happening today and {data?.upcomingCount ?? 2} upcoming this week.
              </p>
            </div>
            <Link href="/explore">
              <Button size="sm" data-testid="browse-events-btn">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Browse New Events
              </Button>
            </Link>
          </div>

          {/* Stats */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard label="Registered Events" value={data?.registeredEventsCount ?? 8} sub="2 events happening this week" icon={<Ticket className="w-4 h-4 text-blue-600" />} color="bg-blue-50" />
              <StatCard label="Upcoming Schedule" value={data?.upcomingCount ?? 3} sub={`Next: ${data?.nextEvent?.title ?? "TechNova Hackathon"}`} icon={<Clock className="w-4 h-4 text-amber-600" />} color="bg-amber-50" />
              <StatCard label="Certificates Earned" value={data?.certificatesEarned ?? 12} sub="Top 15% active participant" icon={<Award className="w-4 h-4 text-teal-600" />} color="bg-teal-50" />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left — Main */}
            <div className="lg:col-span-2 space-y-6">
              {/* Up Next */}
              {data?.nextEvent && (
                <div className="bg-card border border-border rounded-xl p-5" data-testid="up-next-card">
                  <h2 className="text-sm font-bold mb-3">Up Next</h2>
                  <div className="bg-muted/40 border border-primary/20 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          <span className="text-xs font-semibold text-primary uppercase tracking-wide">Happening Soon</span>
                        </div>
                        <h3 className="font-bold text-base text-foreground">{data.nextEvent.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 mb-3">Get ready to build the future. Registration desk opens at 8:30 AM.</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Today, 09:00 AM</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {data.nextEvent.venue}</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Link href={`/events/${data.nextEvent.id}`}>
                            <Button size="sm" className="text-xs" data-testid="view-schedule-btn">View Full Schedule</Button>
                          </Link>
                          <Button size="sm" variant="outline" className="text-xs" data-testid="get-directions-btn">Get Directions</Button>
                        </div>
                      </div>
                      <div className="shrink-0 bg-white border border-border rounded-xl p-3 text-center shadow-sm">
                        <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center mb-1">
                          <div className="text-center">
                            <p className="text-[8px] text-muted-foreground">QR CODE</p>
                            <div className="grid grid-cols-3 gap-0.5 mt-1">
                              {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className={`w-2 h-2 ${Math.random() > 0.4 ? "bg-foreground" : "bg-transparent"} rounded-sm`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono">Pass #TN-4092</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* My Schedule */}
              <div className="bg-card border border-border rounded-xl p-5" data-testid="my-schedule">
                <h2 className="text-sm font-bold mb-4">My Schedule</h2>
                <div className="relative space-y-4 pl-5">
                  <div className="absolute left-1.5 top-0 bottom-0 w-px bg-border" />
                  {(data?.mySchedule ?? []).map((item, i) => {
                    const cfg = statusConfig[item.registrationStatus as keyof typeof statusConfig] ?? statusConfig.registered;
                    return (
                      <div key={item.id} className="relative" data-testid={`schedule-item-${item.id}`}>
                        <div className="absolute -left-[17px] w-3 h-3 rounded-full bg-background border-2 border-primary top-1" />
                        <div className="bg-muted/30 border border-border rounded-xl p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">{item.startDate ? formatDate(item.startDate) : "Upcoming"}</p>
                              <p className="font-semibold text-sm text-foreground mt-0.5">{item.eventTitle}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {item.venue}</p>
                            </div>
                            <Badge className={cn("text-[10px] shrink-0", cfg.color)} variant="outline">
                              {cfg.label}{item.waitlistPosition ? ` #${item.waitlistPosition}` : ""}
                            </Badge>
                          </div>
                          {item.registrationStatus === "registered" && (
                            <Button size="sm" variant="outline" className="mt-2 text-xs" data-testid={`cancel-reg-${item.id}`}>
                              Cancel Registration
                            </Button>
                          )}
                          {item.registrationStatus === "completed" && !item.hasCertificate && (
                            <div className="mt-3 border-t border-border pt-3">
                              <p className="text-xs font-medium mb-2">How was the event?</p>
                              <div className="flex gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <button key={s} onClick={() => setReviewRating(s)} data-testid={`star-${s}`}>
                                    <Star className={`w-4 h-4 ${s <= reviewRating ? "text-amber-400 fill-amber-400" : "text-muted"}`} />
                                  </button>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <Input value={review} onChange={(e) => setReview(e.target.value)} placeholder="Write a brief review..." className="text-xs h-8" data-testid="review-input" />
                                <Button size="sm" className="text-xs shrink-0" data-testid="submit-review">Submit</Button>
                              </div>
                            </div>
                          )}
                          {item.hasCertificate && (
                            <Button size="sm" className="mt-2 text-xs gap-1.5 w-full" data-testid={`download-cert-${item.id}`}>
                              <Download className="w-3 h-3" /> Download Certificate
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right — Sidebar panels */}
            <div className="space-y-5">
              {/* Notifications */}
              <div className="bg-card border border-border rounded-xl p-4" data-testid="notifications-panel">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold">Recent Notifications</h3>
                  <button className="text-xs text-primary hover:underline" data-testid="mark-all-read">Mark all read</button>
                </div>
                <div className="space-y-3">
                  {(data?.notifications ?? []).map((n) => {
                    const colors = {
                      registration: "bg-green-100 text-green-700",
                      waitlist: "bg-amber-100 text-amber-700",
                      certificate: "bg-blue-100 text-blue-700",
                      reminder: "bg-purple-100 text-purple-700",
                      announcement: "bg-gray-100 text-gray-700",
                    };
                    const color = colors[n.type as keyof typeof colors] ?? colors.announcement;
                    return (
                      <div key={n.id} className={cn("p-2.5 rounded-lg", !n.isRead && "bg-primary/5 border border-primary/10")} data-testid={`notification-${n.id}`}>
                        <div className="flex items-start gap-2">
                          <div className={cn("w-5 h-5 rounded-full shrink-0 flex items-center justify-center mt-0.5", color)}>
                            <span className="text-[9px]">!</span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold">{n.title}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {Math.round((Date.now() - new Date(n.createdAt).getTime()) / 3600000)}h ago
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3 text-xs" data-testid="view-all-notifications">View All Notifications</Button>
              </div>

              {/* Saved Events */}
              <div className="bg-card border border-border rounded-xl p-4" data-testid="saved-events-panel">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold">Saved Events</h3>
                  <Link href="/explore" className="text-xs text-primary hover:underline">View all</Link>
                </div>
                <div className="space-y-3">
                  {(data?.savedEvents ?? []).map((e) => (
                    <div key={e.id} className="flex items-center gap-3" data-testid={`saved-event-${e.id}`}>
                      <div className="w-12 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                        {e.imageUrl && <img src={e.imageUrl} alt={e.title} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{e.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(e.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • {e.venue}
                        </p>
                      </div>
                      <button className="shrink-0 text-muted-foreground hover:text-foreground" data-testid={`remove-saved-${e.id}`}>
                        <Award className="w-3.5 h-3.5" />
                      </button>
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
