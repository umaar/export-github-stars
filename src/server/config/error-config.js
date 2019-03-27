(function (errorConfig) {
	'use strict';

	// *** Error handling *** //

	errorConfig.init = function (app) {
		// Catch 404 and forward to error handler
		app.use((req, res) => {
			const err = new Error('Not Found');
			err.status = 404;
			res.status(err.status).render('error', {
				message: 'Not found'
			});
		});

		// Production error handler (no stacktraces leaked to user)
		app.use((err, req, res) => {
			req.flash('messages', {
				status: 'danger',
				value: 'Something went wrong.'
			});
			res.status(err.status || 500).render('error', {
				message: 'Something went wrong'
			});
		});
	};
})(module.exports);
