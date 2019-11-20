const utils = require('../src/util');

describe('return matches from array', () => {
	it('only returns one item when all items match', () => {
		const array = ['graphql-pod', 'graphql-server', 'api-test'];

		expect(utils.findMatches(array, 'graphql-pod')).toEqual(['graphql-pod']);
	});
});
