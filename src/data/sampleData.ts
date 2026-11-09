import type { AppState } from '../domain/types'

// Placeholder records used until the hosted database is connected.
export const initialState: AppState = {
  departments: [
    { id: 1, name: 'Science' },
    { id: 2, name: 'Mathematics' },
    { id: 3, name: 'Administration' },
  ],
  rooms: [
    { id: 1, name: 'Science Lab', departmentId: 1 },
    { id: 2, name: 'Room 201', departmentId: 2 },
    { id: 3, name: 'Room 202', departmentId: 2 },
    { id: 4, name: 'Supply Room', departmentId: 3 },
  ],
  users: [
    { id: 1, name: 'Sample Room in Charge (Science Lab)', role: 'room_in_charge', roomIds: [1], departmentId: null },
    { id: 2, name: 'Sample Room in Charge (Rooms 201-202)', role: 'room_in_charge', roomIds: [2, 3], departmentId: null },
    { id: 3, name: 'Sample Property Custodian', role: 'custodian', roomIds: [], departmentId: null },
    { id: 4, name: 'Sample Department Head (Science)', role: 'department_head', roomIds: [], departmentId: 1 },
    { id: 5, name: 'Sample Department Head (Mathematics)', role: 'department_head', roomIds: [], departmentId: 2 },
    { id: 6, name: 'Sample School Head', role: 'school_head', roomIds: [], departmentId: null },
    { id: 7, name: 'Sample System Admin', role: 'system_admin', roomIds: [], departmentId: null },
  ],
  items: [
    { id: 1, name: 'Laptop Pro 14', sku: 'LTP-014', category: 'Electronics', stock: 18, reorderLevel: 6, price: 1299, supplier: 'TechNova', roomId: 1 },
    { id: 2, name: 'Office Chair', sku: 'OFF-204', category: 'Furniture', stock: 7, reorderLevel: 5, price: 240, supplier: 'Comfort Works', roomId: 2 },
    { id: 3, name: 'Printer Ink', sku: 'INK-019', category: 'Supplies', stock: 3, reorderLevel: 8, price: 42, supplier: 'PrintHub', roomId: 4 },
    { id: 4, name: 'USB-C Hub', sku: 'USB-312', category: 'Electronics', stock: 22, reorderLevel: 10, price: 68, supplier: 'TechNova', roomId: 3 },
    { id: 5, name: 'Safety Gloves', sku: 'SAF-118', category: 'Safety', stock: 12, reorderLevel: 6, price: 18, supplier: 'SafeLine', roomId: 1 },
    { id: 6, name: 'Desk Lamp', sku: 'LMP-440', category: 'Furniture', stock: 4, reorderLevel: 5, price: 84, supplier: 'Comfort Works', roomId: 2 },
  ],
  requests: [
    { id: 1, kind: 'stock_adjustment', itemId: 5, quantity: 6, note: 'New box received', roomId: 1, status: 'pending_custodian', submittedBy: 1, reviewedBy: null },
    { id: 2, kind: 'disposal', itemId: 2, quantity: 1, note: 'Broken frame, cannot be repaired', roomId: 2, status: 'pending_custodian', submittedBy: 2, reviewedBy: null },
  ],
}
