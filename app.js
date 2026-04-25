// ── Default quotes seeded for Maya ───────────────────────────────
const DEFAULT_QUOTES = [
  {
    id: 'q1', text: "The cloud is not a place, it's a way of doing IT.",
    author: 'Michael Dell', category: 'tech', reflection: 'This perfectly captures why I moved into cloud architecture — it\'s a mindset shift, not just a technology shift.',
    likes: 0, liked: false, createdAt: Date.now() - 86400000 * 6
  },
  {
    id: 'q2', text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: 'Martin Fowler', category: 'tech', reflection: 'I share this with every junior dev I mentor. Readability is a superpower.',
    likes: 3, liked: false, createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 'q3', text: "The best way to predict the future is to invent it.",
    author: 'Alan Kay', category: 'tech', reflection: '',
    likes: 5, liked: false, createdAt: Date.now() - 86400000 * 4
  },
  {
    id: 'q4', text: "A mentor is someone who sees more talent and ability within you than you see in yourself.",
    author: 'Bob Proctor', category: 'leadership', reflection: 'Mentoring 40+ developers has taught me this is absolutely true — people just need someone to believe in them first.',
    likes: 7, liked: false, createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 'q5', text: "Leadership is not about being in charge. It is about taking care of those in your charge.",
    author: 'Simon Sinek', category: 'leadership', reflection: '',
    likes: 4, liked: false, createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'q6', text: "Growth and comfort do not coexist.",
    author: 'Ginni Rometty', category: 'growth', reflection: 'Every time I stepped outside my comfort zone — speaking at conferences, open-sourcing my tools — something great happened.',
    likes: 9, liked: false, createdAt: Date.now() - 86400000 * 1
  },
  {
    id: 'q7', text: "It does not matter how slowly you go as long as you do not stop.",
    author: 'Confucius', category: 'growth', reflection: '',
    likes: 2, liked: false, createdAt: Date.now() - 86400000 * 0.5
  },
  {
    id: 'q8', text: "Not all those who wander are lost.",
    author: 'J.R.R. Tolkien', category: 'life', reflection: '15 countries and counting. Every trip to a local tech meetup abroad has changed how I think.',
    likes: 6, liked: false, createdAt: Date.now()
  },
  {
    id: 'q9', text: "The journey of a thousand miles begins with a single step.",
    author: 'Lao Tzu', category: 'life', reflection: '',
    likes: 1, liked: false, createdAt: Date.now() - 3600000
  }
]

// ── Storage ───────────────────────────────────────────────────────
const STORAGE_KEY = 'qb_quotes'

function loadQuotes() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return JSON.parse(stored)
  // First load — seed defaults
  saveQuotes(DEFAULT_QUOTES)
  return DEFAULT_QUOTES
}

function saveQuotes(quotes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes))
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

// ── State ─────────────────────────────────────────────────────────
let quotes = loadQuotes()
let activeFilter = 'all'
let searchQuery = ''
let editingId = null

// ── DOM refs ──────────────────────────────────────────────────────
const quotesGrid    = document.getElementById('quotes-grid')
const emptyState    = document.getElementById('empty-state')
const heroQuote     = document.getElementById('hero-quote')
const heroAuthor    = document.getElementById('hero-author')
const searchInput   = document.getElementById('search-input')
const addBtn        = document.getElementById('add-btn')
const modalOverlay  = document.getElementById('modal-overlay')
const modalClose    = document.getElementById('modal-close')
const cancelBtn     = document.getElementById('cancel-btn')
const modalTitle    = document.getElementById('modal-title')
const quoteForm     = document.getElementById('quote-form')
const fText         = document.getElementById('f-text')
const fAuthor       = document.getElementById('f-author')
const fCategory     = document.getElementById('f-category')
const fReflection   = document.getElementById('f-reflection')

// ── Hero ──────────────────────────────────────────────────────────
function renderHero() {
  // Pick quote of the day based on date
  const idx = new Date().getDate() % quotes.length
  const q = quotes[idx] || quotes[0]
  if (!q) return
  heroQuote.textContent = q.text
  heroAuthor.textContent = '— ' + q.author
}

// ── Filter nav ────────────────────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    activeFilter = btn.dataset.filter
    renderGrid()
  })
})

