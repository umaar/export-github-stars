require('dotenv').config();
const Octokit = require('@octokit/rest');
const LinkHeader = require('http-link-header');
const level = require('level');

const database = level(process.env.DATABASE_NAME, {valueEncoding: 'json'});

function getStarCountFromLinkHeader(linkValue) {
	const link = LinkHeader.parse(linkValue);
	const [lastRel] = link.get('rel', 'last');
	const lastURL = new URL(lastRel.uri);
	const totalStars = Number.parseInt(lastURL.searchParams.get('page'));

	if (Number.isInteger(totalStars)) {
		return totalStars;
	}

	throw new Error(`Couldn't retrieve total stars from: ${linkValue}`);
}

const githubToken = process.env.GITHUB_TOKEN;
let octokitConfig = {};

if (githubToken) {
	octokitConfig = {
		auth: `token ${githubToken}`
	};
} else {
	console.log('No GitHub auth token found. API will be used in a non-authenticated manner');
}

const octokit = new Octokit(octokitConfig);

const username = 'umaar';
const maxItemsPerPage = 100;

async function getStarsOnPage({page, amountPerPage}) {
	if (!page || !amountPerPage) {
		throw new Error(`Did not pass in required parameters correctly. Page: ${page}, AmountPerPage: ${amountPerPage}`);
	}

	console.time('API Request');
	const response = await octokit.activity.listReposStarredByUser({
		page,
		username,
		per_page: amountPerPage,
		sort: 'created',
		mediaType: {
			format: 'star+json'
		}
	});
	console.timeEnd('API Request');

	return response;
}

function flushDB() {
	return database.put(username, []);
}

async function updateStarsInDB(newStars) {
	const existingStars = await database.get(username);
	const newValue = [...existingStars, ...newStars];
	await database.put(username, newValue);
}

async function start() {
	const {headers} = await getStarsOnPage({
		amountPerPage: 1,
		page: 1
	});

	const count = getStarCountFromLinkHeader(headers.link);
	const numberOfPages = Math.ceil(count / maxItemsPerPage);

	console.log(`There are ${count} stars across ${numberOfPages} pages, while requesting ${maxItemsPerPage} stars per page`, '\n');

	await flushDB();

	for (let page = 1; page <= numberOfPages; page++) {
		console.log(`Requesting page ${page}`);
		const {data, headers} = await getStarsOnPage({
			amountPerPage: maxItemsPerPage,
			page
		});

		console.log(`Page ${page}: ${headers.status}. Got ${data.length} items`, '\n');

		if (!data || !data.length) {
			console.log('No data found. Stopping.');
			break;
		}

		const cherryPickedData = data.map(item => {
			const repo = {
				starredAt: item.starred_at,
				createdAt: item.repo.created_at,
				forksCount: item.repo.forks_count,
				fullName: item.repo.full_name,
				name: item.repo.name,
				homepage: item.repo.homepage,
				url: item.repo.html_url,
				language: item.repo.language,
				private: item.repo.private,
				stars: item.repo.stargazers_count,
				owner: item.repo.owner.login,
				description: item.repo.description
			};

			return repo;
		});

		await updateStarsInDB(cherryPickedData);
	}

	console.log('\nFinished', '\n');
}

start();
