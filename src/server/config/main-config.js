(function (appConfig) {
	'use strict';

	const logger = require('../logger');
	const rev = require('express-rev');
	const path = require('path');
	const cookieParser = require('cookie-parser');
	const forceDomain = require('forcedomain');
	const bodyParser = require('body-parser');
	const session = require('express-session');
	const KnexSessionStore = require('connect-session-knex')(session);
	const knex = require('../db/connection');
	const store = new KnexSessionStore({knex});
	const flash = require('connect-flash');
	const nunjucks = require('nunjucks');
	const passport = require('passport');
	const config = require('config');

	const {formatDistance, parseISO} = require('date-fns');

	const viewFolders = [
		path.join(__dirname, '..', 'views')
	];

	// Load environment variables
	appConfig.init = function (app, express) {
		app.disable('x-powered-by');

		const nunjucksEnv = nunjucks.configure(viewFolders, {
			express: app,
			autoescape: true,
			noCache: true
		});

		nunjucksEnv.addFilter('formatDistance', function(str) {
			return formatDistance(parseISO(str), new Date(), {
				includeSeconds: true,
				addSuffix: true
			});
		});

		app.locals.config = {
			productName: config.get('productName')
		};

		app.set('view engine', 'html');

		// *** Middlewares *** //
		app.use(forceDomain({
			hostname: config.get('hostname'),
			protocol: 'https'
		}));

		app.use(rev({
			manifest: 'dist/rev-manifest.json',
			prepend: ''
		}));

		app.use(cookieParser());
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({
			extended: false
		}));

		app.use(session({
			name: '__sid__',
			secret: config.get('cookieSecret'),
			resave: false,
			saveUninitialized: false,
			cookie: {
				maxAge: 7 * 24 * 60 * 60 * 1000,
				sameSite: 'lax'
			},
			store
		}));

		app.use(passport.initialize());
		app.use(passport.session());
		app.use(flash());

		app.use(express.static('dist', {
			maxAge: '1y'
		}));

		app.use((req, res, next) => {
			const awairSession = req.session.awair;

			if (awairSession && awairSession.accessToken) {
				res.locals.user = awairSession;
			}

			next();
		});
	};
})(module.exports);
