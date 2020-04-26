const knex = require('../connection');

function getRepoById(id) {
	return knex('job_queue')
	  .where({id})
	  .update({is_processing: true});
}

async function insertRepo(repo) {
	let result = await knex('repos')
		.where({id: repo.id})
		.update(repo);

	if (!result) {
		result = knex('repos').insert(repo);
	}

	return result;
}

module.exports = {
	insertRepo
};
