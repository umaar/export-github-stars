require('dotenv').config();
const Octokit = require('@octokit/rest')
const LinkHeader = require('http-link-header');

function getStarCountFromLinkHeader(linkValue) {
	var link = LinkHeader.parse(linkValue);
	const [lastRel] = link.get('rel', 'last');
	const lastURL = new URL(lastRel.uri);
	const totalStars = parseInt(lastURL.searchParams.get('page'));

	if (Number.isInteger(totalStars)) {
		return totalStars;
	} else {
		throw new Error(`Couldn't retrieve total stars from: ${linkValue}`);
	}
}

const githubToken = process.env.GITHUB_TOKEN;
let octokitConfig = {};

if (githubToken) {
	octokitConfig = {
		auth: `token ${githubToken}`
	}
} else {
	console.log('No GitHub auth token found. API will be used in a non-authenticated manner');
}

const octokit = new Octokit(octokitConfig);

const username = 'squarefeet';

async function getStarsOnPage({page, amountPerPage}) {
	if (!page || !amountPerPage) {
		throw new Error(`Did not pass in required parameters correctly. Page: ${page}, AmountPerPage: ${amountPerPage}`);
	}

	console.time('API Request');
	const response  = await octokit.activity.listReposStarredByUser({
		page,
		username: username,
		per_page: amountPerPage,
		sort: 'created',
		mediaType: {
			format: 'star+json'
		}
	});
	console.timeEnd('API Request');

	return response
}

async function start() {
	const {headers} = await getStarsOnPage({
		amountPerPage: 1,
		page: 1
	});

	const count = getStarCountFromLinkHeader(headers.link);
	console.log(`There are a total of ${count} stars`);
	console.log('\n');
}

start();