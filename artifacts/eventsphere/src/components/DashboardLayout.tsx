import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Calendar, Users, BarChart2, Bell, Settings,
  Shield, CheckSquare, UserCog, Globe, AlertTriangle, Bookmark,
  FileText, Megaphone, Search, ScanLine
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ReactNode; badge?: number };

const participantNav: NavItem[] = [
  { href: "/dashboard/participant", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/explore", label: "Discover Events", icon: <Search className="w-4 h-4" /> },
  { href: "/dashboard/participant", label: "My Schedule", icon: <Calendar className="w-4 h-4" /> },
];
const participantResources: NavItem[] = [
  { href: "/dashboard/participant", label: "Certificates", icon: <FileText className="w-4 h-4" /> },
  { href: "/dashboard/participant", label: "Saved Events", icon: <Bookmark className="w-4 h-4" /> },
  { href: "/dashboard/participant", label: "Feedback History", icon: <BarChart2 className="w-4 h-4" /> },
];

const organizerNav: NavItem[] = [
  { href: "/dashboard/organizer", label: "Dashboard Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/dashboard/organizer", label: "My Events", icon: <Calendar className="w-4 h-4" /> },
  { href: "/dashboard/organizer", label: "Participants", icon: <Users className="w-4 h-4" /> },
];
const organizerManagement: NavItem[] = [
  { href: "/dashboard/analytics", label: "Analytics & Reports", icon: <BarChart2 className="w-4 h-4" /> },
  { href: "/dashboard/organizer", label: "Announcements", icon: <Megaphone className="w-4 h-4" /> },
  { href: "/dashboard/organizer", label: "Settings", icon: <Settings className="w-4 h-4" /> },
];

const adminNav: NavItem[] = [
  { href: "/dashboard/admin", label: "System Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/dashboard/admin", label: "Event Approvals", icon: <CheckSquare className="w-4 h-4" />, badge: 14 },
  { href: "/dashboard/admin", label: "User Management", icon: <UserCog className="w-4 h-4" /> },
];
const adminSecurity: NavItem[] = [
  { href: "/dashboard/admin", label: "Content Moderation", icon: <Shield className="w-4 h-4" /> },
  { href: "/dashboard/analytics", label: "Global Analytics", icon: <BarChart2 className="w-4 h-4" /> },
  { href: "/dashboard/admin", label: "System Settings", icon: <Settings className="w-4 h-4" /> },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  type: "participant" | "organizer" | "admin";
  userName?: string;
  userRole?: string;
  userAvatar?: string;
}

export default function DashboardLayout({ children, type, userName, userRole, userAvatar }: DashboardLayoutProps) {
  const [location] = useLocation();

  let primaryNav: NavItem[] = [];
  let secondaryNav: NavItem[] = [];
  let primaryLabel = "";
  let secondaryLabel = "";

  if (type === "participant") {
    primaryNav = participantNav;
    secondaryNav = participantResources;
    primaryLabel = "MAIN MENU";
    secondaryLabel = "RESOURCES";
  } else if (type === "organizer") {
    primaryNav = organizerNav;
    secondaryNav = organizerManagement;
    primaryLabel = "ORGANIZER MENU";
    secondaryLabel = "MANAGEMENT";
  } else {
    primaryNav = adminNav;
    secondaryNav = adminSecurity;
    primaryLabel = "ADMIN CONTROLS";
    secondaryLabel = "OPERATIONS & SECURITY";
  }

  return (
    <div className="flex min-h-screen bg-background" data-testid="dashboard-layout">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-card flex flex-col" data-testid="dashboard-sidebar">
        <div className="p-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2 font-bold text-base">
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold",
              type === "admin" ? "bg-blue-600" : "bg-primary"
            )}>
              <Globe className="w-4 h-4" />
            </div>
            EventSphere
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">{primaryLabel}</p>
            {primaryNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                data-testid={`sidebar-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={cn(
                  "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
                  location === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {item.icon}
                {item.label}
                {item.badge && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">{secondaryLabel}</p>
            {secondaryNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                data-testid={`sidebar-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={cn(
                  "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
                  location === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer" data-testid="sidebar-user">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary overflow-hidden">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
              ) : (
                userName?.charAt(0) ?? "U"
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{userName ?? "User"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{userRole ?? "Member"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
