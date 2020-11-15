randomlySelectItems = function (target, low, high) {
	let counter = 0, output = [];
	while (counter < target) {
		let random = Math.floor(Math.random() * (high - low + 1))
		if (!output.includes(random)) {
			counter++;
			output.push(random)
		}
	}
	return output;
}

module.exports = randomlySelectItems