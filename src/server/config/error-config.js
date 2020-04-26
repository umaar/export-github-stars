(function (errorConfig) {
	'use strict';

	// *** Error handling *** //

	errorConfig.init = function (app) {
		// Catch 404 and forward to error handler
		app.use((request, res) => {
			const error = new Error('Not Found');
			error.status = 404;
			res.status(error.status).render('error', {
				message: 'Not found'
			});
		});

		// Production error handler (no stacktraces leaked to user)
		app.use((error, request, res) => {
			request.flash('messages', {
				status: 'danger',
				value: 'Something went wrong.'
			});
			res.status(error.status || 500).render('error', {
				message: 'Something went wrong'
			});
		});
	};
})(module.exports);
