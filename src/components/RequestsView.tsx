import {
  canReview,
  describeRequest,
  REQUEST_STATUS_LABELS,
  requestsFor,
} from '../domain/inventory'
import type { AppState, ChangeRequest, User } from '../domain/types'

type Props = {
  actor: User
  state: AppState
  onReview: (requestId: number, decision: 'approve' | 'reject') => void
}

function approveLabel(request: ChangeRequest): string {
  return request.kind === 'disposal' && request.status === 'pending_custodian'
    ? 'Forward to School Head'
    : 'Approve'
}

export function RequestsView({ actor, state, onReview }: Props) {
  const requests = requestsFor(actor, state)
  const roomName = (id: number) => state.rooms.find((room) => room.id === id)?.name ?? 'Unknown'
  const userName = (id: number) => state.users.find((user) => user.id === id)?.name ?? 'Unknown'

  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Change requests</h3>
      </div>
      {requests.length === 0 ? (
        <p className="empty-state">No requests to show.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Request</th>
                <th>Room</th>
                <th>Submitted by</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <div className="item-cell">
                      <div>
                        <strong>{describeRequest(request, state.items)}</strong>
                        <small>{request.note}</small>
                      </div>
                    </div>
                  </td>
                  <td>{roomName(request.roomId)}</td>
                  <td>{userName(request.submittedBy)}</td>
                  <td>
                    <span className={`status-tag ${request.status}`}>
                      {REQUEST_STATUS_LABELS[request.status]}
                    </span>
                  </td>
                  <td>
                    {canReview(actor, request) ? (
                      <div className="review-actions">
                        <button onClick={() => onReview(request.id, 'approve')}>{approveLabel(request)}</button>
                        <button className="reject" onClick={() => onReview(request.id, 'reject')}>Reject</button>
                      </div>
                    ) : (
                      <span className="muted">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
