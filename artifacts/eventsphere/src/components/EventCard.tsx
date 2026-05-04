import { Link } from "wouter";
import { Calendar, MapPin, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/api-service";

interface Event {
  id: number;
  title: string;
  category: string;
  venue: string;
  startDate: string;
  capacity: number;
  registeredCount: number;
  status: string;
  imageUrl?: string | null;
  price: number;
}

interface EventCardProps {
  event: Event;
  showRegister?: boolean;
}

const categoryColors: Record<string, string> = {
  Technical: "bg-blue-100 text-blue-700",
  Cultural: "bg-pink-100 text-pink-700",
  Sports: "bg-green-100 text-green-700",
  Workshops: "bg-amber-100 text-amber-700",
  Hackathons: "bg-purple-100 text-purple-700",
  Seminars: "bg-teal-100 text-teal-700",
};

const progressColors: Record<string, string> = {
  Technical: "bg-blue-500",
  Cultural: "bg-pink-500",
  Sports: "bg-green-500",
  Workshops: "bg-amber-500",
  Hackathons: "bg-red-500",
  Seminars: "bg-teal-500",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function EventCard({ event, showRegister = true }: EventCardProps) {
  const pct = Math.round((event.registeredCount / event.capacity) * 100);
  const isWaitlist = event.status === "ongoing" && pct >= 100;
  const isFull = event.registeredCount >= event.capacity;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow" data-testid={`event-card-${event.id}`}>
      <div className="relative h-44 bg-muted">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl.startsWith('http') ? event.imageUrl : `${API_URL}${event.imageUrl}`} 
            alt={event.title} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              const parent = img.parentElement;
              if (parent && !parent.querySelector('.image-fallback')) {
                const fallback = document.createElement('div');
                fallback.className = 'image-fallback w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center';
                fallback.innerHTML = `<span class="text-primary/40 text-xs font-medium">${event.category}</span>`;
                parent.appendChild(fallback);
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <div className="absolute top-2 left-2">
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded", categoryColors[event.category] ?? "bg-gray-100 text-gray-700")}>
            {event.category}
          </span>
        </div>
        <button className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors" data-testid={`bookmark-event-${event.id}`}>
          <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-sm text-foreground leading-tight mb-2" data-testid={`event-title-${event.id}`}>
          {event.title}
        </h3>
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 shrink-0" />
            {formatDate(event.startDate)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />
            {event.venue}
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            {isWaitlist || isFull ? (
              <span className="text-red-500 font-semibold">Waitlist Open</span>
            ) : (
              <span className="text-muted-foreground">Slots remaining</span>
            )}
            <span className={cn("font-medium", isFull ? "text-red-500" : "text-foreground")}>
              {event.registeredCount} / {event.capacity}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", isFull ? "bg-red-500" : progressColors[event.category] ?? "bg-primary")}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>

        {showRegister && (
          <div className="flex gap-2">
            <Link href={`/events/${event.id}`} className="flex-1">
              <Button
                size="sm"
                variant={isFull ? "outline" : "default"}
                className="w-full text-xs"
                data-testid={`register-btn-${event.id}`}
              >
                {isFull ? "Join Waitlist" : "Register"}
              </Button>
            </Link>
            <Link href={`/events/${event.id}`}>
              <Button size="sm" variant="outline" className="px-2" data-testid={`view-event-${event.id}`}>
                <span className="text-xs">↗</span>
              </Button>
            </Link>
          </div>
        )}

        {!showRegister && (
          <Link href={`/events/${event.id}`}>
            <Button size="sm" variant="outline" className="w-full text-xs" data-testid={`view-details-${event.id}`}>
              View Details
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
