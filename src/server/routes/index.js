require('dotenv').config();

const express = require('express');
const config = require('config');
const got = require('got');
const escapeGoat = require('escape-goat');
const {formatDistance} = require('date-fns');

const Octokit = require('@octokit/rest')

const {app} = require('../app-instance');

const jobQueueQueries = require('../db/queries/job-queue');
const userStarsQueries = require('../db/queries/user-stars');
const repoQueries = require('../db/queries/repo-queries');

const router = express.Router();

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

function random(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

const api = {
	async getStarsOnPage({page, amountPerPage, username}) {
		if (!page || !amountPerPage) {
			throw new Error(`Did not pass in required parameters correctly. Page: ${page}, AmountPerPage: ${amountPerPage}`);
		}

		console.time('API Request');
		const response  = await octokit.activity.listReposStarredByUser({
			page,
			username: username.toLowerCase(),
			per_page: amountPerPage,
			sort: 'created',
			mediaType: {
				format: 'star+json'
			}
		});
		console.timeEnd('API Request');
		return response
	}
};

async function setupJobs() {
	const jobProcessors = {
		async 'fetch-stars'(username) {
			username = username.toLowerCase();
			const githubPageSize = 100;

			console.log(`Received a fetch star job for ${username}`);

			const existingStarsLength = await userStarsQueries.getStarsCountForUser(username);

			let completedPages = 0;
			let remainder = 0;

			if (existingStarsLength > 0) {
				completedPages = Math.floor(existingStarsLength / githubPageSize);

				remainder = existingStarsLength % githubPageSize;

				console.log(`Found ${existingStarsLength} stars for ${username}. ${completedPages} pages (remainder ${remainder}) have already been downloaded using a page size of ${githubPageSize}.`);
			} else {
				console.log(`No existing stars found for ${username}`);
			}

			// GitHub API pages start from 1, not 0
			let page = completedPages + 1;

			while (true) {
				console.log(`Requesting page ${page}, items per page: ${githubPageSize}`);

				let response;

				try {
					response = await api.getStarsOnPage({
						amountPerPage: githubPageSize,
						page,
						username
					});
				} catch (err) {
					console.log('There was an error', err);
					return;
				}

				 let {data, headers} = response;

				function getTimeDistance(targetTime) {
					return formatDistance(targetTime, new Date(), {
						includeSeconds: true,
						addSuffix: true
					});
				}

				const rateLimit = {
					resetTime: new Date(headers['x-ratelimit-reset'] * 1000),
					limit: headers['x-ratelimit-limit'],
					remaining: headers['x-ratelimit-remaining'],
				};

				rateLimit.timeDistance = getTimeDistance(rateLimit.resetTime);

				app.locals.rateLimit = rateLimit;

				console.log(`Page ${page}: ${headers.status}. Got ${data.length} items`, '\n');

				if (!data || !data.length) {
					console.log('No data found. Stopping.');
					break;
				}

				if (remainder) {
					console.log(`We found a remainder of ${remainder}. The data was previously of size: ${data.length}`);
					data = data.slice(remainder);
					remainder = 0;
					console.log(`But now the data has been truncated to size ${data.length}`);
				}

				for (let item of data) {
					const repo = {
						id: item.repo.id,
						created_at: item.repo.created_at,
						private: item.repo.private,
						forks: item.repo.forks_count,
						stars: item.repo.stargazers_count,
						full_name: item.repo.full_name,
						name: item.repo.name,
						homepage: item.repo.homepage,
						url: item.repo.html_url,
						language: item.repo.language,
						description: item.repo.description,
						owner: item.repo.owner.login
					};

					const star = {
						starred_time: item.starred_at,
						stargazer_username: username,
						repo_id: item.repo.id,
					};

					await repoQueries.insertRepo(repo);
					await userStarsQueries.insertStar(star);
				}

				page++;
			}
		}
	};

	async function findIncompleteJobs() {
		console.log('Looking for jobs which are still in a running state after an application restart');

		const incompleteJob = await jobQueueQueries.getJobInAProcessingState();

		if (incompleteJob) {
			console.log('Found an incomplete job!', incompleteJob);
			await handleJob(incompleteJob);
		} else {
			console.log('No incomplete jobs found, will resume to polling for new jobs');
		}
	}

	async function handleJob(job) {
		const jobType = job.type;
		const jobID = job.id;
		const jobHandler = jobProcessors[jobType];

		if (jobHandler) {
			await jobQueueQueries.markJobAsBeingProcessed(jobID);
			await jobHandler(job.data);
			console.log('Job has completed', jobID);
			await jobQueueQueries.deleteJobByID(jobID)
			//delete job here!
		} else {
			throw new Error(`Found a job of type: ${jobType}, but could not find a corresponding handler`);
		}
	}

	async function processJobQueue() {
		const nextJob = await jobQueueQueries.getNextJob();

		if (nextJob) {
			console.log('Found a new job');
			await handleJob(nextJob);
		}

		setTimeout(async () => {
			await processJobQueue();
		}, 1500);
	}

	await findIncompleteJobs();
	await processJobQueue();
}

setupJobs();

async function canUsernameBeSubmitted(username) {
	username = username.toLowerCase();
	if (username.length > 30 || !username.length) {
		return {
			errorMessage: 'That username is unexpected in length'
		};
	}

	const jobData = {type: 'fetch-stars', data: username};
	const existingJob = await jobQueueQueries.getJobByTypeAndData(jobData);

	if (existingJob) {
		console.info(`Existing job found`, existingJob);
		return {
			errorMessage: `You already have a job in the queue!`
		};
	}

	const mostRecent = await userStarsQueries.getMostRecentThing(username);

	if (mostRecent) {
		/*
			TODO: `database_entry_updated_at` is not an accurate indicator of when
			a job was last run for a user. Shoud we persist job_queue records?
		*/
		const mostRecentCreatedTime = new Date(mostRecent.database_entry_updated_at);
		const howLongAgo = Date.now() - mostRecentCreatedTime;

		const tenMinutes = ((1000 * 60) * 10);

		if (howLongAgo < tenMinutes) {
			return {
				errorMessage: `Your stars have been updated quite recently already, try again soon!`
			};
		}
	}

	return true;
}

router.post('/submit-github-username', async (req, res) => {
	const githubUsername = req.body['github-username-field'];
	const username = escapeGoat.escape(githubUsername).toLowerCase();

	// sanitize username here
	const {errorMessage} = await canUsernameBeSubmitted(username);

	if (errorMessage) {
		req.flash('messages', {
			status: 'danger',
			value: errorMessage
		});

		return res.redirect('/');
	}

	const job = {
		type: 'fetch-stars',
		data: username
	};

	try {
		await jobQueueQueries.createJob(job)
	} catch (err) {
		console.log('There was an error creating a job: ', err);
		req.flash('messages', {
			status: 'danger',
			value: `Could not create a job for ${username}`
		});

		return res.redirect('/');
	}

	req.flash('messages', {
		status: 'success',
		value: `Created a job for ${username}`
	});

	return res.redirect('/');
});

router.get('/user/:rawUsername', async (req, res) => {
	// Should redirect page to lowercase version here
	const username = escapeGoat.escape(req.params.rawUsername).toLowerCase();

	console.time('Time to retrieve stars for user');
	const stars = await userStarsQueries.getStarsForUser(username);
	const totalStarsLength = await userStarsQueries.getStarsCountForUser(username);
	console.timeEnd('Time to retrieve stars for user');

	if (!stars.length) {
		req.flash('messages', {
			status: 'danger',
			value: `Couldn't find ${username}`
		});

		return res.redirect('/');
	}

	const renderObject = {
		messages: req.flash('messages'),
		stars,
		totalStarsLength,
		username
	};

	res.render('user', renderObject);
});

router.get('/jobs', async (req, res) => {
	const jobs = await jobQueueQueries.getAllJobs();

	const renderObject = {
		messages: req.flash('messages'),
		jobs
	};

	res.render('jobs', renderObject);
});

router.get('/', async (req, res) => {
	console.time('Time to get distinct users');
	const distinctUsers = await userStarsQueries.getDistinctUsersWithStarCount();
	console.timeEnd('Time to get distinct users');

	const renderObject = {
		messages: req.flash('messages'),
		distinctUsers: distinctUsers.sort((itemA, itemB) => {
			const countA = itemA.count;
			const countB = itemB.count;

			if (countA < countB) {
			  return -1;
			}
			if (countA > countB) {
			  return 1;
			}
		}).reverse()
	};

	res.render('index', renderObject);
});

module.exports = router;
