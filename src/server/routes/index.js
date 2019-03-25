const express = require('express');
const config = require('config');
const got = require('got');
const escapeGoat = require('escape-goat');

const jobQueueQueries = require('../db/queries/job-queue');
const userStarsQueries = require('../db/queries/user-stars');
const repoQueries = require('../db/queries/repo-queries');

const router = express.Router();

// const awairClientID = config.get('awairClientID');

function random(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

const api = {
	async getStarsOnPage({page, amountPerPage, username}) {
		if (!page || !amountPerPage) {
			throw new Error(`Did not pass in required parameters correctly. Page: ${page}, AmountPerPage: ${amountPerPage}`);
		}

		console.time('API Request');
		// const response  = await octokit.activity.listReposStarredByUser({
		// 	page,
		// 	username: username,
		// 	per_page: amountPerPage,
		// 	sort: 'created',
		// 	mediaType: {
		// 		format: 'star+json'
		// 	}
		// });

		await sleep(1500);
		function getMockObj() {
			return {
			    "starred_at": "2011-01-16T19:06:43Z",
			    "repo": {
			      "id": random(1000, 9999999),
			      "node_id": "MDEwOlJlcG9zaXRvcnkxMjk2MjY5",
			      "name": `page-${page}-${random(1,999999)}`,
			      "full_name": `a-${random(1,999999)}`,
			      "owner": {
			        "login": "octocat",
			        "id": 1,
			        "node_id": "MDQ6VXNlcjE=",
			        "avatar_url": "https://github.com/images/error/octocat_happy.gif",
			        "gravatar_id": "",
			        "url": "https://api.github.com/users/octocat",
			        "html_url": "https://github.com/octocat",
			        "followers_url": "https://api.github.com/users/octocat/followers",
			        "following_url": "https://api.github.com/users/octocat/following{/other_user}",
			        "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
			        "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
			        "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
			        "organizations_url": "https://api.github.com/users/octocat/orgs",
			        "repos_url": "https://api.github.com/users/octocat/repos",
			        "events_url": "https://api.github.com/users/octocat/events{/privacy}",
			        "received_events_url": "https://api.github.com/users/octocat/received_events",
			        "type": "User",
			        "site_admin": false
			      },
			      "private": false,
			      "html_url": "https://github.com/octocat/Hello-World",
			      "description": "This your first repo!",
			      "fork": false,
			      "url": "https://api.github.com/repos/octocat/Hello-World",
			      "archive_url": "http://api.github.com/repos/octocat/Hello-World/{archive_format}{/ref}",
			      "assignees_url": "http://api.github.com/repos/octocat/Hello-World/assignees{/user}",
			      "blobs_url": "http://api.github.com/repos/octocat/Hello-World/git/blobs{/sha}",
			      "branches_url": "http://api.github.com/repos/octocat/Hello-World/branches{/branch}",
			      "collaborators_url": "http://api.github.com/repos/octocat/Hello-World/collaborators{/collaborator}",
			      "comments_url": "http://api.github.com/repos/octocat/Hello-World/comments{/number}",
			      "commits_url": "http://api.github.com/repos/octocat/Hello-World/commits{/sha}",
			      "compare_url": "http://api.github.com/repos/octocat/Hello-World/compare/{base}...{head}",
			      "contents_url": "http://api.github.com/repos/octocat/Hello-World/contents/{+path}",
			      "contributors_url": "http://api.github.com/repos/octocat/Hello-World/contributors",
			      "deployments_url": "http://api.github.com/repos/octocat/Hello-World/deployments",
			      "downloads_url": "http://api.github.com/repos/octocat/Hello-World/downloads",
			      "events_url": "http://api.github.com/repos/octocat/Hello-World/events",
			      "forks_url": "http://api.github.com/repos/octocat/Hello-World/forks",
			      "git_commits_url": "http://api.github.com/repos/octocat/Hello-World/git/commits{/sha}",
			      "git_refs_url": "http://api.github.com/repos/octocat/Hello-World/git/refs{/sha}",
			      "git_tags_url": "http://api.github.com/repos/octocat/Hello-World/git/tags{/sha}",
			      "git_url": "git:github.com/octocat/Hello-World.git",
			      "issue_comment_url": "http://api.github.com/repos/octocat/Hello-World/issues/comments{/number}",
			      "issue_events_url": "http://api.github.com/repos/octocat/Hello-World/issues/events{/number}",
			      "issues_url": "http://api.github.com/repos/octocat/Hello-World/issues{/number}",
			      "keys_url": "http://api.github.com/repos/octocat/Hello-World/keys{/key_id}",
			      "labels_url": "http://api.github.com/repos/octocat/Hello-World/labels{/name}",
			      "languages_url": "http://api.github.com/repos/octocat/Hello-World/languages",
			      "merges_url": "http://api.github.com/repos/octocat/Hello-World/merges",
			      "milestones_url": "http://api.github.com/repos/octocat/Hello-World/milestones{/number}",
			      "notifications_url": "http://api.github.com/repos/octocat/Hello-World/notifications{?since,all,participating}",
			      "pulls_url": "http://api.github.com/repos/octocat/Hello-World/pulls{/number}",
			      "releases_url": "http://api.github.com/repos/octocat/Hello-World/releases{/id}",
			      "ssh_url": "git@github.com:octocat/Hello-World.git",
			      "stargazers_url": "http://api.github.com/repos/octocat/Hello-World/stargazers",
			      "statuses_url": "http://api.github.com/repos/octocat/Hello-World/statuses/{sha}",
			      "subscribers_url": "http://api.github.com/repos/octocat/Hello-World/subscribers",
			      "subscription_url": "http://api.github.com/repos/octocat/Hello-World/subscription",
			      "tags_url": "http://api.github.com/repos/octocat/Hello-World/tags",
			      "teams_url": "http://api.github.com/repos/octocat/Hello-World/teams",
			      "trees_url": "http://api.github.com/repos/octocat/Hello-World/git/trees{/sha}",
			      "clone_url": "https://github.com/octocat/Hello-World.git",
			      "mirror_url": "git:git.example.com/octocat/Hello-World",
			      "hooks_url": "http://api.github.com/repos/octocat/Hello-World/hooks",
			      "svn_url": "https://svn.github.com/octocat/Hello-World",
			      "homepage": "https://github.com",
			      "language": null,
			      "forks_count": 9,
			      "stargazers_count": 80,
			      "watchers_count": 80,
			      "size": 108,
			      "default_branch": "master",
			      "open_issues_count": 0,
			      "topics": [
			        "octocat",
			        "atom",
			        "electron",
			        "API"
			      ],
			      "has_issues": true,
			      "has_projects": true,
			      "has_wiki": true,
			      "has_pages": false,
			      "has_downloads": true,
			      "archived": false,
			      "pushed_at": "2011-01-26T19:06:43Z",
			      "created_at": "2011-01-26T19:01:12Z",
			      "updated_at": "2011-01-26T19:14:43Z",
			      "permissions": {
			        "admin": false,
			        "push": false,
			        "pull": true
			      },
			      "allow_rebase_merge": true,
			      "allow_squash_merge": true,
			      "allow_merge_commit": true,
			      "subscribers_count": 42,
			      "network_count": 0
			    }
			   };
			}// getMock

		data = [];
		for (let i=0; i< amountPerPage; i++) {
			const mock = getMockObj();
			data.push(mock)
		}

		if (random(1, 5) === 3) {
			console.log('randomly stopping data!');
			data = [];
		}

		let response = {
			headers: {
				status: '200 OK'
			},
			data
		}
		console.timeEnd('API Request');

		return response
	}
};

async function setupJobs() {
	const jobProcessors = {
		async 'fetch-stars'(username) {
			const githubPageSize = 2;

			console.log(`Received a fetch star job for ${username}`);

			const existingStars = await userStarsQueries.getStarsForUser(username);

			let completedPages = 0;
			let remainder = 0;

			if (existingStars > 0) {
				const existingStarsLength = existingStars;
				completedPages = Math.floor(existingStarsLength / githubPageSize);

				remainder = existingStarsLength % githubPageSize;

				console.log(`Found ${existingStarsLength} stars for ${username}. ${completedPages} (remainder ${remainder}) have already been downloaded using a page size of ${githubPageSize}.`);
			} else {
				console.log(`No existing stars found for ${username}`);
			}

			// GitHub API pages start from 1, not 0
			let page = completedPages + 1;

			while (true) {
				console.log(`Requesting page ${page}, items per page: ${githubPageSize}`);

				const {data, headers} = await api.getStarsOnPage({
					amountPerPage: githubPageSize,
					page
				});

				console.log(`Page ${page}: ${headers.status}. Got ${data.length} items`, '\n');

				if (!data || !data.length) {
					console.log('No data found. Stopping.');
					break;
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
	}

	await findIncompleteJobs();
	await processJobQueue();

	setInterval(async () => {
		await processJobQueue();
	}, 1500);
}

setupJobs();

async function canUsernameBeSubmitted(username) {
	if (username.length > 20 || !username.length) {
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
		const mostRecentCreatedTime = new Date(mostRecent.database_entry_updated_at);
		const howLongAgo = Date.now() - mostRecentCreatedTime;
		console.info(`Existing thing found, was created ${howLongAgo}`);

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
	const username = escapeGoat.escape(githubUsername);

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

router.get('/jobs', async (req, res) => {
	const jobs = await jobQueueQueries.getAllJobs();

	const renderObject = {
		messages: req.flash('messages'),
		jobs
	};

	res.render('jobs', renderObject);
});

router.get('/', async (req, res) => {
	const renderObject = {
		messages: req.flash('messages')
	};

	res.render('index', renderObject);
});

module.exports = router;
