const { v4: uuidv4 } = require("uuid")
const randomlySelectItems = require("./randomlySelectItems.cjs")
const disorderArray = require("./disorderArray.cjs")
class PaperProcessor {
    constructor(specifications) {
        this.specifications = specifications
    }
    generatePaper(noOfCopies) {
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
                let possibleAns = question.possibleAns
                let templates = question.templates
                switch (questionSettings.basic.type) {
                    case "fill-in-blank":
                        possibleAns = this.processFillInBlankAnswers(possibleAns, variableList)
                        templates = this.handleBlanks(templates, possibleAns);
                        templates = this.handleTemplates(templates, variableList);
                        break;
                    case "multiple-choice":
                        templates = this.handleTemplates(templates, variableList);
                        break;
                    default: break;
                }

                // Attach a unique question id
                let questionID = uuidv4();
                paperRecorder.sections[sectionID].questions[questionID] = {
                    orders: 1,
                    props: {},
                    templates: templates,
                    vars: variableList,
                    possibleAns: possibleAns
                }
            }
        }

        // Persist data

        return paperRecorder;
    }

    generateRenderSpecification() { }

    generateVars(varSpecificationList) {
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

    handleBlanks(templateList, possibleAns) {
        if (typeof templateList == "string") {
            templateList = [templateList]
        }
        let blanksCount = 0, blanksMapping = [];
        for (let template of templateList) {
            let index = templateList.indexOf(template)
            let blanks = {};
            // Firstly find all the blanks needed to be replaced, and their target amount
            template.match(/_{4}\d+\|*\d+_{4}|_{4}\d+_{4}/g).map((blank) => {
                let blankID = parseInt(blank.replace(/_|\||(?<=\|)\d+/g, ""));
                if (blanks[blankID]) {
                    blanks[blankID].list.push(blank)
                } else {
                    let neededSelected = parseInt(blank.replace(/_|\||(?<=_)\d+/g, ""))
                    blanks[blankID] = {
                        list: [blank],
                        neededSelected: isNaN(neededSelected) ? 1 : neededSelected
                    }
                }
            })

            // select random blanks to replace
            let randomlySelected = {}
            for (let blankID in blanks) {
                let blank = blanks[blankID];
                if (blank.list.length <= blank.neededSelected) {
                    // -1 means no need to select, all blanks will be used
                    randomlySelected[blankID] = -1
                } else {
                    randomlySelected[blankID] =
                        randomlySelectItems(blank.neededSelected,
                            0,
                            blank.list.length - 1)
                }
            }

            // replace the blanks
            for (let blankID in blanks) {
                for (let listIndex in blanks[blankID].list) {
                    if (randomlySelected[blankID] == -1 || randomlySelected[blankID].includes(parseInt(listIndex))) {
                        blanksCount++
                        template = template.replace(blanks[blankID].list[listIndex], `_____${blankID}_____`, 1)
                        // blanksMapping.push({
                        //     blanksCount: blanksCount,
                        //     blank: blankIndex
                        // })
                    } else {
                        possibleAns[blankID] = disorderArray(possibleAns[blankID])
                        template = template.replace(blanks[blankID].list[listIndex], possibleAns[blankID][0])
                        possibleAns[blankID] = possibleAns[blankID].slice(1)
                    }
                }
            }

            templateList[index] = template
        }
        return templateList
    }

    handleTemplates(templateList, variableList) {
        if (typeof templateList == "string") {
            templateList = [templateList]
        }
        for (let template of templateList) {
            let index = templateList.indexOf(template)
            let i = template.indexOf("{{");
            while (i != -1) {
                let j = template.indexOf("}}")
                let expression = template.substring(i, j + 2)
                let variable = this.processExpression(expression, variableList);
                template = template.replace(expression, variable)
                i = template.indexOf("{{");
            }
            templateList[index] = template
        }
        return templateList
    }

    processExpression(expression, variableList) {
        expression = expression
            .replace(/\{\{|\}\}/g, "")
            .replace(/\s*([\+\-\*\/\%])\s*/g, "$1")
        expression = expression.replace(/((?<!\")\b[a-z]+(?!\"))/g, "variableList.$1")
        return eval(expression);
    }

    processFillInBlankAnswers(possibleAnsList, variableList) {
        // process possible answers first
        let processedPossibleAnsList = {}
        for (let blankIndex in possibleAnsList) {
            let blankPossibleAns = possibleAnsList[blankIndex]
            let processedAnsList = []
            for (let ansIndex in blankPossibleAns) {
                let ans = blankPossibleAns[ansIndex]
                if (typeof ans != "string") {
                    if (this.processExpression(ans.correct, variableList)) processedAnsList.push(ans.content)
                } else {
                    processedAnsList.push(ans)
                }
            }
            processedPossibleAnsList[blankIndex] = processedAnsList
        }
        return processedPossibleAnsList
        // if (this.specification.ansPool.hasAnsPool) {
        //     // 这里处理ans pool
        // }
    }
}

module.exports = PaperProcessor;