import { Link } from "react-router-dom";
import { ShoppingCart, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState } from "react";

interface BookCardProps {
  book: any;
}

export function BookCard({ book }: BookCardProps) {
  const { isAuth } = useAuth();
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);

  const hasCover = book.cover_url && !imgError;

  return (
    <div className="group bg-white border border-border hover:shadow-xl hover:shadow-oak-900/8 hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Cover */}
      <Link to={`/book/${book.bookid}`} className="block no-underline relative overflow-hidden bg-oak-50">
        {hasCover ? (
          <div className="aspect-2/3 relative">
            <img
              src={book.cover_url}
              alt={book.title}
              onError={() => setImgError(true)}
              onLoad={(e) => { if ((e.target as HTMLImageElement).naturalWidth < 10) setImgError(true); }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* overlay on hover */}
            <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ) : (
          <div className="aspect-2/3 bg-linear-to-br from-oak-500 to-oak-800 flex flex-col justify-between p-5 relative">
            <BookOpen className="w-6 h-6 text-white/30" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1">{book.author}</p>
              <p className="text-sm font-semibold text-white leading-tight">{book.title}</p>
            </div>
            {/* decorative line */}
            <div className="absolute top-3 left-3 right-3 bottom-3 border border-white/10 pointer-events-none" />
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/book/${book.bookid}`} className="no-underline">
          <h3 className="text-sm font-semibold text-text leading-tight mb-1 line-clamp-2 hover:text-oak-700 transition-colors">{book.title}</h3>
        </Link>
        <p className="text-xs text-text-muted mb-2">{book.author}</p>

        <div className="flex items-center gap-1.5 mb-3">
          <span className="px-1.5 py-0.5 bg-oak-50 text-text-muted text-[11px] font-medium border border-oak-100">{book.format}</span>
          <span className="px-1.5 py-0.5 bg-oak-50 text-text-muted text-[11px] font-medium border border-oak-100">{book.genre}</span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <div>
            <span className="text-lg font-bold text-text">{book.price}</span>
            <span className="text-xs text-text-muted ml-0.5">грн</span>
          </div>
          {book.quantity > 0 ? (
            isAuth ? (
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
                className="p-2 bg-oak-800 text-white hover:bg-oak-900 active:scale-95 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-[11px] text-emerald-600 font-medium">В наявності</span>
            )
          ) : (
            <span className="text-[11px] text-red-500 font-medium">Немає</span>
          )}
        </div>
      </div>
    </div>
  );
}
