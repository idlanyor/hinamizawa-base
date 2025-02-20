import chalk from 'chalk';

export class Logger {
    static info(message) {
        console.log(chalk.blue(`[INFO] ${message}`));
    }

    static success(message) {
        console.log(chalk.green(`[SUCCESS] ${message}`));
    }

    static error(message, error) {
        console.error(chalk.red(`[ERROR] ${message}`), error);
    }

    static warn(message) {
        console.warn(chalk.yellow(`[WARN] ${message}`));
    }
} 