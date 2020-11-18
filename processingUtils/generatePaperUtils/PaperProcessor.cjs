const { v4: uuidv4 } = require("uuid")
class PaperProcessor {
    constructor(specifications) {
        this.specifications = specifications
    }
    generatePaper (noOfCopies) {
        // Test level
        var testSettings = this.specifications.props
        var sectionList = this.specifications.sections
        var paperRecorder = {}
        paperRecorder = {
            props: testSettings,
            sections: {}
        }
        for (let section of sectionList) {
            // Section level
            let sectionSettings = section.props
            let questionList = section.questions

            /**
             * Processing...
             */

            // Attach a unique section id
            let sectionID = uuidv4()
            paperRecorder.sections[sectionID] = {
                orders: 1,
                props: sectionSettings,
                questions: {}
            }
            for (let question of questionList) {
                // Question level
                let questionSettings = question.props

                // Processing
                let variableSpecificationList = this.parseVarsToObjs(question.vars)
                let variableList = this.generateVars(variableSpecificationList)

                // Attach a unique question id
                let questionID = uuidv4();
                paperRecorder.sections[sectionID].questions[questionID] = {
                    orders: 1,
                    props: questionSettings,
                    templates: question.templates,
                    vars: variableList
                }
            }
        }

        // Persist data

        return paperRecorder;
    }

    generateRenderSpecification()

    generateVars(varSpecificationList) {
        let finalVars = {};
        for (let varSpecification of varSpecificationList) {
            let rule = varSpecification.rule;
            if (varSpecification.type === "list") {
                let value = [];
                rule = parseInt(rule);
                let length = varSpecification.value.length;
                for (let index of this.randomlySelectItems(rule, 0, length - 1)) {
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

    randomlySelectItems(target, low, high) {
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

    parseVarsToObjs(rowVarSpecifications) {
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
}

module.exports = PaperProcessor;