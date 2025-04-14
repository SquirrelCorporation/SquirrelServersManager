import React from "react";
// Example: Assume Button exists in the main app's shared components
// This import will be resolved via Module Federation
// import { Button } from '@/components'; // Assuming Button is exposed by the host

const SamplePluginComponent: React.FC = () => {
  return (
    <div style={{ border: "1px dashed blue", padding: "10px", margin: "10px" }}>
      <h2>Hello from Sample Plugin!</h2>
      <p>This component is loaded dynamically via Module Federation.</p>
      {/* Example of using a shared component */}
      {/* <Button type="primary">Shared Button</Button> */}
    </div>
  );
};

export default SamplePluginComponent;
