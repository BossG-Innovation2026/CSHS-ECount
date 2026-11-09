import type { Role } from '../auth/roles'

export type Department = {
  id: number
  name: string
}

export type Room = {
  id: number
  name: string
  departmentId: number
}

export type User = {
  id: number
  name: string
  role: Role
  roomIds: number[]
  departmentId: number | null
}

export type InventoryItem = {
  id: number
  name: string
  sku: string
  category: string
  stock: number
  reorderLevel: number
  price: number
  supplier: string
  roomId: number
}

export type NewItem = Omit<InventoryItem, 'id' | 'sku'>

export type RequestStatus = 'pending_custodian' | 'pending_school_head' | 'approved' | 'rejected'

export type ItemRequestKind = 'stock_adjustment' | 'damage_report' | 'disposal'
export type RequestKind = ItemRequestKind | 'new_item'

export type RequestDraft =
  | { kind: 'new_item'; newItem: NewItem; note: string }
  | { kind: ItemRequestKind; itemId: number; quantity: number; note: string }

export type ChangeRequest = RequestDraft & {
  id: number
  roomId: number
  status: RequestStatus
  submittedBy: number
  reviewedBy: number | null
}

export type AppState = {
  departments: Department[]
  rooms: Room[]
  users: User[]
  items: InventoryItem[]
  requests: ChangeRequest[]
}
