const e = require("express");

const randomlySelectItems = require("./randomlySelectItems.cjs")

var generateVars = function (varSpecificationList) {
    let finalVars = {};
    for (let varSpecification of varSpecificationList) {
        let rule = varSpecification.rule;
        if (varSpecification.type === "list") {
            let value = [];
            rule = parseInt(rule);
            let length = varSpecification.value.length;
            for (let index of randomlySelectItems(rule, 0, length - 1)) {
                value.push(varSpecification.value[index])
            }
            finalVars[varSpecification.name] = value;
        } else if (varSpecification.type === "integer") {
            // generate random number "n"
            let low = parseInt(rule.split("-")[0]);
            let high = parseInt(rule.split("-")[1]);
            let diff = high - low + 1;
            let n = (low + Math.floor(Math.random() * diff))
            // convert n by user input expression
            let value = parseInt(eval(varSpecification.value))
            finalVars[varSpecification.name] = value;
        } else if (varSpecification.type === "decimal") {
            // generate random number "n"
            let low = parseInt(rule.split("-")[0].split(".")[0])
            let high = parseInt(rule.split("-")[1].split(".")[0])            
            let diff = high - low + 1;
            let n = low + Math.random() * diff
            // generate random decimal places
            let lowDecimal = parseInt(rule.split("-")[0].split(".")[1])
            let highDecimal = parseInt(rule.split("-")[1].split(".")[1])
            let diffDecimal = highDecimal - lowDecimal + 1;
            let randomDecimalPlaces = (lowDecimal + Math.floor(Math.random() * diffDecimal));
            // convert n by user input expression and to random fixed decimal places
            let value = parseFloat(eval(varSpecification.value)).toFixed(randomDecimalPlaces)
            finalVars[varSpecification.name] = value;
        }
    }
    return finalVars;
}

module.exports = generateVars