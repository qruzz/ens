import yargs from 'yargs';
import { contextHandler, logsHandler, secretsHandler } from './kubernetes';

export function cli(args: string[]) {
	yargs
		.command('context', 'Get information about the k8s context', yargs =>
			contextHandler(yargs)
		)
		.command('logs', 'Get logs for a resource', yargs => logsHandler(yargs))
		.command('secrets', 'Get information about secrets', yargs =>
			secretsHandler(yargs)
		).argv;
	// .option('verbose', {
	// 	alias: 'v',
	// 	type: 'boolean',
	// 	description: 'Run with verbose logging',
	// });
}
