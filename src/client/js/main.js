import home from './modules/home';
import user from './modules/user';

// TODO: Change this
const config = window.awairDashboardConfig;

function init() {
	if (window.location.pathname === '/') {
		home.init(config);
	}

	if (window.location.pathname.startsWith('\/user\/')) {
		user.init(config);
	}
}

window.addEventListener('load', init);
