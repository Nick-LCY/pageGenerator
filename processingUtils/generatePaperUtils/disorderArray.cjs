var disorderArray = function (array) {
    return array.sort(function () {
        return .5 - Math.random();
    });
}

module.exports = disorderArray