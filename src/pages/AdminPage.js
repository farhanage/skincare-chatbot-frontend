import React from 'react';
import { AdminDashboard } from '../features/admin';

export default function AdminPage({ user }) {
  return <AdminDashboard user={user} />;
}
