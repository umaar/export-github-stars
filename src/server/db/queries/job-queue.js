const uuidv1 = require('uuid/v1');
const knex = require('../connection');

function markJobAsBeingProcessed(id) {
	return knex('job_queue')
		.where({id})
		.update({
			is_processing: true,
			updated_at: Number(new Date())
		});
}

function markJobCompleteJobByID(id) {
	console.log('Marking Job complete:', id);
	return knex('job_queue')
		.where({id})
		.update({
			is_processing: false,
			is_complete: true,
			updated_at: Number(new Date())
		});
}

function getAllJobs() {
	return knex('job_queue');
}

function getMostRecentCompletedUserJob({type, data}) {
	return knex('job_queue')
		.where({
			type,
			data,
			is_complete: true
		})
		.orderBy('updated_at', 'desc')
		.first();
}

function getIncompleteJobByTypeAndData({type, data}) {
	return knex('job_queue')
		.where({
			type,
			data,
			is_complete: false
		})
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
		.where('is_complete', false)
		.orderBy('created_at', 'asc')
		.first();
}

function createJob(job) {
	console.log('[DB: Create Job]', job);

	const entry = {
		...job,
		id: uuidv1()
	};

	return knex('job_queue').insert(entry).catch(error => {
		console.log('[Job Creation Error]:', entry, error);

		throw error;
	});
}

module.exports = {
	createJob,
	getNextJob,
	markJobAsBeingProcessed,
	getJobInAProcessingState,
	markJobCompleteJobByID,
	getAllJobs,
	getIncompleteJobByTypeAndData,
	getMostRecentCompletedUserJob
};
