var level = require('level')

// 1) Create our database, supply location and options.
//    This will create or open the underlying store.
var db = level('output', { valueEncoding: 'json' });

async function test() {
	await db.put('squarefeet', [{x:1}, {x: 2}]);

	const val1 = await db.get('squarefeet');

	const newVal1 = [{x: 3}, {x: 4}];

	await db.put('squarefeet', [...val1, ...newVal1]);


	const val2 = await db.get('squarefeet');

	const newVal2 = [{x: 5}, {x: 6}];

	await db.put('squarefeet', [...val2, ...newVal2]);

	console.log(await db.get('squarefeet'));
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