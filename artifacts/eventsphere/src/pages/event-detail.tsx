import { useParams, Link } from "wouter";
import { Calendar, MapPin, Users, ArrowLeft, Bookmark, Star, Globe, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import { useGetEvent, getGetEventQueryKey } from "@workspace/api-client-react";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " • " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-muted stroke-muted"}`} />
      ))}
    </div>
  );
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = Number(id);

  const { data: event, isLoading } = useGetEvent(eventId, {
    query: { enabled: !!eventId, queryKey: getGetEventQueryKey(eventId) }
  });

  if (isLoading) {
    return (
      <div data-testid="event-detail-loading">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-64 rounded-xl" />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-3"><Skeleton className="h-8" /><Skeleton className="h-4" /><Skeleton className="h-32" /></div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div data-testid="event-not-found">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-2">Event not found</h1>
          <Link href="/explore"><Button>Browse Events</Button></Link>
        </div>
      </div>
    );
  }

  const slotsLeft = event.capacity - event.registeredCount;
  const pct = Math.round((event.registeredCount / event.capacity) * 100);
  const isFull = slotsLeft <= 0;

  return (
    <div className="min-h-screen bg-background" data-testid="event-detail-page">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4" data-testid="breadcrumb">
          <Link href="/explore" className="hover:text-foreground">Explore Events</Link>
          <span>/</span>
          <span className="text-foreground">{event.title}</span>
        </div>

        {/* Hero Image */}
        <div className="relative rounded-xl overflow-hidden h-64 md:h-80 mb-6 bg-muted">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
          )}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="text-xs">{event.category}</Badge>
          </div>
          <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white" data-testid="bookmark-btn">
            <Bookmark className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground mb-2" data-testid="event-title">{event.title}</h1>
              <p className="text-muted-foreground text-sm">{event.description}</p>
            </div>

            {/* Organizer */}
            <div className="flex items-center justify-between bg-muted/40 rounded-xl p-3 border border-border">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs bg-primary/20 text-primary">
                    {event.organizerName?.charAt(0) ?? "O"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-semibold">Hosted by {event.organizerDept}</p>
                  <p className="text-xs text-muted-foreground">{event.organizerName}, Head Coordinator</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs" data-testid="contact-organizer">Contact</Button>
            </div>

            {/* About */}
            <div>
              <h2 className="text-base font-bold mb-2">About this event</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{event.description}</p>
              <p className="text-sm font-medium mb-1">What to expect:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2"><span className="text-primary">▸</span> Keynote sessions from industry leaders</li>
                <li className="flex items-center gap-2"><span className="text-primary">▸</span> Hands-on workshops on AI and Web Development</li>
                <li className="flex items-center gap-2"><span className="text-primary">▸</span> 24-hour hackathon with exciting prizes</li>
                <li className="flex items-center gap-2"><span className="text-primary">▸</span> Networking opportunities with top recruiters</li>
              </ul>
            </div>

            {/* Media Gallery */}
            {event.mediaGallery && event.mediaGallery.length > 0 && (
              <div>
                <h2 className="text-base font-bold mb-3">Media Gallery</h2>
                <div className="grid grid-cols-3 gap-2">
                  {event.mediaGallery.slice(0, 4).map((url, i) => (
                    <div key={i} className={`rounded-lg overflow-hidden bg-muted ${i === 0 ? "col-span-2 row-span-2 h-48" : "h-[90px]"}`}>
                      <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" data-testid={`media-${i}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <h2 className="text-base font-bold mb-3">Reviews &amp; Ratings</h2>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl font-extrabold">{event.averageRating?.toFixed(1) ?? "4.8"}</span>
                <div>
                  <StarRating rating={event.averageRating ?? 4.8} />
                  <p className="text-xs text-muted-foreground mt-0.5">({event.reviewCount ?? 124} reviews from past events)</p>
                </div>
              </div>
              <div className="space-y-4">
                {(event.reviews ?? []).map((review) => (
                  <div key={review.id} className="pb-4 border-b border-border last:border-0" data-testid={`review-${review.id}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={review.avatarUrl ?? undefined} />
                        <AvatarFallback className="text-xs">{review.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-semibold">{review.userName}</p>
                        <p className="text-[10px] text-muted-foreground">Last year</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
                {(event.reviews ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No reviews yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right column — registration card */}
          <div>
            <div className="sticky top-20 bg-card border border-border rounded-xl p-5 shadow-sm" data-testid="registration-card">
              <p className="text-2xl font-bold mb-1">{event.price === 0 || event.price === null ? "Free" : `$${event.price}`}</p>

              <div className="space-y-2.5 mb-4 text-sm">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Date &amp; Time</p>
                    <p className="text-xs">{formatDate(event.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Venue</p>
                    <p className="text-xs">{event.venue}</p>
                    <button className="text-xs text-primary hover:underline">View on map</button>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-foreground">Slots remaining</span>
                  <span className={isFull ? "text-red-500 font-medium" : "text-foreground"}>
                    {event.registeredCount} / {event.capacity}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isFull ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-primary"}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                {pct > 80 && !isFull && (
                  <p className="text-xs text-amber-600 mt-1">Filling up fast! Registration closes in 3 days.</p>
                )}
              </div>

              <Button className="w-full mb-2" disabled={isFull} data-testid="register-now-btn">
                {isFull ? "Join Waitlist" : "Register Now"}
              </Button>
              <Button variant="outline" className="w-full text-xs gap-2" data-testid="add-to-calendar">
                <Calendar className="w-3.5 h-3.5" /> Add to Calendar
              </Button>

              <div className="mt-4">
                <p className="text-xs text-muted-foreground text-center mb-2">Share with friends</p>
                <div className="flex items-center justify-center gap-2">
                  {["Twitter", "LinkedIn", "WhatsApp", "Email"].map((s) => (
                    <button key={s} className="w-7 h-7 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center" data-testid={`share-${s.toLowerCase()}`}>
                      <Share2 className="w-3 h-3 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
