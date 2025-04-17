import SamplePluginComponent from "./SamplePluginComponent";

// This file would typically export the component or initialization logic
// needed by the host application's plugin system.
// For Module Federation, we expose the component via vite.config.ts.

// If needed for standalone testing or specific MF setups, you might render here:
// const container = document.getElementById('sample-plugin-root');
// if (container) {
//   const root = ReactDOM.createRoot(container);
//   root.render(<SamplePluginComponent />);
// }

// Export the component directly for Module Federation exposure
export default SamplePluginComponent;
