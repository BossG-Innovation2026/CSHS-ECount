import { useState } from 'react'
import './App.css'
import { can, ROLE_LABELS, VIEW_LABELS, viewsFor, type Role, type View } from './auth/roles'
import { AccountsView } from './components/AccountsView'
import { DashboardView } from './components/DashboardView'
import { InventoryView } from './components/InventoryView'
import { ReportsView } from './components/ReportsView'
import { RequestsView } from './components/RequestsView'
import { initialState } from './data/sampleData'
import {
  addItem,
  adjustStock,
  changeUserRole,
  isLowStock,
  itemsFor,
  reviewRequest,
  submitRequest,
} from './domain/inventory'
import type { AppState, NewItem, RequestDraft } from './domain/types'

function App() {
  const [state, setState] = useState<AppState>(initialState)
  const [actorId, setActorId] = useState(initialState.users[0].id)
  const [selectedView, setSelectedView] = useState<View>('dashboard')

  const actor = state.users.find((user) => user.id === actorId) ?? state.users[0]
  const views = viewsFor(actor.role)
  const view = views.includes(selectedView) ? selectedView : views[0]
  const lowStockCount = itemsFor(actor, state).filter(isLowStock).length

  const handleAdjustStock = (itemId: number, change: number) =>
    setState((current) => adjustStock(current, actor, itemId, change))
  const handleAddItem = (newItem: NewItem) => setState((current) => addItem(current, actor, newItem))
  const handleSubmitRequest = (draft: RequestDraft) =>
    setState((current) => submitRequest(current, actor, draft))
  const handleReview = (requestId: number, decision: 'approve' | 'reject') =>
    setState((current) => reviewRequest(current, actor, requestId, decision))
  const handleChangeRole = (userId: number, role: Role) =>
    setState((current) => changeUserRole(current, actor, userId, role))

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
          {views.map((option) => (
            <button
              key={option}
              className={option === view ? 'nav-item active' : 'nav-item'}
              aria-current={option === view ? 'page' : undefined}
              onClick={() => setSelectedView(option)}
            >
              {VIEW_LABELS[option]}
            </button>
          ))}
        </nav>

        {can(actor.role, 'inventory:view') && (
          <div className="sidebar-card">
            <p>Low stock alert</p>
            <strong>{lowStockCount} items</strong>
            <span>Need reorder soon</span>
          </div>
        )}

        <label className="demo-switcher">
          Demo only: view as
          <select value={actor.id} onChange={(event) => setActorId(Number(event.target.value))}>
            {state.users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <small>Replaced by real logins once the database is connected.</small>
        </label>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">{ROLE_LABELS[actor.role]}</p>
            <h1>{VIEW_LABELS[view]}</h1>
          </div>
        </header>

        {view === 'dashboard' && <DashboardView actor={actor} state={state} />}
        {view === 'inventory' && (
          <InventoryView
            key={actor.id}
            actor={actor}
            state={state}
            onAdjustStock={handleAdjustStock}
            onAddItem={handleAddItem}
            onSubmitRequest={handleSubmitRequest}
          />
        )}
        {view === 'requests' && <RequestsView actor={actor} state={state} onReview={handleReview} />}
        {view === 'reports' && <ReportsView actor={actor} state={state} />}
        {view === 'accounts' && <AccountsView actor={actor} state={state} onChangeRole={handleChangeRole} />}
      </main>
    </div>
  )
}

export default App
