import { ROLE_LABELS, ROLES, type Role } from '../auth/roles'
import type { AppState, User } from '../domain/types'

type Props = {
  actor: User
  state: AppState
  onChangeRole: (userId: number, role: Role) => void
}

export function AccountsView({ actor, state, onChangeRole }: Props) {
  const assignment = (user: User) => {
    const rooms = state.rooms.filter((room) => user.roomIds.includes(room.id)).map((room) => room.name)
    const department = state.departments.find((candidate) => candidate.id === user.departmentId)
    return [...rooms, ...(department ? [`${department.name} department`] : [])].join(', ') || 'None'
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h3>User accounts</h3>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Assigned to</th>
            </tr>
          </thead>
          <tbody>
            {state.users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>
                  <select
                    aria-label={`Role for ${user.name}`}
                    value={user.role}
                    disabled={user.id === actor.id}
                    onChange={(event) => onChangeRole(user.id, event.target.value as Role)}
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{assignment(user)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
