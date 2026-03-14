import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { get } from "../api/client";
import { BookCard } from "../components/BookCard";
import { BookOpen, ArrowRight, Library, Truck, CreditCard, Shield } from "lucide-react";

function CoverOrFallback({ url, title, className, style }: { url?: string; title: string; className?: string; style?: React.CSSProperties }) {
  const [ok, setOk] = useState(!!url);
  if (url && ok) {
    return (
      <img
        src={url}
        alt={title}
        className={`${className} object-cover`}
        style={style}
        onError={() => setOk(false)}
        onLoad={(e) => { if ((e.target as HTMLImageElement).naturalWidth < 10) setOk(false); }}
      />
    );
  }
  return (
    <div className={`${className} bg-linear-to-br from-oak-500 to-oak-700 flex items-end p-3`} style={style}>
      <p className="text-white text-xs font-medium">{title}</p>
    </div>
  );
}

export function HomePage() {
  const [newBooks, setNewBooks] = useState<any[]>([]);
  const [popularBooks, setPopularBooks] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [stats, setStats] = useState({ books: 0, authors: 0 });

  useEffect(() => {
    get("/api/books?limit=8&sort=price&order=desc").then((r) => setNewBooks(r.items));
    get("/api/books?limit=4&sort=title&order=asc").then((r) => setPopularBooks(r.items));
    get("/api/genres").then(setGenres);
    get("/api/books?limit=1").then((r) => setStats((s) => ({ ...s, books: r.total })));
    get("/api/authors").then((a) => setStats((s) => ({ ...s, authors: a.length })));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-oak-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-oak-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-oak-300 rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-6 py-24 relative z-10">
          <div className="flex items-center justify-between">
            <div className="max-w-xl">
              <p className="text-oak-300 text-sm font-medium uppercase tracking-[0.15em] mb-4">Книгарня</p>
              <h1 className="text-5xl font-bold mb-6 tracking-tight leading-tight">
                Відкрийте світ<br />
                <span className="text-oak-300">книжкових історій</span>
              </h1>
              <p className="text-oak-200 text-lg mb-8 leading-relaxed">
                {stats.books} книг від {stats.authors} авторів. Українська та світова класика,
                сучасна проза, фантастика та детективи.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-oak-900 font-semibold hover:bg-oak-50 transition-colors no-underline"
                >
                  Каталог <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-oak-500 text-oak-200 font-medium hover:bg-oak-800 transition-colors no-underline"
                >
                  Реєстрація
                </Link>
              </div>
            </div>

            {/* Featured covers stack */}
            <div className="hidden lg:flex items-end gap-3 relative">
              {popularBooks.slice(0, 3).map((book, i) => (
                <Link
                  key={book.bookid}
                  to={`/book/${book.bookid}`}
                  className={`block no-underline transition-transform hover:-translate-y-2 ${
                    i === 1 ? "relative z-10" : "opacity-80"
                  }`}
                  style={{ marginTop: i === 1 ? 0 : 40 }}
                >
                  <CoverOrFallback
                    url={book.cover_url}
                    title={book.title}
                    className="w-36 shadow-2xl shadow-black/30"
                    style={{ height: i === 1 ? 240 : 200 }}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Library, title: `${stats.books}+ книг`, desc: "Великий каталог" },
            { icon: Truck, title: "Доставка", desc: "По всій Україні" },
            { icon: CreditCard, title: "Оплата", desc: "Готівка або карта" },
            { icon: Shield, title: "Гарантія", desc: "Якість видання" },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <div className="p-2.5 bg-oak-50 shrink-0">
                <f.icon className="w-5 h-5 text-oak-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text">{f.title}</p>
                <p className="text-xs text-text-muted">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Genres */}
      {genres.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pt-12 pb-6">
          <h2 className="text-xl font-bold text-text mb-4">Жанри</h2>
          <div className="flex flex-wrap gap-2">
            {genres.map((g: any) => (
              <Link
                key={g.genreid}
                to={`/catalog?genreid=${g.genreid}`}
                className="px-4 py-2 bg-oak-50 text-oak-800 text-sm font-medium border border-oak-200 hover:bg-oak-100 hover:border-oak-300 transition-colors no-underline"
              >
                {g.genrename}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Books */}
      {newBooks.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text">Книги каталогу</h2>
            <Link
              to="/catalog"
              className="text-sm text-oak-600 hover:text-oak-800 font-medium flex items-center gap-1 no-underline"
            >
              Усі книги <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newBooks.map((book: any) => (
              <BookCard key={book.bookid} book={book} />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-oak-900 text-oak-300 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-oak-700 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">BookShop</span>
            </div>
            <p className="text-sm text-oak-400">BookShop 2026. Книгарня українських та світових авторів.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
