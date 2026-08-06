import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Building, Calendar, DollarSign, Trash2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user account? All associated records will be deleted.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 space-y-8">
      {/* Banner */}
      <div className="glass-premium p-6 rounded-2xl flex items-center space-x-4 border border-border">
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20">
          A
        </div>
        <div>
          <h1 className="text-lg font-bold">{user?.name}</h1>
          <p className="text-2xs text-muted-foreground uppercase font-bold tracking-wider">{user?.email} • Admin Dashboard</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
        {/* Users */}
        <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-3xs text-muted-foreground font-extrabold uppercase tracking-wider">Total Users</p>
            <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
            <p className="text-3xs text-muted-foreground">{stats?.builderCount || 0} Builders • {stats?.buyerCount || 0} Buyers</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Properties */}
        <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-3xs text-muted-foreground font-extrabold uppercase tracking-wider">Listed Properties</p>
            <p className="text-2xl font-bold text-white">{stats?.totalProperties || 0}</p>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl">
            <Building className="h-6 w-6" />
          </div>
        </div>

        {/* Bookings */}
        <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-3xs text-muted-foreground font-extrabold uppercase tracking-wider">Bookings Made</p>
            <p className="text-2xl font-bold text-white">{stats?.totalBookings || 0}</p>
            <p className="text-3xs text-muted-foreground">{stats?.confirmedBookings || 0} Confirmed Payments</p>
          </div>
          <div className="p-3 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-3xs text-muted-foreground font-extrabold uppercase tracking-wider">Total Collection</p>
            <p className="text-2xl font-bold text-primary text-glow">₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* User Moderation Management */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />
          <span>User Management</span>
        </h2>

        <div className="bg-card text-card-foreground rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-2xs uppercase tracking-wider text-muted-foreground font-extrabold">
                <tr>
                  <th className="px-6 py-4">User Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">System Role</th>
                  <th className="px-6 py-4 text-right">Delete Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {users.map((usr) => (
                  <tr key={usr.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-6 py-4 font-bold">{usr.name}</td>
                    <td className="px-6 py-4">{usr.email}</td>
                    <td className="px-6 py-4">{usr.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded text-3xs font-extrabold uppercase tracking-wider ${
                        usr.role === 'ADMIN' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        usr.role === 'BUILDER' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {usr.id !== reqUserDisable() && (
                        <button
                          onClick={() => handleDeleteUser(usr.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  function reqUserDisable() {
    return user?.id;
  }
}
