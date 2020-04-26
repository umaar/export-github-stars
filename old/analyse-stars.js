require('dotenv').config();

const path = require('path');
const level = require('level');
const express = require('express');
const nunjucks = require('nunjucks');
const {formatDistance, parseISO} = require('date-fns');

const app = express();

const database = level(process.env.DATABASE_NAME, {valueEncoding: 'json'});

const username = 'umaar';

async function getStars() {
	const stars = await database.get(username);

	console.log(`Found ${stars.length} for ${username}. Example: `);
	console.log(stars[0]);

	const sortedStars = stars.sort((itemA, itemB) => {
		const starredAtA = itemA.starredAt;
		const starredAtB = itemB.starredAt;

		if (starredAtA < starredAtB) {
		  return -1;
		}

		if (starredAtA > starredAtB) {
		  return 1;
		}
	});

	return sortedStars.reverse();
}

function createServer() {
	const nunjucksEnvironment = nunjucks.configure(path.join(__dirname, 'templates'), {
		express: app,
		autoescape: true,
		watch: true
	});

	nunjucksEnvironment.addFilter('formatDistance', string => {
		return formatDistance(parseISO(string), new Date(), {
			includeSeconds: true,
			addSuffix: true
		});
	});

	app.set('port', 3000);
	app.use(express.static('./static'));

	app.listen(app.get('port'), () => {
		console.log('The server is running on http://localhost:' + app.get('port'));
	});

	return app;
}

async function start() {
	const stars = await getStars();
	const app = createServer();

	app.get('/', (request, res) => {
		res.render('index.html', {
			stars: stars.slice(0, 10)
		});
	});

	app.get('/get-stars', (request, res) => {
		const offset = Number.parseInt(request.query.offset) || 0;
		const amount = Number.parseInt(request.query.amount) || 5;

		const starsToRender = stars.slice(offset, offset + amount);

		if (starsToRender.length) {
			return res.render('stars.html', {
				stars: starsToRender
			});
		}

		return res.sendStatus(204);
	});
}

start();
