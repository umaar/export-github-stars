exports.up = function (knex, Promise) {
	return knex.schema.createTable('user_stars', table => {
		table.increments();

		table.integer('repo_id').references('id').inTable('repos');
		table.timestamp('starred_time').notNullable();
		table.string('stargazer_username').notNullable();

		table.timestamp('database_entry_updated_at').defaultTo(knex.fn.now());
	});
};

exports.down = function (knex, Promise) {
	return knex.schema.dropTable('user_stars');
};
