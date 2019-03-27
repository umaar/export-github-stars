const {Signale} = require('signale');

const options = {
	types: {
		info: {
			color: 'cyan',
			badge: 'ℹ️'
		}
	}
};

const custom = new Signale(options);

custom.config({
	displayFilename: true,
	displayTimestamp: true,
	displayDate: true
});

console.log('\n');

module.exports = custom;
