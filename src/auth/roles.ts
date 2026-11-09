export const ROLES = [
  'room_in_charge',
  'custodian',
  'department_head',
  'school_head',
  'system_admin',
] as const

export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  room_in_charge: 'Room in Charge',
  custodian: 'School Property Custodian',
  department_head: 'Department Head',
  school_head: 'School Head',
  system_admin: 'System Admin',
}

export type Permission =
  | 'inventory:view'
  | 'inventory:edit'
  | 'requests:submit'
  | 'requests:submit_disposal'
  | 'requests:review'
  | 'disposals:final_approve'
  | 'reports:view'
  | 'accounts:manage'

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  room_in_charge: ['inventory:view', 'requests:submit'],
  custodian: [
    'inventory:view',
    'inventory:edit',
    'requests:submit_disposal',
    'requests:review',
    'reports:view',
  ],
  department_head: ['inventory:view', 'reports:view'],
  school_head: ['inventory:view', 'disposals:final_approve', 'reports:view'],
  system_admin: ['accounts:manage'],
}

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

export type View = 'dashboard' | 'inventory' | 'requests' | 'reports' | 'accounts'

export const VIEW_LABELS: Record<View, string> = {
  dashboard: 'Dashboard',
  inventory: 'Inventory',
  requests: 'Requests',
  reports: 'Reports',
  accounts: 'Accounts',
}

export function viewsFor(role: Role): View[] {
  const views: View[] = []
  if (can(role, 'inventory:view')) views.push('dashboard', 'inventory', 'requests')
  if (can(role, 'reports:view')) views.push('reports')
  if (can(role, 'accounts:manage')) views.push('accounts')
  return views
}
