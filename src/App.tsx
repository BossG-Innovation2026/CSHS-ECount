import { useMemo, useState, type FormEvent } from 'react'
import './App.css'

type InventoryItem = {
  id: number
  name: string
  sku: string
  category: string
  stock: number
  reorderLevel: number
  price: number
  supplier: string
}

const initialItems: InventoryItem[] = [
  { id: 1, name: 'Laptop Pro 14', sku: 'LTP-014', category: 'Electronics', stock: 18, reorderLevel: 6, price: 1299, supplier: 'TechNova' },
  { id: 2, name: 'Office Chair', sku: 'OFF-204', category: 'Furniture', stock: 7, reorderLevel: 5, price: 240, supplier: 'Comfort Works' },
  { id: 3, name: 'Printer Ink', sku: 'INK-019', category: 'Supplies', stock: 3, reorderLevel: 8, price: 42, supplier: 'PrintHub' },
  { id: 4, name: 'USB-C Hub', sku: 'USB-312', category: 'Electronics', stock: 22, reorderLevel: 10, price: 68, supplier: 'TechNova' },
  { id: 5, name: 'Safety Gloves', sku: 'SAF-118', category: 'Safety', stock: 12, reorderLevel: 6, price: 18, supplier: 'SafeLine' },
  { id: 6, name: 'Desk Lamp', sku: 'LMP-440', category: 'Furniture', stock: 4, reorderLevel: 5, price: 84, supplier: 'Comfort Works' },
]

const categoryColors: Record<string, string> = {
  Electronics: '#4f46e5',
  Furniture: '#f59e0b',
  Supplies: '#10b981',
  Safety: '#ef4444',
}

function App() {
  const [items, setItems] = useState(initialItems)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [form, setForm] = useState({
    name: '',
    category: 'Electronics',
    stock: '10',
    reorderLevel: '5',
    price: '50',
    supplier: '',
  })

  const totalInventory = items.reduce((sum, item) => sum + item.stock, 0)
  const totalValue = items.reduce((sum, item) => sum + item.stock * item.price, 0)
  const lowStockCount = items.filter((item) => item.stock <= item.reorderLevel).length
  const categories = ['All', ...new Set(items.map((item) => item.category))]

  const visibleItems = useMemo(() => {
    if (selectedCategory === 'All') return items
    return items.filter((item) => item.category === selectedCategory)
  }, [items, selectedCategory])

  const addItem = (event: FormEvent) => {
    event.preventDefault()

    if (!form.name.trim() || !form.supplier.trim()) {
      return
    }

    const nextItem: InventoryItem = {
      id: Date.now(),
      name: form.name.trim(),
      sku: `NEW-${Math.floor(Math.random() * 900 + 100)}`,
      category: form.category,
      stock: Number(form.stock) || 0,
      reorderLevel: Number(form.reorderLevel) || 0,
      price: Number(form.price) || 0,
      supplier: form.supplier.trim(),
    }

    setItems((current) => [nextItem, ...current])
    setForm({
      name: '',
      category: 'Electronics',
      stock: '10',
      reorderLevel: '5',
      price: '50',
      supplier: '',
    })
  }

  const updateStock = (id: number, change: number) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, stock: Math.max(0, item.stock + change) } : item,
      ),
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">E</div>
          <div>
            <p className="eyebrow">Inventory</p>
            <h2>CSHS ECount</h2>
          </div>
        </div>

        <nav className="nav">
          <button className="nav-item active">Dashboard</button>
          <button className="nav-item">Inventory</button>
          <button className="nav-item">Suppliers</button>
          <button className="nav-item">Reports</button>
        </nav>

        <div className="sidebar-card">
          <p>Low stock alert</p>
          <strong>{lowStockCount} items</strong>
          <span>Need reorder soon</span>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Overview</p>
            <h1>Inventory dashboard</h1>
          </div>
          <button className="primary-btn">+ Add stock</button>
        </header>

        <section className="metrics-grid">
          <article className="metric-card blue">
            <span>Total items</span>
            <strong>{items.length}</strong>
            <small>Across all categories</small>
          </article>
          <article className="metric-card green">
            <span>Units in stock</span>
            <strong>{totalInventory}</strong>
            <small>Ready for dispatch</small>
          </article>
          <article className="metric-card amber">
            <span>Inventory value</span>
            <strong>${totalValue.toLocaleString()}</strong>
            <small>Current market value</small>
          </article>
          <article className="metric-card red">
            <span>Low stock</span>
            <strong>{lowStockCount}</strong>
            <small>Requires review</small>
          </article>
        </section>

        <section className="content-grid">
          <div className="panel stock-panel">
            <div className="panel-header">
              <h3>Current inventory</h3>
              <div className="filter-row">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={selectedCategory === category ? 'filter-pill active' : 'filter-pill'}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Reorder</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="item-cell">
                          <div
                            className="item-dot"
                            style={{ backgroundColor: categoryColors[item.category] || '#64748b' }}
                          />
                          <div>
                            <strong>{item.name}</strong>
                            <small>{item.sku}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-tag" style={{ backgroundColor: `${categoryColors[item.category] || '#64748b'}22`, color: categoryColors[item.category] || '#64748b' }}>
                          {item.category}
                        </span>
                      </td>
                      <td>
                        <span className={item.stock <= item.reorderLevel ? 'stock critical' : 'stock'}>
                          {item.stock}
                        </span>
                      </td>
                      <td>{item.reorderLevel}</td>
                      <td>${item.price}</td>
                      <td>
                        <div className="stock-actions">
                          <button onClick={() => updateStock(item.id, -1)}>-</button>
                          <button onClick={() => updateStock(item.id, 1)}>+</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel form-panel">
            <div className="panel-header compact">
              <h3>Add product</h3>
            </div>

            <form onSubmit={addItem} className="inventory-form">
              <label>
                Product name
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Wireless keyboard" />
              </label>
              <label>
                Category
                <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Safety">Safety</option>
                </select>
              </label>
              <div className="inline-fields">
                <label>
                  Stock
                  <input type="number" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} />
                </label>
                <label>
                  Reorder
                  <input type="number" value={form.reorderLevel} onChange={(event) => setForm({ ...form, reorderLevel: event.target.value })} />
                </label>
              </div>
              <div className="inline-fields">
                <label>
                  Price
                  <input type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
                </label>
                <label>
                  Supplier
                  <input value={form.supplier} onChange={(event) => setForm({ ...form, supplier: event.target.value })} placeholder="Supplier name" />
                </label>
              </div>
              <button type="submit" className="primary-btn full-width">Save item</button>
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
