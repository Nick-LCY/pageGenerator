var parseVarsToObjs = function (rowVarSpecifications) {
    let varSpecifications = []
    for (let varKey in rowVarSpecifications) {
        let name = varKey.split("|")[0];
        let rule = varKey.split("|")[1]
        let value = rowVarSpecifications[varKey];
        let type = "list";
        if (typeof value === "string") {
            if (rule.includes(".")) type = "decimal"
            else type = "integer"
        }
        varSpecifications.push({
            name,
            rule,
            value,
            type
        })
    }
    return varSpecifications;
}

module.exports = parseVarsToObjs;