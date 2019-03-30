const databaseName = 'github-stars';

module.exports = {
	development: {
		client: 'sqlite3',
		connection: {
			filename: `./db-development-${databaseName}.sqlite`
		},
		migrations: {
			directory: __dirname + '/src/server/db/migrations'
		},
		seeds: {
			directory: __dirname + '/src/server/db/seeds'
		},
		useNullAsDefault: true
	},
	production: {
		client: 'sqlite3',
		connection: {
			filename: `./db-production-${databaseName}.sqlite`
		},
		migrations: {
			directory: __dirname + '/src/server/db/migrations'
		},
		seeds: {
			directory: __dirname + '/src/server/db/seeds'
		}
	}
};
