import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, X, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { useListEvents, getListEventsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const CATEGORIES = ["Technical", "Cultural", "Sports", "Hackathons", "Seminars", "Workshops"];
const DEPARTMENTS = ["Computer Science", "Electronics", "Mechanical", "Business", "Arts & Humanities"];

export default function ExplorePage() {
  const [location] = useLocation();
  const queryClient = useQueryClient();

  const params = new URLSearchParams(location.includes("?") ? location.split("?")[1] : "");

  const [search, setSearch] = useState(params.get("search") ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(params.get("category") ? [params.get("category")!] : []);
  const [dateRange, setDateRange] = useState("any");
  const [format, setFormat] = useState<string[]>([]);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("upcoming");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  const queryParams = {
    search: search || undefined,
    category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
    format: format.length === 1 ? (format[0] as "in_person" | "online") : undefined,
    department: selectedDepts.length === 1 ? selectedDepts[0] : undefined,
    page,
    limit: 9,
  };

  const events = useListEvents(queryParams, { query: { queryKey: getListEventsQueryKey(queryParams) } });

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
    setPage(1);
  }
  function toggleFormat(f: string) {
    setFormat((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
    setPage(1);
  }
  function toggleDept(d: string) {
    setSelectedDepts((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
    setPage(1);
  }
  function clearAll() {
    setSearch("");
    setSelectedCategories([]);
    setDateRange("any");
    setFormat([]);
    setSelectedDepts([]);
    setPage(1);
  }

  const activeFilters = [
    ...selectedCategories.map((c) => ({ label: c, clear: () => toggleCategory(c) })),
    ...format.map((f) => ({ label: f === "in_person" ? "In-person" : "Online / Virtual", clear: () => toggleFormat(f) })),
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="explore-page">
      <Navbar />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary/5 to-teal-50 border-b border-border py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-extrabold text-primary">Explore Events</h1>
          <p className="text-muted-foreground text-sm mt-1">Discover and register for upcoming college events, workshops, and hackathons.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar Filters */}
        <aside className="w-52 shrink-0 hidden md:block" data-testid="filters-sidebar">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-sm flex items-center gap-1.5"><SlidersHorizontal className="w-4 h-4" /> Filters</span>
            <button onClick={clearAll} className="text-xs text-primary hover:underline" data-testid="clear-all-filters">Clear all</button>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Category</p>
              {CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center gap-2 py-1 cursor-pointer" data-testid={`filter-category-${cat.toLowerCase()}`}>
                  <Checkbox
                    checked={selectedCategories.includes(cat)}
                    onCheckedChange={() => toggleCategory(cat)}
                  />
                  <span className="text-sm">{cat}</span>
                </label>
              ))}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Date Range</p>
              <RadioGroup value={dateRange} onValueChange={(v) => { setDateRange(v); setPage(1); }}>
                {[["any", "Any time"], ["today", "Today"], ["this_week", "This week"], ["this_month", "This month"]].map(([val, lbl]) => (
                  <div key={val} className="flex items-center gap-2 py-1">
                    <RadioGroupItem value={val} id={`date-${val}`} data-testid={`filter-date-${val}`} />
                    <Label htmlFor={`date-${val}`} className="text-sm cursor-pointer">{lbl}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Event Format</p>
              {[["in_person", "In-person"], ["online", "Online / Virtual"]].map(([val, lbl]) => (
                <label key={val} className="flex items-center gap-2 py-1 cursor-pointer" data-testid={`filter-format-${val}`}>
                  <Checkbox checked={format.includes(val)} onCheckedChange={() => toggleFormat(val)} />
                  <span className="text-sm">{lbl}</span>
                </label>
              ))}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Department</p>
              {DEPARTMENTS.map((dept) => (
                <label key={dept} className="flex items-center gap-2 py-1 cursor-pointer" data-testid={`filter-dept-${dept.toLowerCase().replace(/\s/g, "-")}`}>
                  <Checkbox checked={selectedDepts.includes(dept)} onCheckedChange={() => toggleDept(dept)} />
                  <span className="text-sm text-muted-foreground">{dept}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search + Sort Bar */}
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="AI and Machine Learning"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 h-9 text-sm"
                data-testid="explore-search-input"
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 w-32 text-sm" data-testid="sort-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                data-testid="view-grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                data-testid="view-list"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <span className="text-xs text-muted-foreground">Active Filters:</span>
              {activeFilters.map((f) => (
                <Badge key={f.label} variant="secondary" className="gap-1 text-xs" data-testid={`active-filter-${f.label}`}>
                  {f.label}
                  <button onClick={f.clear}><X className="w-3 h-3" /></button>
                </Badge>
              ))}
              <button onClick={clearAll} className="text-xs text-primary hover:underline">Clear all</button>
            </div>
          )}

          {/* Events Grid */}
          {events.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="events-grid">
                {(events.data?.events ?? []).map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
              {(events.data?.events ?? []).length === 0 && (
                <div className="text-center py-16 text-muted-foreground" data-testid="no-events">
                  No events found. Try adjusting your filters.
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {events.data && events.data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-8" data-testid="pagination">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} data-testid="prev-page">
                &lt;
              </Button>
              {Array.from({ length: Math.min(events.data.totalPages, 8) }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={page === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(p)}
                  data-testid={`page-${p}`}
                  className="w-8 h-8 p-0"
                >
                  {p}
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(events.data!.totalPages, p + 1))} disabled={page === events.data.totalPages} data-testid="next-page">
                &gt;
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
