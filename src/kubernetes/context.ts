import { client } from './client';
import { Argv } from 'yargs';

export function contextHandler(args: Argv) {
	if (args.argv._.length === 1) {
		console.log(client.currentContext);
	}

	args
		.command('current', 'Get the current context', () => {
			console.log(client.currentContext);
		})
		.command('list', 'List all the contexts', () => {
			console.log(client.contexts);
		}).argv;
}
