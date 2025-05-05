<template>
  <div class="playbook-model-diagram">
    <div class="diagram-container">
      <div class="diagram-header">
        <h3>Playbook Model Architecture</h3>
      </div>
      <div class="diagram">
        <div class="playbook-node central-node">
          <div class="node-icon">📘</div>
          <div class="node-title">Playbook</div>
          <div class="node-description">Ansible-based automation script</div>
        </div>
        
        <div class="connection-container">
          <div class="connection top-left">
            <div class="connection-line"></div>
            <div class="connection-node">
              <div class="node-icon">🏗️</div>
              <div class="node-title">Structure</div>
              <div class="node-description">
                <ul>
                  <li>Plays</li>
                  <li>Tasks</li>
                  <li>Handlers</li>
                  <li>Roles</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="connection top-right">
            <div class="connection-line"></div>
            <div class="connection-node">
              <div class="node-icon">💾</div>
              <div class="node-title">Storage</div>
              <div class="node-description">
                <ul>
                  <li>Local</li>
                  <li>Remote Git</li>
                  <li>Version Control</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="connection bottom-left">
            <div class="connection-line"></div>
            <div class="connection-node">
              <div class="node-icon">▶️</div>
              <div class="node-title">Execution</div>
              <div class="node-description">
                <ul>
                  <li>Manual</li>
                  <li>Scheduled</li>
                  <li>Triggered</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="connection bottom-right">
            <div class="connection-line"></div>
            <div class="connection-node">
              <div class="node-icon">🔄</div>
              <div class="node-title">Variables</div>
              <div class="node-description">
                <ul>
                  <li>Inventory</li>
                  <li>Playbook</li>
                  <li>Extra</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playbook-model-diagram {
  margin: 2rem 0;
}

.diagram-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.diagram-header {
  background-color: #3a5ccc;
  color: white;
  padding: 1rem;
  text-align: center;
}

.diagram-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.diagram {
  padding: 2rem;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.playbook-node {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 180px;
  z-index: 2;
}

.central-node {
  border: 2px solid #3a5ccc;
}

.node-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.node-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #3a5ccc;
}

.node-description {
  font-size: 0.9rem;
  color: #495057;
}

.node-description ul {
  text-align: left;
  margin: 0.5rem 0 0 0;
  padding-left: 1.5rem;
}

.node-description li {
  margin-bottom: 0.25rem;
}

.connection-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  z-index: 1;
}

.connection {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.top-left {
  grid-column: 1;
  grid-row: 1;
  justify-content: flex-end;
  align-items: flex-end;
  padding-right: 100px;
  padding-bottom: 20px;
}

.top-right {
  grid-column: 2;
  grid-row: 1;
  justify-content: flex-start;
  align-items: flex-end;
  padding-left: 100px;
  padding-bottom: 20px;
}

.bottom-left {
  grid-column: 1;
  grid-row: 2;
  justify-content: flex-end;
  align-items: flex-start;
  padding-right: 100px;
  padding-top: 20px;
}

.bottom-right {
  grid-column: 2;
  grid-row: 2;
  justify-content: flex-start;
  align-items: flex-start;
  padding-left: 100px;
  padding-top: 20px;
}

.connection-line {
  position: absolute;
  background-color: #e9ecef;
  z-index: 1;
}

.top-left .connection-line {
  width: 100px;
  height: 2px;
  right: 0;
  bottom: 50%;
}

.top-right .connection-line {
  width: 100px;
  height: 2px;
  left: 0;
  bottom: 50%;
}

.bottom-left .connection-line {
  width: 100px;
  height: 2px;
  right: 0;
  top: 50%;
}

.bottom-right .connection-line {
  width: 100px;
  height: 2px;
  left: 0;
  top: 50%;
}

.connection-node {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 160px;
  z-index: 2;
}

@media (max-width: 768px) {
  .diagram {
    padding: 1rem;
    min-height: 800px;
  }
  
  .connection-container {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 1fr);
  }
  
  .top-left, .top-right, .bottom-left, .bottom-right {
    justify-content: center;
    align-items: center;
    padding: 0;
  }
  
  .top-left {
    grid-column: 1;
    grid-row: 1;
  }
  
  .top-right {
    grid-column: 1;
    grid-row: 2;
  }
  
  .bottom-left {
    grid-column: 1;
    grid-row: 3;
  }
  
  .bottom-right {
    grid-column: 1;
    grid-row: 4;
  }
  
  .connection-line {
    display: none;
  }
  
  .playbook-node {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
