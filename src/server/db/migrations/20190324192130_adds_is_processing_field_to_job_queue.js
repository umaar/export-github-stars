exports.up = knex => {
	return knex.schema.table('job_queue', table => {
		table.boolean('is_processing').defaultTo(false);
	});
};

exports.down = knex => {
	return knex.schema.table('job_queue', table => {
		table.dropColumn('is_processing');
	});
};
