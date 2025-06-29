import React from 'react';
import { usePlugins } from '../contexts/plugin-context';

/**
 * Component to render plugin routes
 */
const PluginRoutes: React.FC = () => {
  const { getPluginRoutes } = usePlugins();
  const routes = getPluginRoutes();

  if (!routes || routes.length === 0) {
    return null;
  }

  // Routes are registered with the application router
  // This component doesn't need to render anything
  return null;
};

export default PluginRoutes;
