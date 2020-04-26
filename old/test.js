const level = require('level');

// 1) Create our database, supply location and options.
//    This will create or open the underlying store.
const database = level('output', {valueEncoding: 'json'});

async function test() {
	await database.put('squarefeet', [{x: 1}, {x: 2}]);

	const value1 = await database.get('squarefeet');

	const newValue1 = [{x: 3}, {x: 4}];

	await database.put('squarefeet', [...value1, ...newValue1]);

	const value2 = await database.get('squarefeet');

	const newValue2 = [{x: 5}, {x: 6}];

	await database.put('squarefeet', [...value2, ...newValue2]);

	console.log(await database.get('squarefeet'));
}

console.time('read + write');
test();
console.timeEnd('read + write');

// // 2) Put a key & value
// db.put('name', 'Level', function (err) {
//   if (err) return console.log('Ooops!', err) // some kind of I/O error

//   // 3) Fetch by key
//   db.get('name', function (err, value) {
//     if (err) return console.log('Ooops!', err) // likely the key was not found

//     // Ta da!
//     console.log('name=' + value)
//   })
// })
