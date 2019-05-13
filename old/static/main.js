function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	});
}

function getStarsOnPageCount() {
	const starsEl = document.querySelector('.stars');
	return starsEl.childElementCount;
}

async function fetchNewStars() {
	const starsEl = document.querySelector('.stars');
	const starsOnPageCount = getStarsOnPageCount();

	const url = `/get-stars?offset=${starsOnPageCount}&amount=${2000}`;
	console.log('Fetching ', url);

	const response = await fetch(url);

	if (response.status === 200) {
		const html = await response.text();
		starsEl.insertAdjacentHTML( 'beforeend', html );
		document.querySelector('.star-count').innerHTML = getStarsOnPageCount();
		await sleep(100);
		fetchNewStars();
	} else {
		console.info('Will stop fetching more stars as no stars were returned in the last request');
	}
}

function start() {
	fetchNewStars();
}

start();