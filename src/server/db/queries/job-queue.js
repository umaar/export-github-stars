const uuidv1 = require('uuid/v1');
const knex = require('../connection');


function markJobAsBeingProcessed(id) {
	return knex('job_queue')
	  .where({ id })
	  .update({ is_processing: true });
}

function deleteJobByID(id) {
	console.log('Deleting job by ID: ', id);
	return knex('job_queue')
	  .where({ id })
	  .del();
}

function getAllJobs() {
	return knex('job_queue');
}

function getJobByTypeAndData({type, data}) {
	return knex('job_queue')
		.where({type, data})
		.first();
}

function getJobInAProcessingState() {
	return knex('job_queue')
		.where('is_processing', true)
		.first();
}

async function getNextJob() {
	// First in first out
	const currentlyProcessingJob = await getJobInAProcessingState();

	if (currentlyProcessingJob) {
		return;
	}

	return knex('job_queue')
		.orderBy('created_at', 'asc')
		.first();
}

function createJob(job) {
	console.log('[DB: Create Job]', job);

	const entry = {
		...job,
		id: uuidv1()
	};

	return knex('job_queue').insert(entry).catch(err => {
		console.log(`[Job Creation Error]: `, entry, err);

		throw err;
	});
}

module.exports = {
	createJob,
	getNextJob,
	markJobAsBeingProcessed,
	getJobInAProcessingState,
	deleteJobByID,
	getAllJobs,
	getJobByTypeAndData
};
