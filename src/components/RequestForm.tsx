import { useState, type FormEvent } from 'react'
import { REQUEST_KIND_LABELS } from '../domain/inventory'
import type { InventoryItem, RequestDraft, RequestKind, Room } from '../domain/types'
import { emptyProduct, parseProduct } from '../domain/product'
import { ProductFields } from './ProductFields'

type Props = {
  kinds: RequestKind[]
  items: InventoryItem[]
  rooms: Room[]
  onSubmit: (draft: RequestDraft) => void
}

export function RequestForm({ kinds, items, rooms, onSubmit }: Props) {
  const [kind, setKind] = useState<RequestKind>(kinds[0])
  const [itemId, setItemId] = useState(String(items[0]?.id ?? ''))
  const [quantity, setQuantity] = useState('1')
  const [note, setNote] = useState('')
  const [product, setProduct] = useState(() => emptyProduct(rooms))
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const fail = (text: string) => setMessage({ text, isError: true })

    if (!note.trim()) return fail('Add a short reason for this request.')

    if (kind === 'new_item') {
      const newItem = parseProduct(product)
      if (typeof newItem === 'string') return fail(newItem)
      onSubmit({ kind, newItem, note: note.trim() })
      setProduct(emptyProduct(rooms))
    } else {
      const amount = Number(quantity)
      if (!itemId) return fail('Choose an item.')
      if (!Number.isInteger(amount) || amount === 0) return fail('Enter a whole number other than 0.')
      if (kind !== 'stock_adjustment' && amount < 0) return fail('Quantity must be more than 0.')
      onSubmit({ kind, itemId: Number(itemId), quantity: amount, note: note.trim() })
    }

    setNote('')
    setQuantity('1')
    setMessage({ text: 'Request sent for review.', isError: false })
  }

  return (
    <div className="panel form-panel">
      <div className="panel-header compact">
        <h3>Submit a request</h3>
      </div>
      <form onSubmit={handleSubmit} className="inventory-form" noValidate>
        <label>
          Request type
          <select value={kind} onChange={(event) => setKind(event.target.value as RequestKind)}>
            {kinds.map((option) => (
              <option key={option} value={option}>
                {REQUEST_KIND_LABELS[option]}
              </option>
            ))}
          </select>
        </label>

        {kind === 'new_item' ? (
          <ProductFields values={product} rooms={rooms} onChange={setProduct} />
        ) : (
          <>
            <label>
              Item
              <select value={itemId} onChange={(event) => setItemId(event.target.value)}>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {kind === 'stock_adjustment' ? 'Change (use - to remove)' : 'Quantity'}
              <input type="number" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
            </label>
          </>
        )}

        <label>
          Reason
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Why is this needed?" />
        </label>

        {message && (
          <p className={message.isError ? 'form-message error' : 'form-message'} role="status">
            {message.text}
          </p>
        )}
        <button type="submit" className="primary-btn full-width">Send request</button>
      </form>
    </div>
  )
}
