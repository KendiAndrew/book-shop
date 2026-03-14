import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { get } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ShoppingCart, ArrowLeft, BookOpen, Check, X } from "lucide-react";

export function BookPage() {
  const { id } = useParams();
  const [book, setBook] = useState<any>(null);
  const [imgError, setImgError] = useState(false);
  const { isAuth } = useAuth();
  const { addItem } = useCart();

  useEffect(() => {
    if (id) get(`/api/books/${id}`).then(setBook);
  }, [id]);

  if (!book) return <div className="max-w-4xl mx-auto px-6 py-12 text-text-muted">Завантаження...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Link to="/catalog" className="inline-flex items-center gap-1 text-sm text-oak-600 hover:text-oak-800 mb-6 no-underline">
        <ArrowLeft className="w-4 h-4" /> Назад до каталогу
      </Link>

      <div className="flex gap-8 flex-col md:flex-row">
        {/* Cover */}
        <div className="w-full md:w-72 shrink-0">
          {book.cover_url && !imgError ? (
            <div className="aspect-2/3 relative overflow-hidden border border-border">
              <img
                src={book.cover_url}
                alt={book.title}
                onError={() => setImgError(true)}
                onLoad={(e) => { if ((e.target as HTMLImageElement).naturalWidth < 10) setImgError(true); }}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-2/3 bg-linear-to-br from-oak-600 to-oak-900 flex flex-col justify-between p-6 text-white">
              <BookOpen className="w-8 h-8 opacity-40" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] opacity-60 mb-2">{book.author}</p>
                <h2 className="text-lg font-bold">{book.title}</h2>
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text mb-1">{book.title}</h1>
          <p className="text-text-secondary mb-4">{book.author}</p>

          <div className="flex items-center gap-2 mb-6">
            {book.quantity > 0 ? (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3" /> В наявності ({book.quantity})
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold border border-red-200 flex items-center gap-1">
                <X className="w-3 h-3" /> Немає в наявності
              </span>
            )}
            <span className="px-2.5 py-1 bg-oak-50 text-oak-700 text-xs font-medium border border-oak-200">{book.format}</span>
          </div>

          <table className="w-full text-sm mb-6">
            <tbody>
              {[
                ["Жанр", book.genre],
                ["Видавництво", book.publisher],
                ["Мова", book.language],
                ["Рік видання", book.publicationyear],
                ["Сторінок", book.pagecount],
                ["Формат", book.format],
              ].map(([label, value]) => (
                <tr key={label} className="border-b border-border">
                  <td className="py-2 text-text-muted w-40">{label}</td>
                  <td className="py-2 text-text font-medium">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center gap-4">
            <div>
              <span className="text-3xl font-bold text-text">{book.price}</span>
              <span className="text-sm text-text-muted ml-1">грн</span>
            </div>
            {isAuth && book.quantity > 0 && (
              <button
                onClick={() =>
                  addItem({
                    bookid: book.bookid,
                    title: book.title,
                    author: book.author,
                    price: Number(book.price),
                    format: book.format,
                  })
                }
                className="flex items-center gap-2 px-6 py-3 bg-oak-800 text-white font-medium hover:bg-oak-900 transition-colors border border-oak-800"
              >
                <ShoppingCart className="w-4 h-4" /> До кошика
              </button>
            )}
            {!isAuth && (
              <Link
                to="/login"
                className="px-6 py-3 bg-oak-50 text-oak-800 font-medium border border-oak-200 hover:bg-oak-100 transition-colors no-underline text-sm"
              >
                Увійдіть для покупки
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
