import { useState, type FormEvent } from 'react'
import { can } from '../auth/roles'
import { isLowStock, itemsFor, roomsFor, submittableKinds } from '../domain/inventory'
import type { AppState, NewItem, RequestDraft, User } from '../domain/types'
import { emptyProduct, parseProduct } from '../domain/product'
import { ProductFields } from './ProductFields'
import { RequestForm } from './RequestForm'

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: '#4f46e5',
  Furniture: '#f59e0b',
  Supplies: '#10b981',
  Safety: '#ef4444',
}
const DEFAULT_COLOR = '#64748b'

type Props = {
  actor: User
  state: AppState
  onAdjustStock: (itemId: number, change: number) => void
  onAddItem: (newItem: NewItem) => void
  onSubmitRequest: (draft: RequestDraft) => void
}

export function InventoryView({ actor, state, onAdjustStock, onAddItem, onSubmitRequest }: Props) {
  const rooms = roomsFor(actor, state.rooms)
  const items = itemsFor(actor, state)
  const canEdit = can(actor.role, 'inventory:edit')
  const kinds = submittableKinds(actor.role)

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [product, setProduct] = useState(() => emptyProduct(rooms))
  const [formError, setFormError] = useState('')

  const categories = ['All', ...new Set(items.map((item) => item.category))]
  const visibleItems =
    selectedCategory === 'All' ? items : items.filter((item) => item.category === selectedCategory)
  const roomName = (id: number) => rooms.find((room) => room.id === id)?.name ?? 'Unknown'

  const saveProduct = (event: FormEvent) => {
    event.preventDefault()
    const newItem = parseProduct(product)
    if (typeof newItem === 'string') {
      setFormError(newItem)
      return
    }
    onAddItem(newItem)
    setProduct(emptyProduct(rooms))
    setFormError('')
  }

  const hasSidePanel = canEdit || kinds.length > 0

  return (
    <section className={hasSidePanel ? 'content-grid' : 'content-grid single'}>
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
                <th>Room</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Reorder</th>
                <th>Price</th>
                {canEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => {
                const color = CATEGORY_COLORS[item.category] ?? DEFAULT_COLOR
                return (
                  <tr key={item.id}>
                    <td>
                      <div className="item-cell">
                        <div className="item-dot" style={{ backgroundColor: color }} />
                        <div>
                          <strong>{item.name}</strong>
                          <small>{item.sku}</small>
                        </div>
                      </div>
                    </td>
                    <td>{roomName(item.roomId)}</td>
                    <td>
                      <span className="category-tag" style={{ backgroundColor: `${color}22`, color }}>
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <span className={isLowStock(item) ? 'stock critical' : 'stock'}>{item.stock}</span>
                    </td>
                    <td>{item.reorderLevel}</td>
                    <td>${item.price}</td>
                    {canEdit && (
                      <td>
                        <div className="stock-actions">
                          <button aria-label={`Remove one ${item.name}`} onClick={() => onAdjustStock(item.id, -1)}>-</button>
                          <button aria-label={`Add one ${item.name}`} onClick={() => onAdjustStock(item.id, 1)}>+</button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
          {visibleItems.length === 0 && <p className="empty-state">No items to show.</p>}
        </div>
      </div>

      {hasSidePanel && (
        <div className="side-stack">
          {canEdit && (
            <div className="panel form-panel">
              <div className="panel-header compact">
                <h3>Add product</h3>
              </div>
              <form onSubmit={saveProduct} className="inventory-form" noValidate>
                <ProductFields values={product} rooms={rooms} onChange={setProduct} />
                {formError && <p className="form-message error" role="status">{formError}</p>}
                <button type="submit" className="primary-btn full-width">Save item</button>
              </form>
            </div>
          )}
          {kinds.length > 0 && (
            <RequestForm kinds={kinds} items={items} rooms={rooms} onSubmit={onSubmitRequest} />
          )}
        </div>
      )}
    </section>
  )
}
