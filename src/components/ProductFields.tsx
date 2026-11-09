import { CATEGORIES, type ProductValues } from '../domain/product'
import type { Room } from '../domain/types'

type Props = {
  values: ProductValues
  rooms: Room[]
  onChange: (values: ProductValues) => void
}

export function ProductFields({ values, rooms, onChange }: Props) {
  const set = (field: keyof ProductValues, value: string) => onChange({ ...values, [field]: value })

  return (
    <>
      <label>
        Product name
        <input value={values.name} onChange={(event) => set('name', event.target.value)} placeholder="e.g. Wireless keyboard" />
      </label>
      <div className="inline-fields">
        <label>
          Category
          <select value={values.category} onChange={(event) => set('category', event.target.value)}>
            {CATEGORIES.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label>
          Room
          <select value={values.roomId} onChange={(event) => set('roomId', event.target.value)}>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="inline-fields">
        <label>
          Stock
          <input type="number" min="0" step="1" value={values.stock} onChange={(event) => set('stock', event.target.value)} />
        </label>
        <label>
          Reorder
          <input type="number" min="0" step="1" value={values.reorderLevel} onChange={(event) => set('reorderLevel', event.target.value)} />
        </label>
      </div>
      <div className="inline-fields">
        <label>
          Price
          <input type="number" min="0" step="any" value={values.price} onChange={(event) => set('price', event.target.value)} />
        </label>
        <label>
          Supplier
          <input value={values.supplier} onChange={(event) => set('supplier', event.target.value)} placeholder="Supplier name" />
        </label>
      </div>
    </>
  )
}
