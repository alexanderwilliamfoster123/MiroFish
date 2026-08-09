import { useEffect, useRef, useState } from "react";

// Photo albums: dark clothbound covers on the shelf; opening one enters a
// white world — one photograph floating per page, and each page tips in
// like a turning leaf as you scroll.

interface Photo {
  src: string;
  caption: string;
}

interface Album {
  title: string;
  date: string;
  photos: Photo[];
}

// photos resolve from an embedded map when the site is packaged as a single
// offline file (e.g. the hosted single-file build); otherwise from unsplash
declare global {
  interface Window {
    __EMBEDDED_PHOTOS?: Record<string, string>;
  }
}

const u = (id: string) =>
  window.__EMBEDDED_PHOTOS?.[id] ??
  `https://images.unsplash.com/${id}?q=80&w=1400&auto=format&fit=crop`;

const ALBUMS: Album[] = [
  {
    title: "album 01 — mountains",
    date: "2026",
    photos: [
      { src: u("photo-1506905925346-21bda4d32df4"), caption: "the ridge at dusk" },
      { src: u("photo-1519681393784-d120267933ba"), caption: "snow under stars" },
      { src: u("photo-1472214103451-9374bd1c798e"), caption: "the long valley" },
      { src: u("photo-1470071459604-3b5ec3a7fe05"), caption: "fog coming over" },
    ],
  },
  {
    title: "album 02 — water",
    date: "2025",
    photos: [
      { src: u("photo-1501785888041-af3ef285b470"), caption: "golden hour, lake" },
      { src: u("photo-1500485035595-cbe6f645feb1"), caption: "the far shore" },
      { src: u("photo-1496568816309-51d7c20e3b21"), caption: "reeds at dawn" },
    ],
  },
  {
    title: "album 03 — woods",
    date: "2025",
    photos: [
      { src: u("photo-1441974231531-c6227db76b6e"), caption: "light through pines" },
      { src: u("photo-1469474968028-56623f02e42e"), caption: "the quiet path" },
      { src: u("photo-1518173946687-a4c8892bbd9f"), caption: "undergrowth" },
      { src: u("photo-1465146344425-f00d5f5c8f07"), caption: "field at the edge" },
    ],
  },
  {
    title: "album 04 — night",
    date: "2024",
    photos: [
      { src: u("photo-1444703686981-a3abbc4d4fe3"), caption: "the whole sky" },
      { src: u("photo-1518020382113-a7e8fc38eac9"), caption: "far from town" },
      { src: u("photo-1493246507139-91e8fad9978e"), caption: "last light" },
    ],
  },
];

// one page of the open album — tips in like a turning leaf when scrolled into view
function AlbumPage({
  photo,
  pageNo,
  total,
}: {
  photo: Photo;
  pageNo: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.45 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flex h-full snap-start flex-col items-center justify-center px-6"
      style={{ perspective: "1400px" }}
    >
      <figure
        className="flex flex-col items-center"
        style={{
          transform: inView
            ? "rotateX(0deg) translateY(0) scale(1)"
            : "rotateX(-24deg) translateY(60px) scale(0.94)",
          opacity: inView ? 1 : 0,
          transformOrigin: "center 80%",
          transition:
            "transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.7s ease",
        }}
      >
        <img
          src={photo.src}
          alt={photo.caption}
          className="max-h-[64vh] max-w-[86vw] rounded-[3px] object-contain sm:max-w-[70vw]"
          style={{ boxShadow: "0 30px 70px rgba(28,26,23,0.35)" }}
        />
        <figcaption className="mt-6 font-serif text-[14px] italic opacity-70">
          {photo.caption}
        </figcaption>
        <p className="mt-2 text-[11px] tracking-[0.2em] opacity-40">
          {pageNo} / {total}
        </p>
      </figure>
    </div>
  );
}

export function PicturesPage() {
  const [open, setOpen] = useState<Album | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-24 pb-44">
      <p className="animate-fade-up text-[11px] tracking-[0.25em] text-faint uppercase">
        Pictures
      </p>
      <h1
        className="animate-fade-up mt-4 font-serif text-4xl font-light"
        style={{ animationDelay: "0.1s" }}
      >
        The albums
      </h1>
      <p
        className="animate-fade-up mt-5 max-w-md text-[15px] font-light text-muted-foreground"
        style={{ animationDelay: "0.2s" }}
      >
        Open an album and step into its world. Scroll to turn the pages.
      </p>

      <div className="mt-12 grid grid-cols-2 gap-6 sm:gap-8">
        {ALBUMS.map((album, i) => (
          <button
            key={album.title}
            type="button"
            onClick={() => setOpen(album)}
            className="group animate-fade-up cursor-pointer text-left"
            style={{ animationDelay: `${0.25 + i * 0.08}s` }}
          >
            {/* clothbound cover */}
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-md border border-white/10 transition-all duration-500 group-hover:-translate-y-1.5"
              style={{
                background: "linear-gradient(160deg, #1a1a1c 0%, #121214 70%)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
              }}
            >
              {/* spine */}
              <div className="absolute inset-y-0 left-0 w-[10px] border-r border-white/10 bg-black/40" />
              {/* photo window */}
              <div className="absolute inset-x-[22%] top-[16%] bottom-[34%] overflow-hidden rounded-[2px] border border-white/15">
                <img
                  src={album.photos[0].src}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover opacity-80 grayscale transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
                />
              </div>
              {/* paper label */}
              <div
                className="absolute inset-x-[26%] bottom-[10%] rounded-[2px] px-2 py-1.5 text-center"
                style={{ background: "#e8e2d6", color: "#2b2721" }}
              >
                <p className="truncate font-serif text-[11px] italic">{album.title}</p>
                <p className="text-[9px] tracking-[0.2em] opacity-60">{album.date}</p>
              </div>
            </div>
            <p className="mt-3 text-[11px] tracking-[0.16em] text-faint lowercase">
              {album.photos.length} photographs
            </p>
          </button>
        ))}
      </div>

      {/* the white world */}
      {open && (
        <div
          className="animate-fade-in fixed inset-0 z-[80]"
          style={{ background: "#f4f2ee", color: "#1c1a17", animationDuration: "0.5s" }}
          role="dialog"
          aria-modal="true"
          aria-label={open.title}
        >
          <header className="pointer-events-none fixed inset-x-0 top-0 z-10 flex items-baseline justify-between px-6 py-5">
            <p className="font-serif text-[14px] italic opacity-70">{open.title}</p>
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="pointer-events-auto cursor-pointer text-[11px] tracking-[0.22em] uppercase opacity-50 transition-opacity hover:opacity-100"
            >
              close ✕
            </button>
          </header>
          <div
            className="h-full snap-y snap-mandatory overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {open.photos.map((photo, index) => (
              <AlbumPage
                key={photo.src}
                photo={photo}
                pageNo={index + 1}
                total={open.photos.length}
              />
            ))}
          </div>
          <p className="pointer-events-none fixed bottom-5 left-1/2 -translate-x-1/2 text-[11px] tracking-[0.22em] uppercase opacity-40">
            scroll to turn · esc to close
          </p>
        </div>
      )}
    </main>
  );
}
