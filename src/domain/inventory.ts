import { can, type Role } from '../auth/roles'
import type {
  AppState,
  ChangeRequest,
  InventoryItem,
  NewItem,
  RequestDraft,
  RequestKind,
  RequestStatus,
  Room,
  User,
} from './types'

export const REQUEST_KIND_LABELS: Record<RequestKind, string> = {
  stock_adjustment: 'Stock change',
  damage_report: 'Damaged or missing',
  disposal: 'Disposal or write-off',
  new_item: 'New item',
}

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pending_custodian: 'Waiting for Custodian',
  pending_school_head: 'Waiting for School Head',
  approved: 'Approved',
  rejected: 'Rejected',
}

export function roomsFor(user: User, rooms: Room[]): Room[] {
  switch (user.role) {
    case 'custodian':
    case 'school_head':
      return rooms
    case 'department_head':
      return rooms.filter((room) => room.departmentId === user.departmentId)
    case 'room_in_charge':
      return rooms.filter((room) => user.roomIds.includes(room.id))
    case 'system_admin':
      return []
  }
}

function roomIdsFor(user: User, state: AppState): Set<number> {
  return new Set(roomsFor(user, state.rooms).map((room) => room.id))
}

export function itemsFor(user: User, state: AppState): InventoryItem[] {
  const roomIds = roomIdsFor(user, state)
  return state.items.filter((item) => roomIds.has(item.roomId))
}

export function requestsFor(user: User, state: AppState): ChangeRequest[] {
  const roomIds = roomIdsFor(user, state)
  return state.requests.filter((request) => roomIds.has(request.roomId))
}

export function submittableKinds(role: Role): RequestKind[] {
  if (can(role, 'requests:submit')) {
    return ['stock_adjustment', 'damage_report', 'disposal', 'new_item']
  }
  return can(role, 'requests:submit_disposal') ? ['disposal'] : []
}

export function canReview(user: User, request: ChangeRequest): boolean {
  if (request.status === 'pending_custodian') return can(user.role, 'requests:review')
  if (request.status === 'pending_school_head') return can(user.role, 'disposals:final_approve')
  return false
}

export function isLowStock(item: InventoryItem): boolean {
  return item.stock <= item.reorderLevel
}

export function describeRequest(request: ChangeRequest, items: InventoryItem[]): string {
  if (request.kind === 'new_item') {
    return `New item: ${request.newItem.name} (${request.newItem.stock} units)`
  }
  const name = items.find((item) => item.id === request.itemId)?.name ?? 'Unknown item'
  if (request.kind === 'stock_adjustment') {
    return `Stock change: ${name} (${request.quantity > 0 ? '+' : ''}${request.quantity})`
  }
  return `${REQUEST_KIND_LABELS[request.kind]}: ${name} (${request.quantity} units)`
}

function nextId(records: { id: number }[]): number {
  return records.reduce((highest, record) => Math.max(highest, record.id), 0) + 1
}

function insertItem(items: InventoryItem[], newItem: NewItem): InventoryItem[] {
  const id = nextId(items)
  return [{ ...newItem, id, sku: `NEW-${String(id).padStart(3, '0')}` }, ...items]
}

function changeStock(items: InventoryItem[], itemId: number, change: number): InventoryItem[] {
  return items.map((item) =>
    item.id === itemId ? { ...item, stock: Math.max(0, item.stock + change) } : item,
  )
}

function applyRequest(items: InventoryItem[], request: ChangeRequest): InventoryItem[] {
  if (request.kind === 'new_item') return insertItem(items, request.newItem)
  const change = request.kind === 'stock_adjustment' ? request.quantity : -request.quantity
  return changeStock(items, request.itemId, change)
}

export function submitRequest(state: AppState, actor: User, draft: RequestDraft): AppState {
  if (!submittableKinds(actor.role).includes(draft.kind)) return state

  const roomId =
    draft.kind === 'new_item'
      ? draft.newItem.roomId
      : state.items.find((item) => item.id === draft.itemId)?.roomId
  if (roomId === undefined || !roomIdsFor(actor, state).has(roomId)) return state

  const status: RequestStatus = can(actor.role, 'requests:review')
    ? 'pending_school_head'
    : 'pending_custodian'
  const request: ChangeRequest = {
    ...draft,
    id: nextId(state.requests),
    roomId,
    status,
    submittedBy: actor.id,
    reviewedBy: null,
  }
  return { ...state, requests: [request, ...state.requests] }
}

export function reviewRequest(
  state: AppState,
  actor: User,
  requestId: number,
  decision: 'approve' | 'reject',
): AppState {
  const request = state.requests.find((candidate) => candidate.id === requestId)
  if (!request || !canReview(actor, request)) return state

  let status: RequestStatus = 'rejected'
  let items = state.items
  if (decision === 'approve') {
    if (request.kind === 'disposal' && request.status === 'pending_custodian') {
      status = 'pending_school_head'
    } else {
      status = 'approved'
      items = applyRequest(items, request)
    }
  }

  const requests = state.requests.map((candidate) =>
    candidate.id === requestId ? { ...candidate, status, reviewedBy: actor.id } : candidate,
  )
  return { ...state, items, requests }
}

export function adjustStock(state: AppState, actor: User, itemId: number, change: number): AppState {
  if (!can(actor.role, 'inventory:edit')) return state
  return { ...state, items: changeStock(state.items, itemId, change) }
}

export function addItem(state: AppState, actor: User, newItem: NewItem): AppState {
  if (!can(actor.role, 'inventory:edit')) return state
  return { ...state, items: insertItem(state.items, newItem) }
}

export function changeUserRole(state: AppState, actor: User, userId: number, role: Role): AppState {
  if (!can(actor.role, 'accounts:manage') || actor.id === userId) return state
  return {
    ...state,
    users: state.users.map((user) => (user.id === userId ? { ...user, role } : user)),
  }
}
