exports.seed = (knex, Promise) => {
	return Promise.all([
		knex('user_stars').del(),
		knex('job_queue').del(),
		knex('repos').del()
	]);
};
