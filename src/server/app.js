(function () {
	'use strict';

	const {app, express} = require('./app-instance');

	// Const express = require('express');

	const appConfig = require('./config/main-config.js');
	const routeConfig = require('./config/route-config.js');
	const errorConfig = require('./config/error-config.js');

	// *** Express instance *** //
	// const app = express();

	// *** Config *** //
	appConfig.init(app, express);
	routeConfig.init(app);
	errorConfig.init(app);

	module.exports = app;
})();
