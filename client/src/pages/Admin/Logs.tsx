import React from 'react';
import { LogsPage } from '@features/admin/ui/LogsPage';

/**
 * Admin Logs Page Route Component
 * 
 * This is a thin wrapper that imports and renders the LogsPage component
 * from the admin feature. Following FSD principles, page components should
 * be minimal and focused only on routing concerns.
 */
export default function AdminLogsPage() {
  return <LogsPage />;
}