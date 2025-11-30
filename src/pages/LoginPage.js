import React from 'react';
import { Login } from '../components/Auth';

export default function LoginPage({ onLogin }) {
  return <Login onLogin={onLogin} />;
}
