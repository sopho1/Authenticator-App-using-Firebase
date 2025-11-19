import React, { useEffect, useMemo, useState } from 'react';
import './AdminDashboard.css';
import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { ClipLoader } from 'react-spinners';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionUser, setActionUser] = useState(null);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'users'));
      const mapped = snapshot.docs.map((userDoc) => ({ id: userDoc.id, ...userDoc.data() }));
      setUsers(mapped);
      setError('');
    } catch (err) {
      console.error('Error fetching users', err);
      setError('Unable to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const roleTotals = useMemo(
    () =>
      users.reduce(
        (acc, user) => {
          const role = (user.role || 'user').toLowerCase();
          acc[role] = (acc[role] || 0) + 1;
          acc.total += 1;
          return acc;
        },
        { total: 0 }
      ),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return users;
    return users.filter((user) => {
      const name = (user.username || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [users, searchTerm]);

  const handleRoleUpdate = async (userId, newRole) => {
    setActionUser(userId);
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user)));
    } catch (err) {
      console.error('Failed to update role', err);
      setError('Updating role failed. Please retry.');
    } finally {
      setActionUser(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmation = window.confirm('Remove this account? This cannot be undone.');
    if (!confirmation) return;
    setActionUser(userId);
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      console.error('Failed to delete user', err);
      setError('Deleting user failed. Please retry.');
    } finally {
      setActionUser(null);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Admin Control</p>
          <h1>Registration Overview</h1>
          <p>Monitor everyone entering your universe. Adjust roles, elevate partners, or remove access in seconds.</p>
        </div>
        <button className="btn ghost" onClick={fetchUsers} disabled={loading}>
          Refresh data
        </button>
      </header>

      <section className="admin-stats">
        <article>
          <p>Total Registered</p>
          <h2>{roleTotals.total}</h2>
        </article>
        <article>
          <p>Admins</p>
          <h2>{roleTotals.admin || 0}</h2>
        </article>
        <article>
          <p>Members</p>
          <h2>{roleTotals.user || 0}</h2>
        </article>
        <article>
          <p>Other Roles</p>
          <h2>{(roleTotals.total || 0) - ((roleTotals.admin || 0) + (roleTotals.user || 0))}</h2>
        </article>
      </section>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <p className="admin-error">{error}</p>}

      {loading ? (
        <div className="admin-loader">
          <ClipLoader color="#47c2ff" size={48} />
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.username || 'Unknown'}</td>
                  <td>{user.email || '—'}</td>
                  <td>
                    <select
                      value={user.role || 'user'}
                      onChange={(event) => handleRoleUpdate(user.id, event.target.value)}
                      disabled={actionUser === user.id}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                    </select>
                  </td>
                  <td>
                    <button className="ghost tiny" onClick={() => handleDeleteUser(user.id)} disabled={actionUser === user.id}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!filteredUsers.length && (
                <tr>
                  <td colSpan="4" className="empty-state">
                    No matching users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

