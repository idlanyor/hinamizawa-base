export class Plugin {
  constructor(client, options = {}) {
    this.client = client;
    this.name = options.name;
    this.description = options.description;
    this.version = options.version || '1.0.0';
    this.enabled = options.enabled !== false;
  }

  // Lifecycle hooks
  async onLoad() {}
  async onEnable() {}
  async onDisable() {}

  // Helper methods
  enable() {
    this.enabled = true;
    this.onEnable();
  }

  disable() {
    this.enabled = false; 
    this.onDisable();
  }
} 