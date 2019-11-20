import { client } from './kubernetes';

/**
 * Use to get the current working namespace in the kubernetes cluster.
 */
export function getCurrentNamespace() {
	const currentContext = client.currentContext;
	if (currentContext.length === 0) {
		console.log('You are currently not inside a namespace');
		process.exit(0);
	}

	for (let contextIndex in client.contexts) {
		if (client.contexts[contextIndex].name === currentContext) {
			return client.contexts[contextIndex].namespace;
		}
	}
}

export function findMatches(array: (string | undefined)[], matcher?: string) {
	return array
		.map(item => (item?.includes(matcher || '') ? item : null))
		.filter((value): value is string => value !== null);
}
