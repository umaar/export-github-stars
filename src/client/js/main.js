import home from './modules/home';

const config = window.awairDashboardConfig;

function init() {
	if (window.location.pathname === '/') {
		home.init(config);
	}
}

window.addEventListener('load', init);
