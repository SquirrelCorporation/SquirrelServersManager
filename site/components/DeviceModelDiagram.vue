<script setup>
// Simple placeholder component until Vue Flow is properly integrated
</script>

<template>
  <div class="device-model-diagram">
    <div class="model-placeholder">
      <div class="placeholder-header">
        <span class="placeholder-icon">🖥️</span>
        <h3 style="display: inline-flex; align-items: center; margin: 0;">Device Data Model</h3>
      </div>
      <p>This interactive diagram will show the relationships between Device, SSH Connection, Docker Engine, Containers, and Metrics.</p>
      <div class="placeholder-nodes">
        <div class="placeholder-node">
          <div class="node-title">🖥️ Device</div>
          <div class="node-props">id, name, ip, status...</div>
        </div>
        <div class="placeholder-node">
          <div class="node-title">🔑 SSH Connection</div>
          <div class="node-props">host, port, username...</div>
        </div>
        <div class="placeholder-node">
          <div class="node-title">🐳 Docker Engine</div>
          <div class="node-props">version, status...</div>
        </div>
        <div class="placeholder-node">
          <div class="node-title">📦 Containers</div>
          <div class="node-props">id, name, image...</div>
        </div>
        <div class="placeholder-node">
          <div class="node-title">📊 Metrics</div>
          <div class="node-props">cpu, memory, disk...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.device-model-diagram {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-soft);
  margin: 20px 0;
  padding: 20px;
}

.model-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.placeholder-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.placeholder-icon {
  font-size: 24px;
  margin-right: 10px;
  vertical-align: middle;
}

.placeholder-nodes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.placeholder-node {
  background-color: var(--vp-c-bg);
  border: 2px solid var(--vp-c-brand);
  border-radius: 8px;
  padding: 12px;
  width: 180px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.node-title {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 14px;
}

.node-props {
  font-family: monospace;
  font-size: 12px;
  color: var(--vp-c-text-2);
}
</style>
