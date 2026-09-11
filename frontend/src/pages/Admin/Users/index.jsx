import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Shield, User, ShieldAlert, Users as UsersIcon } from 'lucide-react';
import adminService from '../../../services/adminService';
import { PageLoader } from '../../../components/common/Loader';
import Button from '../../../components/common/Button';
import Alert from '../../../components/common/Alert';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers(0, 100);
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await adminService.deleteUser(id);
      setSuccess('User deleted successfully.');
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      setError('Failed to delete user.');
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      await adminService.updateUser(user.id, { role: newRole });
      setSuccess(`User role updated to ${newRole}.`);
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    } catch (err) {
      setError('Failed to update role.');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full text-[#0a192f]">
      <div className="glass-card p-6 sm:p-8 rounded-3xl bg-white/95 border border-sky-200/90 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7]">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#0a192f] tracking-tight">User Management</h1>
            <p className="text-slate-600 text-sm font-semibold mt-0.5">Manage user accounts, administrative privileges, and security roles.</p>
          </div>
        </div>
      </div>

      <Alert type="error" message={error} show={!!error} onClose={() => setError('')} />
      <Alert type="success" message={success} show={!!success} onClose={() => setSuccess('')} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 sm:p-8 rounded-3xl bg-white/95 border border-slate-200 shadow-md overflow-hidden"
      >
        <div className="overflow-x-auto custom-scrollbar -mx-6 px-6 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[640px] text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-black uppercase text-[11px] tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 rounded-l-xl">ID</th>
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-sky-50/50 transition-colors">
                  <td className="py-4 px-4 text-slate-500 font-bold">#{user.id}</td>
                  <td className="py-4 px-4">
                    <p className="text-[#0a192f] font-black">{user.full_name || 'Anonymous User'}</p>
                    <p className="text-slate-600 font-medium text-xs">{user.email}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                      user.role === 'ADMIN' 
                        ? 'bg-purple-50 text-purple-600 border border-purple-200' 
                        : 'bg-sky-50 text-[#0284c7] border border-sky-200'
                    }`}>
                      {user.role === 'ADMIN' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {new Date(user.created_at).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleRole(user)}
                      title="Toggle Admin/User Role"
                      className="!px-3"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleDelete(user.id)}
                      className="!px-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 font-semibold">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
