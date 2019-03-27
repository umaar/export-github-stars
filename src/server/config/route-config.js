(function (routeConfig) {
	routeConfig.init = function (app) {
		const routes = require('../routes');
		// Const lessonRoutes = require('../routes/lesson');

		app.use('/', routes);
		// App.use('/auth', authRoutes);
	};
})(module.exports);
