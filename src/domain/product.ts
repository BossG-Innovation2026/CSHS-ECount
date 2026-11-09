import type { NewItem, Room } from './types'

export const CATEGORIES = ['Electronics', 'Furniture', 'Supplies', 'Safety']

export type ProductValues = {
  name: string
  category: string
  roomId: string
  stock: string
  reorderLevel: string
  price: string
  supplier: string
}

export function emptyProduct(rooms: Room[]): ProductValues {
  return {
    name: '',
    category: CATEGORIES[0],
    roomId: String(rooms[0]?.id ?? ''),
    stock: '10',
    reorderLevel: '5',
    price: '50',
    supplier: '',
  }
}

export function parseProduct(values: ProductValues): NewItem | string {
  const stock = Number(values.stock)
  const reorderLevel = Number(values.reorderLevel)
  const price = Number(values.price)

  if (!values.name.trim() || !values.supplier.trim()) return 'Enter a product name and supplier.'
  if (!values.roomId) return 'Choose a room.'
  if (!Number.isInteger(stock) || stock < 0 || !Number.isInteger(reorderLevel) || reorderLevel < 0) {
    return 'Stock and reorder level must be whole numbers, 0 or more.'
  }
  if (!Number.isFinite(price) || price < 0) return 'Price must be 0 or more.'

  return {
    name: values.name.trim(),
    category: values.category,
    roomId: Number(values.roomId),
    stock,
    reorderLevel,
    price,
    supplier: values.supplier.trim(),
  }
}
