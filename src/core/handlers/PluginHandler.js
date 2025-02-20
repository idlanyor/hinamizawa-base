import chalk from "chalk";

export class PluginHandler {
    constructor(client) {
        this.client = client;
        this.plugins = new Map();
    }

    async loadPlugin(pluginPath) {
        try {
            const plugin = await import(pluginPath);
            
            if (!plugin.default) {
                throw new Error('Plugin harus mengekspor class sebagai default export');
            }

            const pluginInstance = new plugin.default(this.client);
            await pluginInstance.initialize();
            
            this.plugins.set(pluginInstance.name, pluginInstance);
            console.log(chalk.green(`✓ Plugin ${pluginInstance.name} berhasil dimuat`));
        } catch (error) {
            console.error(chalk.red(`❌ Gagal memuat plugin:`, error));
        }
    }

    async loadPlugins() {
        const pluginsPath = this.client.config.pluginsPath;
        const plugins = await fs.readdir(pluginsPath);

        for (const plugin of plugins) {
            if (!plugin.endsWith('.js')) continue;
            await this.loadPlugin(path.join(pluginsPath, plugin));
        }
    }
}