import { useState } from 'react'
import {
  Search, ShoppingCart, Heart, Star, ChevronDown, Plus, Minus,
  BookOpen, Filter, ArrowRight, Eye, Trash2, Edit3, Check,
  X, AlertCircle, Info, CheckCircle, Bell, User, Menu,
  Home, Library, Users, BarChart3, Settings, LogOut, Tag,
  Truck, CreditCard, Package
} from 'lucide-react'

/* ──────────────── mock data ──────────────── */
const MOCK_BOOKS = [
  {
    id: 1,
    title: 'Тіні забутих предків',
    author: 'Михайло Коцюбинський',
    price: 320,
    oldPrice: 420,
    rating: 4.8,
    reviews: 124,
    genre: 'Класика',
    format: 'Тверда',
    inStock: true,
    isNew: false,
    isBestseller: true,
    color: 'from-oak-700 to-oak-900',
  },
  {
    id: 2,
    title: 'Кобзар',
    author: 'Тарас Шевченко',
    price: 280,
    rating: 4.9,
    reviews: 312,
    genre: 'Поезія',
    format: 'Тверда',
    inStock: true,
    isNew: false,
    isBestseller: true,
    color: 'from-oak-600 to-oak-800',
  },
  {
    id: 3,
    title: 'Лісова пісня',
    author: 'Леся Українка',
    price: 245,
    rating: 4.7,
    reviews: 89,
    genre: 'Драма',
    format: "М'яка",
    inStock: true,
    isNew: true,
    isBestseller: false,
    color: 'from-oak-500 to-oak-700',
  },
  {
    id: 4,
    title: 'Місто',
    author: 'Валер\'ян Підмогильний',
    price: 195,
    rating: 4.5,
    reviews: 56,
    genre: 'Роман',
    format: 'Електронна',
    inStock: true,
    isNew: true,
    isBestseller: false,
    color: 'from-oak-800 to-oak-900',
  },
  {
    id: 5,
    title: 'Intermezzo',
    author: 'Михайло Коцюбинський',
    price: 175,
    rating: 4.3,
    reviews: 42,
    genre: 'Новела',
    format: "М'яка",
    inStock: false,
    isNew: false,
    isBestseller: false,
    color: 'from-oak-400 to-oak-600',
  },
]

/* ──────────────── Section wrapper ──────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold text-text mb-2">{title}</h2>
      <div className="h-0.5 w-12 bg-oak-500 mb-8" />
      {children}
    </section>
  )
}

/* ──────────────── Book Cover Placeholder ──────────────── */
function BookCover({ title, author, gradient }: { title: string; author: string; gradient: string }) {
  return (
    <div className={`relative w-full aspect-[2/3] bg-gradient-to-br ${gradient} flex flex-col justify-between p-4 text-white overflow-hidden`}>
      {/* decorative lines */}
      <div className="absolute top-0 right-0 w-full h-full opacity-10">
        <div className="absolute top-4 left-4 right-4 border-t border-white" />
        <div className="absolute bottom-4 left-4 right-4 border-b border-white" />
        <div className="absolute top-4 bottom-4 left-4 border-l border-white" />
        <div className="absolute top-4 bottom-4 right-4 border-r border-white" />
      </div>
      {/* content */}
      <div className="relative z-10">
        <BookOpen className="w-5 h-5 opacity-50" />
      </div>
      <div className="relative z-10">
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-1">{author}</p>
        <h3 className="text-sm font-semibold leading-tight">{title}</h3>
      </div>
    </div>
  )
}

