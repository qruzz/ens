import inquirer, { QuestionCollection } from 'inquirer';
import { Argv } from 'yargs';
import { getCurrentNamespace, findMatches } from '../util';
import { api } from './client';

export async function logsHandler(args: Argv) {
	const currentNamespace = getCurrentNamespace();

	if (!currentNamespace) {
		console.log('You are currently not inside a namespace');
		process.exit(0);
	}

	const { response, body } = await api.listNamespacedPod(currentNamespace);

	if (response.statusCode !== 200) {
		throw new Error(
			`Error: Issue getting pods for namespace '${currentNamespace}'\nkubernetes api responded with status code: ${response.statusCode}`
		);
	}

	const podNames = body.items.map(pod => pod.metadata?.name);

	if (args.argv._.length === 1) {
		// If there is only one argument, prompt the user for a pod
		const pod = await promptForMissingPod(podNames);
		console.log(await getLogsForPod(pod, currentNamespace));
	} else {
		// Get all the pods that match part of the second argument from the user
		const matchedPods = findMatches(podNames, args.argv._[1]);

		// Pod names are of the following form "<name-of-pod>-some-hash". This function
		// strips the hashes away from the pod names
		const cleanNames = matchedPods.map(podName => {
			const temp = podName.split('-');
			return temp.slice(0, temp.length - 2).join('-');
		});

		// Get unique names from the cleaned names
		const uniqueNames = [...new Set(cleanNames)];

		if (uniqueNames.length === 1) {
			// If there is unique name, print the logs for that pod
			console.log(await getLogsForPod(matchedPods[0], currentNamespace));
		} else {
			// If there are more than one unique pod name, prompt the user to pick
			const pod = await promptForMissingPod(matchedPods);
			console.log(await getLogsForPod(pod, currentNamespace));
		}
	}
}

/**
 * Use to get kubernetes logs for a pod in a given namespace.
 * @param pod The name of the pod for which to get the logs
 * @param namespace The namespace to in which to operate
 */
async function getLogsForPod(pod: string, namespace: string) {
	const { response, body } = await api.readNamespacedPodLog(pod, namespace);

	if (response.statusCode !== 200) {
		throw new Error(
			`Error: Issue getting logs for pod '${pod}' in '${namespace}'\nkubernetes api responded with status code: ${response.statusCode}`
		);
	}

	return body;
}

/**
 * Prompt the user for a the missing pod by passing in an array of pod names
 * and return the user selected pod.
 * @param podNames	The array of pod names to pick from
 */
async function promptForMissingPod(
	podNames: (string | undefined)[]
): Promise<string> {
	const questions: QuestionCollection = [
		{
			type: 'list',
			name: 'pod',
			message: 'Please select a pod to get logs for:',
			choices: podNames,
		},
	];

	const answers = await inquirer.prompt(questions);

	return answers['pod'];
}
