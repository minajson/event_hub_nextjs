import { useState } from "react";
import { Search, Maximize2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import { useListMedia, getListMediaQueryKey } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  Technical: "bg-blue-600",
  Cultural: "bg-pink-600",
  Sports: "bg-green-600",
  Workshops: "bg-amber-600",
  Hackathons: "bg-purple-600",
  Seminars: "bg-teal-600",
  Academic: "bg-indigo-600",
  Art: "bg-rose-600",
};

export default function GalleryPage() {
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const queryParams = {
    search: search || undefined,
    year: year !== "all" ? year : undefined,
    category: category !== "all" ? category : undefined,
    page,
    limit: 9,
  };

  const { data, isLoading, isFetching } = useListMedia(queryParams, {
    query: { queryKey: getListMediaQueryKey(queryParams) }
  });

  // Fallback gallery items when no data from API
  const fallbackItems = [
    { id: 1, eventTitle: "Spring Fest 2024 - Dance Battle", category: "Cultural", capturedAt: "2024-03-12", imageUrl: "https://picsum.photos/seed/dance/600/800" },
    { id: 2, eventTitle: "Science & Innovation Fair", category: "Academic", capturedAt: "2023-12-05", imageUrl: "https://picsum.photos/seed/science/600/500" },
    { id: 3, eventTitle: "Open Canvas Art Fest", category: "Art", capturedAt: "2023-09-25", imageUrl: "https://picsum.photos/seed/art/600/500" },
    { id: 4, eventTitle: "Global Hackathon Finals", category: "Technical", capturedAt: "2024-02-28", imageUrl: "https://picsum.photos/seed/hack3/600/500" },
    { id: 5, eventTitle: "Star Night Concert", category: "Cultural", capturedAt: "2023-11-20", imageUrl: "https://picsum.photos/seed/concert/600/700" },
    { id: 6, eventTitle: "Championship Awards", category: "Sports", capturedAt: "2023-08-14", imageUrl: "https://picsum.photos/seed/champ/600/500" },
    { id: 7, eventTitle: "Annual Athletics Meet", category: "Sports", capturedAt: "2024-01-15", imageUrl: "https://picsum.photos/seed/athletics/600/700" },
    { id: 8, eventTitle: "Tech Symposium Keynote", category: "Technical", capturedAt: "2023-10-10", imageUrl: "https://picsum.photos/seed/keynote/600/500" },
    { id: 9, eventTitle: "EDM Night Closing", category: "Cultural", capturedAt: "2023-07-30", imageUrl: "https://picsum.photos/seed/edm/600/600" },
  ];

  const items = (data?.items ?? []).length > 0 ? data!.items : fallbackItems;

  return (
    <div className="min-h-screen bg-background" data-testid="gallery-page">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-foreground">Media Gallery</h1>
          <p className="text-muted-foreground text-sm mt-2">Relive the best moments from past events, cultural fests, and hackathons across the campus.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center mb-8" data-testid="gallery-filters">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search memories..."
              className="pl-10 h-9 text-sm"
              data-testid="gallery-search"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground">
            <span>Event:</span>
            <Select value="all" onValueChange={() => {}}>
              <SelectTrigger className="h-8 w-28 text-xs" data-testid="filter-event"><SelectValue placeholder="All Events" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Events</SelectItem></SelectContent>
            </Select>
            <span>Year:</span>
            <Select value={year} onValueChange={(v) => { setYear(v); setPage(1); }}>
              <SelectTrigger className="h-8 w-28 text-xs" data-testid="filter-year"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">2023 - 2024</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
            <span>Category:</span>
            <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
              <SelectTrigger className="h-8 w-32 text-xs" data-testid="filter-category"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Cultural">Cultural</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Masonry Grid */}
        {isLoading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className={cn("w-full rounded-xl", i % 3 === 0 ? "h-64" : "h-44")} />
            ))}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4" data-testid="gallery-grid">
            {items.map((item, i) => (
              <div
                key={item.id}
                className="relative group mb-4 break-inside-avoid rounded-xl overflow-hidden cursor-pointer"
                onClick={() => setLightbox(item.imageUrl)}
                data-testid={`gallery-item-${item.id}`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.eventTitle}
                  className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute top-2 right-2">
                    <button className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center" data-testid={`expand-${item.id}`}>
                      <Maximize2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-start gap-1.5">
                    <span className={cn("text-[9px] font-bold uppercase tracking-wide text-white px-1.5 py-0.5 rounded shrink-0", categoryColors[item.category] ?? "bg-gray-600")}>
                      {item.category}
                    </span>
                  </div>
                  <p className="text-white text-xs font-semibold mt-1 leading-tight">{item.eventTitle}</p>
                  <p className="text-white/60 text-[10px] mt-0.5 flex items-center gap-1">
                    📅 {new Date(item.capturedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={isFetching}
            data-testid="load-more-btn"
          >
            <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
            Load More Memories
          </Button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
          data-testid="lightbox"
        >
          <img src={lightbox} alt="Gallery" className="max-w-full max-h-full rounded-xl object-contain" />
          <button className="absolute top-4 right-4 text-white text-2xl" onClick={() => setLightbox(null)} data-testid="close-lightbox">✕</button>
        </div>
      )}
    </div>
  );
}
