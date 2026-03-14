import { useEffect, useState } from "react";
import { get, post, put, del } from "../../api/client";
import { Plus, Edit3, Trash2, X, Check } from "lucide-react";

const EMPTY = {
  title: "", authorid: 0, genreid: 0, publisherid: 0, format: "Тверда",
  quantity: 0, price: 0, supplierid: undefined as number | undefined,
  publicationyear: 2024, languageid: 0, pagecount: 100, cover_url: "",
};

export function AdminBooksPage() {
  const [books, setBooks] = useState<any>({ items: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [authors, setAuthors] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [publishers, setPublishers] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);

  const fetchBooks = () => get(`/api/books?page=${page}&limit=10`).then(setBooks);

  useEffect(() => {
    fetchBooks();
    get("/api/authors").then(setAuthors);
    get("/api/genres").then(setGenres);
    get("/api/publishers").then(setPublishers);
    get("/api/languages").then(setLanguages);
    get("/api/suppliers").then(setSuppliers);
  }, [page]);

  const openNew = () => {
    setEditing(null);
    setForm({
      ...EMPTY,
      authorid: authors[0]?.authorid || 0,
      genreid: genres[0]?.genreid || 0,
      publisherid: publishers[0]?.publisherid || 0,
      languageid: languages[0]?.languageid || 0,
    });
    setShowForm(true);
  };

  const openEdit = (book: any) => {
    setEditing(book);
    setForm({
      title: book.title, authorid: book.authorid, genreid: book.genreid,
      publisherid: book.publisherid || publishers[0]?.publisherid || 0,
      format: book.format, quantity: book.quantity, price: Number(book.price),
      supplierid: book.supplierid || undefined,
      publicationyear: book.publicationyear, languageid: book.languageid || languages[0]?.languageid || 0,
      pagecount: book.pagecount, cover_url: book.cover_url || "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    const payload = { ...form, cover_url: form.cover_url || undefined };
    if (editing) {
      await put(`/api/books/${editing.bookid}`, payload);
    } else {
      await post("/api/books", payload);
    }
    setShowForm(false);
    fetchBooks();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Видалити книгу?")) return;
    await del(`/api/books/${id}`);
    fetchBooks();
  };

  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Книги ({books.total})</h1>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-oak-800 text-white text-sm font-medium hover:bg-oak-900 border border-oak-800">
          <Plus className="w-4 h-4" /> Додати
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-border p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-text">{editing ? "Редагувати" : "Нова книга"}</h2>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-oak-50"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block font-medium text-text mb-1">Назва</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500" />
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Автор</label>
              <select value={form.authorid} onChange={(e) => set("authorid", Number(e.target.value))}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500">
                {authors.map((a: any) => <option key={a.authorid} value={a.authorid}>{a.firstname} {a.lastname}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Жанр</label>
              <select value={form.genreid} onChange={(e) => set("genreid", Number(e.target.value))}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500">
                {genres.map((g: any) => <option key={g.genreid} value={g.genreid}>{g.genrename}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Видавництво</label>
              <select value={form.publisherid} onChange={(e) => set("publisherid", Number(e.target.value))}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500">
                {publishers.map((p: any) => <option key={p.publisherid} value={p.publisherid}>{p.publishername}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Мова</label>
              <select value={form.languageid} onChange={(e) => set("languageid", Number(e.target.value))}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500">
                {languages.map((l: any) => <option key={l.languageid} value={l.languageid}>{l.languagename}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Формат</label>
              <select value={form.format} onChange={(e) => set("format", e.target.value)}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500">
                <option>Тверда</option><option>М'яка</option><option>Електронна</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Ціна (грн)</label>
              <input type="number" value={form.price} onChange={(e) => set("price", Number(e.target.value))}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500" />
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Кількість</label>
              <input type="number" value={form.quantity} onChange={(e) => set("quantity", Number(e.target.value))}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500" />
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Рік</label>
              <input type="number" value={form.publicationyear} onChange={(e) => set("publicationyear", Number(e.target.value))}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500" />
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Сторінок</label>
              <input type="number" value={form.pagecount} onChange={(e) => set("pagecount", Number(e.target.value))}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block font-medium text-text mb-1">URL обкладинки</label>
              <input value={form.cover_url} onChange={(e) => set("cover_url", e.target.value)}
                placeholder="https://covers.openlibrary.org/b/isbn/..."
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500" />
            </div>
          </div>
          <button onClick={handleSave}
            className="mt-4 flex items-center gap-2 px-5 py-2 bg-oak-800 text-white text-sm font-medium hover:bg-oak-900 border border-oak-800">
            <Check className="w-4 h-4" /> {editing ? "Зберегти" : "Створити"}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-oak-50">
              <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase">Назва</th>
              <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase">Автор</th>
              <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase">Жанр</th>
              <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase">Формат</th>
              <th className="text-right px-4 py-3 font-semibold text-text-secondary text-xs uppercase">Ціна</th>
              <th className="text-right px-4 py-3 font-semibold text-text-secondary text-xs uppercase">К-сть</th>
              <th className="text-right px-4 py-3 font-semibold text-text-secondary text-xs uppercase">Дії</th>
            </tr>
          </thead>
          <tbody>
            {books.items.map((b: any) => (
              <tr key={b.bookid} className="border-b border-border last:border-0 hover:bg-oak-50/50">
                <td className="px-4 py-3 font-medium text-text">{b.title}</td>
                <td className="px-4 py-3 text-text-secondary">{b.author}</td>
                <td className="px-4 py-3"><span className="px-1.5 py-0.5 bg-oak-50 text-xs border border-oak-100">{b.genre}</span></td>
                <td className="px-4 py-3 text-text-secondary">{b.format}</td>
                <td className="px-4 py-3 text-right font-semibold">{b.price} грн</td>
                <td className="px-4 py-3 text-right">{b.quantity}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(b)} className="p-1.5 hover:bg-oak-100"><Edit3 className="w-4 h-4 text-text-muted" /></button>
                  <button onClick={() => handleDelete(b.bookid)} className="p-1.5 hover:bg-red-50"><Trash2 className="w-4 h-4 text-text-muted hover:text-red-500" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {books.pages > 1 && (
        <div className="flex items-center justify-center gap-0 mt-4">
          {Array.from({ length: books.pages }, (_, i) => i + 1).slice(0, 10).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-10 h-10 text-sm font-medium border border-border transition-colors ${
                p === page ? "bg-oak-800 text-white border-oak-800" : "text-text-secondary hover:bg-oak-50"
              }`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