/* ──────────────── Star Rating ──────────────── */
function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'fill-accent-400 text-accent-400' : 'text-oak-200'}`}
        />
      ))}
      <span className="text-xs text-text-muted ml-1">{rating}</span>
      <span className="text-xs text-text-muted">({reviews})</span>
    </div>
  )
}

/* ──────────────── MAIN COMPONENT ──────────────── */
export function StyleGuide() {
  const [searchValue, setSearchValue] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState('Усі жанри')
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [cartCount] = useState(3)
  const [liked, setLiked] = useState<Set<number>>(new Set())

  const toggleLike = (id: number) => {
    setLiked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const genres = ['Усі жанри', 'Класика', 'Поезія', 'Драма', 'Роман', 'Новела', 'Фантастика']

  return (
    <div className="min-h-screen bg-white">
      {/* ═══════════════ NAVBAR ═══════════════ */}
      <nav className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-oak-800 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-text tracking-tight">BookShop</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Пошук книг, авторів..."
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-border text-sm
                           placeholder:text-text-muted focus:outline-none focus:border-oak-500 transition-colors"
              />
            </div>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-2">
            <button className="relative p-2 hover:bg-oak-50 transition-colors">
              <Bell className="w-5 h-5 text-text-secondary" />
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-oak-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">2</span>
            </button>
            <button className="relative p-2 hover:bg-oak-50 transition-colors">
              <ShoppingCart className="w-5 h-5 text-text-secondary" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-oak-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{cartCount}</span>
              )}
            </button>
            <div className="w-px h-6 bg-border mx-1" />
            <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-oak-50 transition-colors">
              <div className="w-7 h-7 bg-oak-100 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-oak-700" />
              </div>
              <span className="text-sm font-medium text-text-secondary">Admin</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* ═══════════════ SIDEBAR ═══════════════ */}
        <aside className={`${sidebarOpen ? 'w-56' : 'w-14'} shrink-0 bg-white border-r border-border min-h-[calc(100vh-3.5rem)] transition-all duration-300 sticky top-14`}>
          <div className="p-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center gap-3 px-2.5 py-2 hover:bg-oak-50 transition-colors text-text-secondary"
            >
              <Menu className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span className="text-sm">Меню</span>}
            </button>
          </div>
          <nav className="px-2 space-y-0.5">
            {[
              { icon: Home, label: 'Головна', active: false },
              { icon: Library, label: 'Каталог', active: true },
              { icon: ShoppingCart, label: 'Замовлення', active: false },
              { icon: Users, label: 'Клієнти', active: false },
              { icon: Truck, label: 'Поставки', active: false },
              { icon: Tag, label: 'Акції', active: false },
              { icon: BarChart3, label: 'Аналітика', active: false },
              { icon: Settings, label: 'Налаштування', active: false },
            ].map(({ icon: Icon, label, active }) => (
              <button
                key={label}
                className={`w-full flex items-center gap-3 px-2.5 py-2 transition-colors text-sm
                  ${active
                    ? 'bg-oak-800 text-white font-medium'
                    : 'text-text-secondary hover:bg-oak-50'
                  }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : ''}`} />
                {sidebarOpen && <span>{label}</span>}
              </button>
            ))}
            <div className="pt-3 border-t border-border mt-3">
              <button className="w-full flex items-center gap-3 px-2.5 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm">
                <LogOut className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span>Вийти</span>}
              </button>
            </div>
          </nav>
        </aside>

        {/* ═══════════════ MAIN CONTENT ═══════════════ */}
        <main className="flex-1 max-w-6xl mx-auto px-8 py-10">

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-text tracking-tight mb-1">BookShop UI Kit</h1>
            <p className="text-text-muted">
              Компоненти дизайн-системи книгарні &mdash; Oak Theme
            </p>
          </div>

          {/* ═══════════ BUTTONS ═══════════ */}
          <Section title="Кнопки">
            <div className="space-y-6">
              {/* Primary row */}
              <div className="flex flex-wrap items-center gap-3">
                <button className="px-5 py-2.5 bg-oak-800 text-white font-medium hover:bg-oak-900 active:scale-[0.98] transition-all border border-oak-800">
                  Замовити
                </button>
                <button className="px-5 py-2.5 bg-oak-800 text-white font-medium border border-oak-800 opacity-40 cursor-not-allowed">
                  Недоступно
                </button>
                <button className="px-5 py-2.5 bg-oak-50 text-oak-800 font-medium border border-oak-200 hover:bg-oak-100 transition-colors">
                  Детальніше
                </button>
                <button className="px-5 py-2.5 bg-white text-text-secondary font-medium border border-border hover:bg-oak-50 hover:border-oak-300 transition-colors">
                  Скасувати
                </button>
                <button className="px-5 py-2.5 text-oak-700 font-medium hover:bg-oak-50 transition-colors">
                  Текстова
                </button>
              </div>
              {/* Sizes */}
              <div className="flex flex-wrap items-center gap-3">
                <button className="px-3 py-1.5 bg-oak-800 text-white text-xs font-medium hover:bg-oak-900 transition-colors border border-oak-800">
                  Small
                </button>
                <button className="px-5 py-2.5 bg-oak-800 text-white text-sm font-medium hover:bg-oak-900 transition-colors border border-oak-800">
                  Medium
                </button>
                <button className="px-6 py-3 bg-oak-800 text-white text-base font-medium hover:bg-oak-900 transition-colors border border-oak-800">
                  Large
                </button>
              </div>
              {/* Icon buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-oak-800 text-white font-medium hover:bg-oak-900 transition-colors border border-oak-800">
                  <Plus className="w-4 h-4" /> Додати книгу
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-oak-600 text-white font-medium hover:bg-oak-700 transition-colors border border-oak-600">
                  <ShoppingCart className="w-4 h-4" /> До кошика
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 font-medium hover:bg-red-50 transition-colors border border-red-200">
                  <Trash2 className="w-4 h-4" /> Видалити
                </button>
                <button className="p-2.5 border border-border hover:bg-oak-50 hover:border-oak-300 transition-colors">
                  <Edit3 className="w-4 h-4 text-text-secondary" />
                </button>
                <button className="p-2.5 border border-border hover:bg-oak-50 hover:border-oak-300 transition-colors">
                  <Eye className="w-4 h-4 text-text-secondary" />
                </button>
              </div>
            </div>
          </Section>

          {/* ═══════════ INPUTS ═══════════ */}
          <Section title="Поля вводу">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              {/* Text */}
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Назва книги</label>
                <input
                  type="text"
                  placeholder="Введіть назву..."
                  className="w-full px-4 py-2.5 bg-white border border-border text-sm
                             placeholder:text-text-muted focus:outline-none focus:border-oak-500 transition-colors"
                />
              </div>
              {/* With icon */}
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Пошук</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Пошук..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-border text-sm
                               placeholder:text-text-muted focus:outline-none focus:border-oak-500 transition-colors"
                  />
                </div>
              </div>
              {/* Error */}
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Email</label>
                <input
                  type="email"
                  defaultValue="invalid-email"
                  className="w-full px-4 py-2.5 bg-white border border-red-300 text-sm
                             focus:outline-none focus:border-red-500 transition-colors"
                />
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Невірний формат email
                </p>
              </div>
              {/* Number with stepper */}
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Кількість</label>
                <div className="flex items-center">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-2.5 border border-border hover:bg-oak-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={qty}
                    readOnly
                    className="w-14 text-center py-2.5 bg-white border-t border-b border-border text-sm"
                  />
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="px-3 py-2.5 border border-border hover:bg-oak-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Textarea */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text mb-1.5">Опис</label>
                <textarea
                  placeholder="Введіть опис книги..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white border border-border text-sm
                             placeholder:text-text-muted focus:outline-none focus:border-oak-500 transition-colors resize-none"
                />
              </div>
            </div>
          </Section>

          {/* ═══════════ DROPDOWN / SELECT ═══════════ */}
          <Section title="Dropdown / Select">
            <div className="flex flex-wrap gap-4">
              {/* Custom dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border text-sm
                             hover:border-oak-400 transition-colors min-w-[180px] justify-between"
                >
                  <span>{selectedGenre}</span>
                  <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute top-full mt-1 left-0 w-full bg-white border border-border shadow-lg shadow-black/5 py-1 z-10">
                    {genres.map(g => (
                      <button
                        key={g}
                        onClick={() => { setSelectedGenre(g); setDropdownOpen(false) }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-oak-50 transition-colors
                          ${g === selectedGenre ? 'text-oak-800 font-medium bg-oak-50' : 'text-text'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Native select */}
              <select className="px-4 py-2.5 bg-white border border-border text-sm
                                 focus:outline-none focus:border-oak-500
                                 appearance-none pr-10 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23a68a64%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-no-repeat">
                <option>Тверда</option>
                <option>М'яка</option>
                <option>Електронна</option>
              </select>

              {/* Filter chips */}
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-oak-800 text-white text-xs font-medium">
                  <Filter className="w-3 h-3" /> Фільтри
                </button>
                <span className="px-3 py-1.5 bg-oak-50 text-oak-800 text-xs font-medium border border-oak-200 flex items-center gap-1">
                  Класика <X className="w-3 h-3 cursor-pointer hover:text-red-500" />
                </span>
                <span className="px-3 py-1.5 bg-oak-50 text-oak-800 text-xs font-medium border border-oak-200 flex items-center gap-1">
                  Тверда <X className="w-3 h-3 cursor-pointer hover:text-red-500" />
                </span>
              </div>
            </div>
          </Section>

          {/* ═══════════ BADGES & TAGS ═══════════ */}
          <Section title="Бейджі та теги">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">В наявності</span>
              <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold border border-red-200">Немає в наявності</span>
              <span className="px-2.5 py-1 bg-accent-50 text-accent-500 text-xs font-semibold border border-accent-200 flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> Бестселер
              </span>
              <span className="px-2.5 py-1 bg-oak-50 text-oak-700 text-xs font-semibold border border-oak-200">Новинка</span>
              <span className="px-2.5 py-1 bg-oak-800 text-white text-xs font-semibold">-25%</span>
              <span className="px-2.5 py-1 bg-oak-50 text-text-secondary text-xs font-medium border border-oak-200">Тверда</span>
              <span className="px-2.5 py-1 bg-oak-50 text-text-secondary text-xs font-medium border border-oak-200">М'яка</span>
              <span className="px-2.5 py-1 bg-oak-100 text-oak-700 text-xs font-medium border border-oak-200">Електронна</span>
            </div>
          </Section>

          {/* ═══════════ ALERTS ═══════════ */}
          <Section title="Сповіщення">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">Замовлення оформлено!</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Замовлення #1234 успішно створено.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-oak-50 border border-oak-200">
                <Info className="w-5 h-5 text-oak-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-oak-900">Нова поставка</p>
                  <p className="text-xs text-oak-600 mt-0.5">Очікується поставка 50 книг від постачальника.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-accent-50 border border-accent-200">
                <AlertCircle className="w-5 h-5 text-accent-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Мало на складі</p>
                  <p className="text-xs text-amber-600 mt-0.5">Залишилось 3 копії "Кобзар".</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200">
                <X className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Помилка</p>
                  <p className="text-xs text-red-600 mt-0.5">Не вдалося підключитися до бази даних.</p>
                </div>
              </div>
            </div>
          </Section>

          {/* ═══════════ TABS ═══════════ */}
          <Section title="Таби">
            <div className="border-b border-border inline-flex gap-0 mb-4">
              {['Усі книги', 'Тверда', "М'яка", 'Електронна'].map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`px-5 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px
                    ${activeTab === i
                      ? 'border-oak-800 text-oak-800'
                      : 'border-transparent text-text-muted hover:text-text-secondary hover:border-oak-300'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </Section>

          {/* ═══════════ BOOK CARDS ═══════════ */}
          <Section title="Картки книг">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {MOCK_BOOKS.map(book => (
                <div
                  key={book.id}
                  className="group bg-white border border-border overflow-hidden hover:shadow-lg hover:shadow-oak-900/5 hover:-translate-y-0.5 transition-all duration-300"
                >
                  {/* Cover */}
                  <div className="relative">
                    <BookCover title={book.title} author={book.author} gradient={book.color} />
                    {/* Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      {book.isBestseller && (
                        <span className="px-2 py-0.5 bg-accent-400 text-white text-[10px] font-bold tracking-wide">
                          HIT
                        </span>
                      )}
                      {book.isNew && (
                        <span className="px-2 py-0.5 bg-oak-800 text-white text-[10px] font-bold tracking-wide">
                          NEW
                        </span>
                      )}
                      {book.oldPrice && (
                        <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold tracking-wide">
                          -{Math.round((1 - book.price / book.oldPrice) * 100)}%
                        </span>
                      )}
                    </div>
                    {/* Like button */}
                    <button
                      onClick={() => toggleLike(book.id)}
                      className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 backdrop-blur-sm
                                 hover:bg-white transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${liked.has(book.id) ? 'fill-red-500 text-red-500' : 'text-oak-300'}`} />
                    </button>
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <p className="text-xs text-text-muted mb-0.5">{book.author}</p>
                    <h3 className="text-sm font-semibold text-text leading-tight mb-2 line-clamp-2">{book.title}</h3>
                    <StarRating rating={book.rating} reviews={book.reviews} />
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="px-1.5 py-0.5 bg-oak-50 text-text-muted text-[11px] font-medium border border-oak-100">{book.format}</span>
                      <span className="px-1.5 py-0.5 bg-oak-50 text-text-muted text-[11px] font-medium border border-oak-100">{book.genre}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <div>
                        <span className="text-lg font-bold text-text">{book.price}</span>
                        <span className="text-xs text-text-muted ml-0.5">грн</span>
                        {book.oldPrice && (
                          <span className="text-xs text-text-muted line-through ml-2">{book.oldPrice}</span>
                        )}
                      </div>
                      {book.inStock ? (
                        <button className="p-2 bg-oak-800 text-white hover:bg-oak-900 active:scale-95 transition-all">
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-red-500 font-medium">Немає</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ═══════════ BOOK CARD — HORIZONTAL ═══════════ */}
          <Section title="Картка книги (горизонтальна)">
            <div className="bg-white border border-border p-5 flex gap-5 max-w-2xl hover:shadow-lg hover:shadow-oak-900/5 transition-all">
              <div className="w-32 shrink-0">
                <BookCover title="Кобзар" author="Тарас Шевченко" gradient="from-oak-600 to-oak-800" />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">Тарас Шевченко</p>
                    <h3 className="text-lg font-bold text-text">Кобзар</h3>
                  </div>
                  <button className="p-1.5 hover:bg-oak-50 transition-colors">
                    <Heart className="w-5 h-5 text-oak-300 hover:text-red-400" />
                  </button>
                </div>
                <StarRating rating={4.9} reviews={312} />
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-oak-50 text-text-muted text-xs font-medium border border-oak-100">Тверда</span>
                  <span className="px-2 py-0.5 bg-oak-50 text-text-muted text-xs font-medium border border-oak-100">Поезія</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">В наявності</span>
                </div>
                <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                  Збірка поетичних творів великого українського поета, що стала символом
                  національної свідомості та боротьби за свободу.
                </p>
                <div className="flex items-center justify-between mt-auto pt-3">
                  <div>
                    <span className="text-xl font-bold text-text">280</span>
                    <span className="text-sm text-text-muted ml-1">грн</span>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-oak-800 text-white text-sm font-medium hover:bg-oak-900 transition-colors border border-oak-800">
                    <ShoppingCart className="w-4 h-4" /> До кошика
                  </button>
                </div>
              </div>
            </div>
          </Section>

          {/* ═══════════ TABLE ═══════════ */}
          <Section title="Таблиця">
            <div className="bg-white border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-oak-50">
                    <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Книга</th>
                    <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Автор</th>
                    <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Жанр</th>
                    <th className="text-right px-5 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Ціна</th>
                    <th className="text-center px-5 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Статус</th>
                    <th className="text-right px-5 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_BOOKS.slice(0, 4).map((book, i) => (
                    <tr key={book.id} className={`border-b border-border last:border-0 hover:bg-oak-50/50 transition-colors ${i % 2 === 0 ? '' : 'bg-oak-50/30'}`}>
                      <td className="px-5 py-3.5 font-medium text-text">{book.title}</td>
                      <td className="px-5 py-3.5 text-text-secondary">{book.author}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 bg-oak-50 text-text-secondary text-xs border border-oak-100">{book.genre}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold">{book.price} грн</td>
                      <td className="px-5 py-3.5 text-center">
                        {book.inStock
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200"><Check className="w-3 h-3" /> Є</span>
                          : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 text-xs font-semibold border border-red-200"><X className="w-3 h-3" /> Немає</span>
                        }
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 hover:bg-oak-100 transition-colors"><Eye className="w-4 h-4 text-text-muted hover:text-oak-700" /></button>
                          <button className="p-1.5 hover:bg-oak-100 transition-colors"><Edit3 className="w-4 h-4 text-text-muted hover:text-oak-700" /></button>
                          <button className="p-1.5 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4 text-text-muted hover:text-red-500" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* ═══════════ STATS CARDS ═══════════ */}
          <Section title="Статистика">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Всього книг', value: '1,247', icon: Library, change: '+12%', iconBg: 'bg-oak-100', iconColor: 'text-oak-700' },
                { label: 'Замовлень сьогодні', value: '34', icon: Package, change: '+8%', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
                { label: 'Дохід за місяць', value: '82,450 грн', icon: CreditCard, change: '+23%', iconBg: 'bg-oak-50', iconColor: 'text-oak-600' },
                { label: 'Нових клієнтів', value: '156', icon: Users, change: '+5%', iconBg: 'bg-accent-50', iconColor: 'text-accent-500' },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-border p-5 hover:shadow-md hover:shadow-oak-900/5 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 ${stat.iconBg}`}>
                      <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-200">{stat.change}</span>
                  </div>
                  <p className="text-2xl font-bold text-text">{stat.value}</p>
                  <p className="text-sm text-text-muted mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ═══════════ MODAL PREVIEW ═══════════ */}
          <Section title="Модальне вікно">
            <div className="bg-white border border-border p-6 max-w-md shadow-xl shadow-oak-900/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text">Підтвердження замовлення</h3>
                <button className="p-1.5 hover:bg-oak-50 transition-colors">
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>
              <p className="text-sm text-text-secondary mb-6">
                Ви впевнені, що хочете оформити замовлення на 3 книги на суму <strong>845 грн</strong>?
              </p>
              <div className="flex items-center justify-end gap-3">
                <button className="px-4 py-2.5 border border-border text-text-secondary font-medium text-sm hover:bg-oak-50 transition-colors">
                  Скасувати
                </button>
                <button className="px-5 py-2.5 bg-oak-800 text-white font-medium text-sm hover:bg-oak-900 transition-colors border border-oak-800 flex items-center gap-2">
                  <Check className="w-4 h-4" /> Підтвердити
                </button>
              </div>
            </div>
          </Section>

          {/* ═══════════ PAGINATION ═══════════ */}
          <Section title="Пагінація">
            <div className="flex items-center gap-0">
              <button className="px-3 py-2 text-sm text-text-muted border border-border hover:bg-oak-50 transition-colors flex items-center gap-1">
                <ArrowRight className="w-4 h-4 rotate-180" /> Назад
              </button>
              {[1, 2, 3, '...', 12].map((p, i) => (
                <button
                  key={i}
                  className={`w-10 h-10 text-sm font-medium border-t border-b border-r border-border transition-colors
                    ${p === 1
                      ? 'bg-oak-800 text-white border-oak-800'
                      : p === '...'
                        ? 'text-text-muted cursor-default'
                        : 'text-text-secondary hover:bg-oak-50'}`}
                >
                  {p}
                </button>
              ))}
              <button className="px-3 py-2 text-sm text-text-secondary border border-border hover:bg-oak-50 transition-colors flex items-center gap-1">
                Далі <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Section>

          {/* ═══════════ COLOR PALETTE ═══════════ */}
          <Section title="Палітра Oak">
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
              {[
                { name: 'Oak 50', className: 'bg-oak-50', hex: '#FAF8F5' },
                { name: 'Oak 100', className: 'bg-oak-100', hex: '#F3EFE8' },
                { name: 'Oak 200', className: 'bg-oak-200', hex: '#E8E0D4' },
                { name: 'Oak 300', className: 'bg-oak-300', hex: '#D4C4AD' },
                { name: 'Oak 400', className: 'bg-oak-400', hex: '#BFA684' },
                { name: 'Oak 500', className: 'bg-oak-500', hex: '#A68A64' },
                { name: 'Oak 600', className: 'bg-oak-600', hex: '#8B6F4E' },
                { name: 'Oak 700', className: 'bg-oak-700', hex: '#6F5739' },
                { name: 'Oak 800', className: 'bg-oak-800', hex: '#5A4730' },
                { name: 'Oak 900', className: 'bg-oak-900', hex: '#3D3021' },
              ].map(c => (
                <div key={c.name} className="text-center">
                  <div className={`w-full h-16 ${c.className} border border-border mb-2`} />
                  <p className="text-[11px] font-medium text-text">{c.name}</p>
                  <p className="text-[10px] text-text-muted">{c.hex}</p>
                </div>
              ))}
            </div>
          </Section>

        </main>
      </div>
    </div>
  )
}
