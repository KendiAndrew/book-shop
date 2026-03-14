import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { get } from "../api/client";
import { BookCard } from "../components/BookCard";
import { Search, X, ArrowLeft, ArrowRight } from "lucide-react";

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [genres, setGenres] = useState<any[]>([]);

  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const genreid = searchParams.get("genreid") || "";
  const format = searchParams.get("format") || "";
  const sort = searchParams.get("sort") || "title";

  const fetchBooks = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "12");
    params.set("sort", sort);
    if (search) params.set("search", search);
    if (genreid) params.set("genreid", genreid);
    if (format) params.set("format", format);
    get(`/api/books?${params}`).then((r) => {
      setBooks(r.items);
      setTotal(r.total);
      setPages(r.pages);
    });
  }, [page, search, genreid, format, sort]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    get("/api/genres").then(setGenres);
  }, []);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.set("page", "1");
    setSearchParams(next);
  };

  const goToPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [searchInput, setSearchInput] = useState(search);

  // Build pagination numbers with ellipsis
  const getPageNumbers = () => {
    const nums: (number | string)[] = [];
    if (pages <= 7) {
      for (let i = 1; i <= pages; i++) nums.push(i);
    } else {
      nums.push(1);
      if (page > 3) nums.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) nums.push(i);
      if (page < pages - 2) nums.push("...");
      nums.push(pages);
    }
    return nums;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-text mb-6">Каталог</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Пошук книг, авторів..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setParam("search", searchInput)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border text-sm placeholder:text-text-muted focus:outline-none focus:border-oak-500 transition-colors"
          />
        </div>

        <select
          value={genreid}
          onChange={(e) => setParam("genreid", e.target.value)}
          className="px-3 py-2.5 bg-white border border-border text-sm focus:outline-none focus:border-oak-500"
        >
          <option value="">Усі жанри</option>
          {genres.map((g: any) => (
            <option key={g.genreid} value={g.genreid}>{g.genrename}</option>
          ))}
        </select>

        <select
          value={format}
          onChange={(e) => setParam("format", e.target.value)}
          className="px-3 py-2.5 bg-white border border-border text-sm focus:outline-none focus:border-oak-500"
        >
          <option value="">Усі формати</option>
          <option value="Тверда">Тверда</option>
          <option value="М'яка">М'яка</option>
          <option value="Електронна">Електронна</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setParam("sort", e.target.value)}
          className="px-3 py-2.5 bg-white border border-border text-sm focus:outline-none focus:border-oak-500"
        >
          <option value="title">За назвою</option>
          <option value="price">За ціною</option>
          <option value="publicationyear">За роком</option>
        </select>

        {(search || genreid || format) && (
          <button
            onClick={() => { setSearchParams({}); setSearchInput(""); }}
            className="flex items-center gap-1 px-3 py-2.5 text-sm text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
          >
            <X className="w-3 h-3" /> Скинути
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-text-muted">
          Знайдено: <span className="font-semibold text-text">{total}</span> книг
        </p>
        {pages > 1 && (
          <p className="text-sm text-text-muted">
            Сторінка {page} з {pages}
          </p>
        )}
      </div>

      {/* Grid */}
      {books.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {books.map((book: any) => (
            <BookCard key={book.bookid} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-oak-200 mx-auto mb-3" />
          <p className="text-text-muted">Книг не знайдено</p>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-1 py-8">
          <button
            onClick={() => page > 1 && goToPage(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-2 text-sm border border-border hover:bg-oak-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" /> Назад
          </button>

          {getPageNumbers().map((p, i) =>
            typeof p === "string" ? (
              <span key={`e${i}`} className="w-10 h-10 flex items-center justify-center text-sm text-text-muted">...</span>
            ) : (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`w-10 h-10 text-sm font-medium border transition-colors ${
                  p === page
                    ? "bg-oak-800 text-white border-oak-800"
                    : "border-border text-text-secondary hover:bg-oak-50"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => page < pages && goToPage(page + 1)}
            disabled={page >= pages}
            className="flex items-center gap-1 px-3 py-2 text-sm border border-border hover:bg-oak-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Далі <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
