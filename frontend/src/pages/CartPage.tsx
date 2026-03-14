import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { get, post } from "../api/client";
import { Minus, Plus, Trash2, ShoppingCart, Check, AlertCircle, CreditCard, Banknote, ArrowLeft } from "lucide-react";

type Step = "cart" | "payment" | "cash" | "done";

export function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, total, count } = useCart();
  const { user } = useAuth();
  const [branches, setBranches] = useState<any[]>([]);
  const [branchid, setBranchid] = useState(1);
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState("");

  const [step, setStep] = useState<Step>("cart");
  const [paymentMethod, setPaymentMethod] = useState<"Карта" | "Готівка">("Карта");
  const [orderId, setOrderId] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);

  // Cash payment
  const [cashAmount, setCashAmount] = useState("");
  const [change, setChange] = useState<number | null>(null);
  const [cashError, setCashError] = useState("");

  useEffect(() => {
    get("/api/branches").then((b) => {
      setBranches(b);
      if (b.length > 0) setBranchid(b[0].branchid);
    });
  }, []);

  const handleOrder = async () => {
    setOrdering(true);
    setError("");
    try {
      const res = await post("/api/orders", {
        branchid,
        items: items.map((i) => ({ bookid: i.bookid, quantity: i.quantity })),
        paymentmethod: paymentMethod,
      });
      setOrderId(res.orderid);
      setOrderTotal(res.total);
      clearCart();

      if (paymentMethod === "Карта") {
        setStep("done");
      } else {
        setStep("cash");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOrdering(false);
    }
  };

  const handleCashPay = () => {
    setCashError("");
    const amount = parseFloat(cashAmount);
    if (isNaN(amount) || amount <= 0) {
      setCashError("Введіть суму");
      return;
    }
    if (amount < orderTotal) {
      setCashError(`Недостатньо. Потрібно ${orderTotal.toFixed(2)} грн`);
      return;
    }
    setChange(amount - orderTotal);
    setStep("done");
  };

  // Step: cash input
  if (step === "cash") {
    return (
      <div className="max-w-md mx-auto px-6 py-16">
        <div className="bg-white border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-oak-100 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-oak-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text">Оплата готівкою</h2>
              <p className="text-sm text-text-muted">Замовлення #{orderId}</p>
            </div>
          </div>

          <div className="bg-oak-50 border border-oak-200 p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">До сплати:</span>
              <span className="text-2xl font-bold text-text">{orderTotal.toFixed(2)} грн</span>
            </div>
          </div>

          <label className="block text-sm font-medium text-text mb-1.5">Сума від покупця (грн)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={cashAmount}
            onChange={(e) => { setCashAmount(e.target.value); setCashError(""); }}
            placeholder={orderTotal.toFixed(2)}
            autoFocus
            className="w-full px-3 py-2.5 border border-border text-lg focus:outline-none focus:border-oak-500 mb-2"
          />
          {cashError && (
            <p className="text-sm text-red-500 mb-3">{cashError}</p>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {[50, 100, 200, 500, 1000].map((v) => (
              <button key={v} onClick={() => setCashAmount(String(v))}
                className="px-3 py-1.5 text-sm border border-border hover:bg-oak-50 transition-colors">
                {v} грн
              </button>
            ))}
          </div>

          <button onClick={handleCashPay}
            className="w-full py-2.5 bg-oak-800 text-white font-medium hover:bg-oak-900 transition-colors border border-oak-800">
            Прийняти оплату
          </button>
        </div>
      </div>
    );
  }

  // Step: done
  if (step === "done") {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-text mb-2">Оплата успішна!</h1>
        <p className="text-text-muted mb-2">Замовлення #{orderId}</p>

        <div className="bg-white border border-border p-4 text-left mb-6 mx-auto max-w-xs">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-text-muted">Спосіб:</span>
            <span className="text-text font-medium">{paymentMethod}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-text-muted">Сума:</span>
            <span className="text-text font-medium">{orderTotal.toFixed(2)} грн</span>
          </div>
          {change !== null && (
            <>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-muted">Отримано:</span>
                <span className="text-text font-medium">{parseFloat(cashAmount).toFixed(2)} грн</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-border pt-1 mt-1">
                <span className="text-text">Решта:</span>
                <span className="text-emerald-600">{change.toFixed(2)} грн</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link to="/orders" className="px-5 py-2.5 bg-oak-800 text-white font-medium hover:bg-oak-900 border border-oak-800 no-underline">
            Мої замовлення
          </Link>
          <Link to="/catalog" className="px-5 py-2.5 border border-border text-text-secondary font-medium hover:bg-oak-50 no-underline">
            Продовжити покупки
          </Link>
        </div>
      </div>
    );
  }

  // Step: empty cart
  if (items.length === 0 && step === "cart") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <ShoppingCart className="w-16 h-16 text-oak-200 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text mb-2">Кошик порожній</h1>
        <p className="text-text-muted mb-6">Додайте книги з каталогу</p>
        <Link to="/catalog" className="px-5 py-2.5 bg-oak-800 text-white font-medium hover:bg-oak-900 border border-oak-800 no-underline">
          До каталогу
        </Link>
      </div>
    );
  }

  // Step: cart + payment selection
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-text mb-6">Кошик ({count})</h1>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Items */}
        <div className="flex-1 space-y-3">
          {items.map((item) => (
            <div key={item.bookid} className="flex items-center gap-4 p-4 bg-white border border-border">
              <div className="w-16 h-20 bg-linear-to-br from-oak-600 to-oak-800 shrink-0 flex items-end p-2">
                <p className="text-[8px] text-white font-medium leading-tight">{item.title}</p>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text truncate">{item.title}</h3>
                <p className="text-xs text-text-muted">{item.author}</p>
                <p className="text-xs text-text-muted">{item.format}</p>
              </div>
              <div className="flex items-center">
                <button onClick={() => updateQuantity(item.bookid, item.quantity - 1)}
                  className="px-2 py-1 border border-border hover:bg-oak-50">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center text-sm border-t border-b border-border py-1">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.bookid, item.quantity + 1)}
                  className="px-2 py-1 border border-border hover:bg-oak-50">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="text-right w-24">
                <p className="text-sm font-bold text-text">{(item.price * item.quantity).toFixed(2)} грн</p>
                <p className="text-xs text-text-muted">{item.price} x {item.quantity}</p>
              </div>
              <button onClick={() => removeItem(item.bookid)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary + Payment */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white border border-border p-5 sticky top-20">
            <h3 className="font-bold text-text mb-4">Оформлення</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-text mb-1.5">Філія</label>
              <select value={branchid} onChange={(e) => setBranchid(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-border text-sm focus:outline-none focus:border-oak-500">
                {branches.map((b: any) => (
                  <option key={b.branchid} value={b.branchid}>{b.city}, {b.address}</option>
                ))}
              </select>
            </div>

            {/* Payment method */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text mb-1.5">Спосіб оплати</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod("Карта")}
                  className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium border transition-colors ${
                    paymentMethod === "Карта"
                      ? "bg-oak-800 text-white border-oak-800"
                      : "bg-white text-text-secondary border-border hover:bg-oak-50"
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Карта
                </button>
                <button
                  onClick={() => setPaymentMethod("Готівка")}
                  className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium border transition-colors ${
                    paymentMethod === "Готівка"
                      ? "bg-oak-800 text-white border-oak-800"
                      : "bg-white text-text-secondary border-border hover:bg-oak-50"
                  }`}
                >
                  <Banknote className="w-4 h-4" /> Готівка
                </button>
              </div>
            </div>

            <div className="border-t border-border pt-4 mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-muted">Товарів:</span>
                <span className="text-text">{count}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-text">Разом:</span>
                <span className="text-text">{total.toFixed(2)} грн</span>
              </div>
            </div>

            <button
              onClick={handleOrder}
              disabled={ordering}
              className="w-full py-2.5 bg-oak-800 text-white font-medium hover:bg-oak-900 transition-colors border border-oak-800 disabled:opacity-50"
            >
              {ordering ? "Оформлення..." : paymentMethod === "Карта" ? "Оплатити карткою" : "Оформити замовлення"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
