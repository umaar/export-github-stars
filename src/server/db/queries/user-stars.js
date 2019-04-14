const knex = require('../connection');

function getStarsForUser(username) {
	return knex('user_stars')
		.select(
			'user_stars.*',
			'repos.full_name AS repo_full_name',
			'repos.stars AS repo_stars',
			'repos.language AS repo_language',
			'repos.description AS repo_description',
			'repos.url AS repo_url'
		)
		.where({ stargazer_username: username })
		.join('repos', {'user_stars.repo_id': 'repos.id'})
		.limit(20);
}

async function getStarsCountForUser(username) {
	const results = await knex('user_stars')
		.where({ stargazer_username: username })
		.count('id as count')
		.first();
	return results.count;
}

async function getDistinctUsersWithStarCount() {
	const stars = await knex('user_stars')
		.groupBy('stargazer_username')
		.count('stargazer_username as count')
		.select('stargazer_username');

	return stars.map(({count, stargazer_username}) => {
		return {
			count,
			username: stargazer_username
		};
	});
}

function insertStar(star) {
	return knex('user_stars').insert(star);
}

module.exports = {
	getStarsForUser,
	insertStar,
	getDistinctUsersWithStarCount,
	getStarsCountForUser
};
