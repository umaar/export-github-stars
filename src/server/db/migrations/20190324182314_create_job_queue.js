
exports.up = function(knex, Promise) {
	return knex.schema.createTable('job_queue', table => {
		table.uuid('id').notNullable().primary();

		table.timestamp('created_at').defaultTo(knex.fn.now())
		table.timestamp('updated_at').defaultTo(knex.fn.now())

		table.string('type').notNullable();
		table.string('data').notNullable();

		table.boolean('is_processing').defaultTo(false);
		table.boolean('is_complete').defaultTo(false);
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('job_queue');
};