// ── Search ────────────────────────────────────────────────────────
searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value.toLowerCase()
  renderGrid()
})

// ── Grid ──────────────────────────────────────────────────────────
function renderGrid() {
  let filtered = quotes.filter(q => {
    const matchFilter = activeFilter === 'all' || q.category === activeFilter
    const matchSearch = !searchQuery ||
      q.text.toLowerCase().includes(searchQuery) ||
      q.author.toLowerCase().includes(searchQuery) ||
      (q.reflection && q.reflection.toLowerCase().includes(searchQuery))
    return matchFilter && matchSearch
  })

  // Sort newest first
  filtered.sort((a, b) => b.createdAt - a.createdAt)

  quotesGrid.innerHTML = ''

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden')
    return
  }
  emptyState.classList.add('hidden')

  filtered.forEach(q => {
    const card = document.createElement('div')
    card.className = `quote-card cat-${q.category}`
    card.innerHTML = `
      <span class="quote-tag">${q.category}</span>
      <p class="quote-text">${escHtml(q.text)}</p>
      <p class="quote-author">— ${escHtml(q.author)}</p>
      ${q.reflection ? `<p class="quote-reflection">${escHtml(q.reflection)}</p>` : ''}
      <div class="quote-card-actions">
        <button class="card-btn like-btn ${q.liked ? 'liked' : ''}" data-id="${q.id}">
          ${q.liked ? '❤️' : '🤍'} ${q.likes}
        </button>
        <button class="card-btn edit-btn" data-id="${q.id}">✏️ Edit</button>
        <button class="card-btn delete-btn" data-id="${q.id}">🗑️</button>
      </div>
    `

    card.querySelector('.like-btn').addEventListener('click', () => toggleLike(q.id))
    card.querySelector('.edit-btn').addEventListener('click', () => openEdit(q.id))
    card.querySelector('.delete-btn').addEventListener('click', () => deleteQuote(q.id))

    quotesGrid.appendChild(card)
  })
}

// ── Like ──────────────────────────────────────────────────────────
function toggleLike(id) {
  quotes = quotes.map(q => {
    if (q.id !== id) return q
    return { ...q, liked: !q.liked, likes: q.liked ? q.likes - 1 : q.likes + 1 }
  })
  saveQuotes(quotes)
  renderGrid()
}

// ── Delete ────────────────────────────────────────────────────────
function deleteQuote(id) {
  if (!confirm('Delete this quote?')) return
  quotes = quotes.filter(q => q.id !== id)
  saveQuotes(quotes)
  renderHero()
  renderGrid()
}

// ── Modal ─────────────────────────────────────────────────────────
function openModal() {
  modalOverlay.classList.remove('hidden')
  fText.focus()
}
function closeModal() {
  modalOverlay.classList.add('hidden')
  quoteForm.reset()
  editingId = null
  modalTitle.textContent = 'Add Quote'
}

addBtn.addEventListener('click', () => { editingId = null; modalTitle.textContent = 'Add Quote'; openModal() })
modalClose.addEventListener('click', closeModal)
cancelBtn.addEventListener('click', closeModal)
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal() })
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal() })

function openEdit(id) {
  const q = quotes.find(q => q.id === id)
  if (!q) return
  editingId = id
  modalTitle.textContent = 'Edit Quote'
  fText.value = q.text
  fAuthor.value = q.author
  fCategory.value = q.category
  fReflection.value = q.reflection || ''
  openModal()
}

quoteForm.addEventListener('submit', e => {
  e.preventDefault()
  const text       = fText.value.trim()
  const author     = fAuthor.value.trim()
  const category   = fCategory.value
  const reflection = fReflection.value.trim()

  if (editingId) {
    quotes = quotes.map(q => q.id === editingId
      ? { ...q, text, author, category, reflection }
      : q
    )
  } else {
    quotes.unshift({ id: uid(), text, author, category, reflection, likes: 0, liked: false, createdAt: Date.now() })
  }

  saveQuotes(quotes)
  closeModal()
  renderHero()
  renderGrid()
})

// ── Util ──────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

// ── Init ──────────────────────────────────────────────────────────
renderHero()
renderGrid()
