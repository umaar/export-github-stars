# The default target must be at the top
.DEFAULT_GOAL := start

install:
	npm install

update-deps:
	ncu -u

migrate-db-dev:
	./node_modules/.bin/knex migrate:latest --env development

migrate-db-production:
	./node_modules/.bin/knex migrate:latest --env production

seed-db-dev:
	./node_modules/.bin/knex seed:run --env development

seed-db-production:
	./node_modules/.bin/knex seed:run --env production

start:
	NODE_ENV=development ./node_modules/gulp/bin/gulp.js

build:
	./node_modules/gulp/bin/gulp.js build

test:
	./node_modules/.bin/xo