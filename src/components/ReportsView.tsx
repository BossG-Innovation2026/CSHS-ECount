import { isLowStock, itemsFor, requestsFor, roomsFor } from '../domain/inventory'
import type { AppState, User } from '../domain/types'

type Props = {
  actor: User
  state: AppState
}

export function ReportsView({ actor, state }: Props) {
  const items = itemsFor(actor, state)
  const requests = requestsFor(actor, state)
  const departmentName = (id: number) =>
    state.departments.find((department) => department.id === id)?.name ?? 'Unknown'

  const rows = roomsFor(actor, state.rooms).map((room) => {
    const roomItems = items.filter((item) => item.roomId === room.id)
    return {
      room,
      itemCount: roomItems.length,
      units: roomItems.reduce((sum, item) => sum + item.stock, 0),
      value: roomItems.reduce((sum, item) => sum + item.stock * item.price, 0),
      lowStock: roomItems.filter(isLowStock).length,
      pending: requests.filter(
        (request) => request.roomId === room.id && request.status.startsWith('pending'),
      ).length,
    }
  })

  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Inventory by room</h3>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Room</th>
              <th>Department</th>
              <th>Items</th>
              <th>Units</th>
              <th>Value</th>
              <th>Low stock</th>
              <th>Pending requests</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.room.id}>
                <td>{row.room.name}</td>
                <td>{departmentName(row.room.departmentId)}</td>
                <td>{row.itemCount}</td>
                <td>{row.units}</td>
                <td>${row.value.toLocaleString()}</td>
                <td>{row.lowStock}</td>
                <td>{row.pending}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
