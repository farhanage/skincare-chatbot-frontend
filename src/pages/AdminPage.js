import React from 'react';
import { AdminDashboard } from '../components/Admin';

export default function AdminPage({ user }) {
  return <AdminDashboard user={user} />;
}
