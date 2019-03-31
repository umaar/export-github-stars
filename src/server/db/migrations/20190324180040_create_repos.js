exports.up = function(knex, Promise) {
	return knex.schema.createTable('repos', table => {
		table.integer('id').unique().primary();

		table.timestamp('created_at').notNullable();
		table.boolean('private').notNullable().defaultTo(false);
		table.integer('forks').notNullable();
		table.integer('stars').notNullable();
		table.string('full_name').notNullable();
		table.string('name').notNullable();
		table.string('url').notNullable();
		table.string('owner').notNullable();
		table.string('homepage');
		table.string('language');
		table.string('description');

		table.timestamp('database_entry_updated_at').defaultTo(knex.fn.now())
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('repos');
};
