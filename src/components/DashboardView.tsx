import { canReview, isLowStock, itemsFor, requestsFor, roomsFor } from '../domain/inventory'
import type { AppState, User } from '../domain/types'

type Props = {
  actor: User
  state: AppState
}

export function DashboardView({ actor, state }: Props) {
  const items = itemsFor(actor, state)
  const lowStock = items.filter(isLowStock)
  const awaitingAction = requestsFor(actor, state).filter((request) => canReview(actor, request))
  const units = items.reduce((sum, item) => sum + item.stock, 0)
  const value = items.reduce((sum, item) => sum + item.stock * item.price, 0)
  const roomName = (id: number) => state.rooms.find((room) => room.id === id)?.name ?? 'Unknown'

  return (
    <>
      <section className="metrics-grid">
        <article className="metric-card blue">
          <span>Total items</span>
          <strong>{items.length}</strong>
          <small>Across {roomsFor(actor, state.rooms).length} rooms</small>
        </article>
        <article className="metric-card green">
          <span>Units in stock</span>
          <strong>{units}</strong>
          <small>In your rooms</small>
        </article>
        <article className="metric-card amber">
          <span>Inventory value</span>
          <strong>${value.toLocaleString()}</strong>
          <small>Stock times unit price</small>
        </article>
        <article className="metric-card red">
          <span>Awaiting your action</span>
          <strong>{awaitingAction.length}</strong>
          <small>Requests to review</small>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Low stock</h3>
        </div>
        {lowStock.length === 0 ? (
          <p className="empty-state">Nothing is at or below its reorder level.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Room</th>
                  <th>Stock</th>
                  <th>Reorder</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{roomName(item.roomId)}</td>
                    <td>
                      <span className="stock critical">{item.stock}</span>
                    </td>
                    <td>{item.reorderLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
