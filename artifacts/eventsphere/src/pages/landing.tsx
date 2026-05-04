import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Search, ChevronRight, Code2, Music, Trophy, BookOpen, Zap, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { useGetFeaturedEvents, useGetEventCategories } from "@workspace/api-client-react";

const categoryIcons: Record<string, ReactNode> = {
  Technical: <Code2 className="w-6 h-6 text-blue-600" />,
  Cultural: <Music className="w-6 h-6 text-pink-600" />,
  Sports: <Trophy className="w-6 h-6 text-green-600" />,
  Workshops: <BookOpen className="w-6 h-6 text-amber-600" />,
  Hackathons: <Zap className="w-6 h-6 text-purple-600" />,
  Seminars: <Mic className="w-6 h-6 text-teal-600" />,
};

const categoryBg: Record<string, string> = {
  Technical: "bg-blue-50",
  Cultural: "bg-pink-50",
  Sports: "bg-green-50",
  Workshops: "bg-amber-50",
  Hackathons: "bg-purple-50",
  Seminars: "bg-teal-50",
};

export default function LandingPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [, setLocation] = useLocation();

  const featuredEvents = useGetFeaturedEvents();
  const categories = useGetEventCategories();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "all") params.set("category", category);
    setLocation(`/explore?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-background" data-testid="landing-page">
      <Navbar />

      {/* Announcement Banner */}
      <div className="bg-primary text-primary-foreground text-xs text-center py-2 px-4 flex items-center justify-center gap-2">
        <span className="bg-white/20 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide">New</span>
        TechFest 2024 early bird registrations are now open!
        <Link href="/explore" className="underline font-medium">Register now →</Link>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white py-20 px-4" data-testid="hero-section">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Discover &amp; Experience<br />Amazing College Events
          </h1>
          <p className="text-indigo-200 text-base md:text-lg mb-10 max-w-xl mx-auto">
            Your centralized platform for managing, discovering, and participating in college events, workshops, and hackathons.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto" data-testid="hero-search-form">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for events, workshops, or organizers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white text-foreground h-10"
                data-testid="hero-search-input"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-40 bg-white text-foreground h-10" data-testid="hero-category-select">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Cultural">Cultural</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Workshops">Workshops</SelectItem>
                <SelectItem value="Hackathons">Hackathons</SelectItem>
                <SelectItem value="Seminars">Seminars</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" size="sm" className="h-10 bg-white text-primary hover:bg-white/90 font-semibold" data-testid="hero-search-btn">
              Find Events
            </Button>
          </form>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-14 px-4 bg-muted/30" data-testid="categories-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-8">Browse by Category</h2>
          {categories.isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {(Array.isArray(categories.data) ? categories.data : []).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/explore?category=${cat.name}`}
                  data-testid={`category-${cat.slug}`}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl p-4 border border-border hover:shadow-md transition-all cursor-pointer ${categoryBg[cat.name] ?? "bg-white"}`}
                >
                  {categoryIcons[cat.name] ?? <BookOpen className="w-6 h-6 text-muted-foreground" />}
                  <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                  <span className="text-xs text-muted-foreground">{cat.eventCount} Events</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-14 px-4" data-testid="featured-events-section">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Featured Events</h2>
            <Link href="/explore" className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View all events <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {featuredEvents.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(Array.isArray(featuredEvents.data) ? featuredEvents.data : []).map((event) => (
                <EventCard key={event.id} event={event} showRegister={false} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-muted/30 text-center" data-testid="cta-section">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-3">Ready to host your own event?</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Join thousands of organizers managing successful events on EventSphere. Create, manage, and scale your college events effortlessly.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/signup">
              <Button data-testid="cta-create-event">Create an Event</Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" data-testid="cta-learn-more">Learn More</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
