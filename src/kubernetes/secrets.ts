import inquirer, { QuestionCollection } from 'inquirer';
import { Argv } from 'yargs';
import { api } from './client';
import { getCurrentNamespace, findMatches } from '../util';

export async function secretsHandler(args: Argv) {
	const currentNamespace = getCurrentNamespace();

	if (!currentNamespace) {
		console.log('You are currently not inside a namespace');
		process.exit(0);
	}

	if (args.argv._.length === 1) {
		const secrets = await getSecretsForNamespace(currentNamespace);

		const secretNames = secrets.items.map(secret => secret.metadata?.name);

		const secret = await promptForMissingSecret(secretNames);
		console.log(await readSecretData(secret, currentNamespace));
	}

	args
		.command('list', 'List the secrets in the current namespace', async () => {
			const secrets = await getSecretsForNamespace(currentNamespace);

			const secretNames = secrets.items.map(secret => secret.metadata?.name);

			console.log(secretNames);
		})
		.command('read', 'Read the secret', async ({ argv }) => {
			const { response, body } = await api.listNamespacedSecret(
				currentNamespace
			);

			if (response.statusCode !== 200) {
				throw new Error(
					`Error: Issue getting secrets for namespace '${currentNamespace}'\nkubernetes api responded with status code: ${response.statusCode}`
				);
			}

			const secretNames = body.items.map(secret => secret.metadata?.name);

			if (argv._.length === 2) {
				const secret = await promptForMissingSecret(secretNames);
				const data = await readSecretData(secret, currentNamespace);
				console.log(data);
			} else {
				const matches = findMatches(secretNames, argv._[2]);

				const uniques = [...new Set(matches)];
				if (uniques.length === 1) {
					const data = await readSecretData(uniques[0], currentNamespace);
					console.log(data);
				} else {
					const promptedSecret = await promptForMissingSecret(matches);
					const data = await readSecretData(promptedSecret, currentNamespace);
					console.log(data);
				}
			}
		}).argv;
}

async function getSecretsForNamespace(namespace: string) {
	const { response, body } = await api.listNamespacedSecret(namespace);

	if (response.statusCode !== 200) {
		throw new Error(
			`Error: Issue getting secrets for namespace '${namespace}'\nkubernetes api responded with status code: ${response.statusCode}`
		);
	}

	return body;
}

async function readSecretData(secret: string, namespace: string) {
	const { response, body } = await api.readNamespacedSecret(secret, namespace);

	if (response.statusCode !== 200) {
		throw new Error(
			`Error: Issue reading secret '${secret}'\nkubernetes api responded with status code: ${response.statusCode}`
		);
	}

	if (body.data) {
		const decodedSecrets = Object.entries(body.data).map(([key, value]) => {
			const secret: { [key: string]: string } = {};
			secret[key] = Buffer.from(value, 'base64').toString('ascii');
			return secret;
		});

		return decodedSecrets;
	}
}

async function promptForMissingSecret(
	secretNames: (string | undefined)[]
): Promise<string> {
	const questions: QuestionCollection = [
		{
			type: 'list',
			name: 'secret',
			message: 'Please select a secret to read:',
			choices: secretNames,
		},
	];

	const answers = await inquirer.prompt(questions);

	return answers['secret'];
}
