import React from 'react';
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Store } from '../Store.js';

export default function AdminRoute({ children }) {
  const { state } = useContext(Store);
  const { userInfo } = state;

  return userInfo && userInfo.isAdmin ? children : <Navigate to="/signin" />;
}
