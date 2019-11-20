import * as k8s from '@kubernetes/client-node';

function configureKubernetesClient() {
	try {
		const k8sClient = new k8s.KubeConfig();
		k8sClient.loadFromDefault();
		return k8sClient;
	} catch (error) {
		throw new Error(error);
	}
}

export const client = configureKubernetesClient();

export const api = client.makeApiClient(k8s.CoreV1Api);
