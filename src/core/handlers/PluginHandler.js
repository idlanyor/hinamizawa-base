import chalk from "chalk";
import { pathToFileURL } from 'url';
import fs from 'fs-extra';
import path from 'path';
import { BasePlugin } from '../base/BasePlugin.js';

export class PluginHandler {
    constructor(client) {
        this.client = client;
        this.plugins = new Map();
    }

    async loadPlugin(pluginPath) {
        try {
            const fileUrl = pathToFileURL(pluginPath).href;
            const plugin = await import(fileUrl);
            
            if (!plugin.default) {
                throw new Error('Plugin harus mengekspor class sebagai default export');
            }

            const pluginInstance = new plugin.default(this.client);
            
            // Cek apakah plugin mewarisi BasePlugin
            if (!(pluginInstance instanceof BasePlugin)) {
                throw new Error('Plugin harus mewarisi BasePlugin');
            }

            await pluginInstance.initialize();
            this.plugins.set(pluginInstance.name, pluginInstance);
            console.log(chalk.green(`✓ Plugin ${pluginInstance.name} berhasil dimuat`));
        } catch (error) {
            console.error(chalk.red(`❌ Gagal memuat plugin:`, error));
        }
    }

    async loadPlugins() {
        try {
            const pluginsPath = this.client.config.pluginsPath;
            
            if (!fs.existsSync(pluginsPath)) {
                await fs.mkdir(pluginsPath, { recursive: true });
                return;
            }

            const plugins = await fs.readdir(pluginsPath);

            for (const plugin of plugins) {
                if (!plugin.endsWith('.js')) continue;
                const fullPath = path.join(pluginsPath, plugin);
                await this.loadPlugin(fullPath);
            }
        } catch (error) {
            console.error(chalk.red('❌ Error loading plugins:', error));
        }
    }
}