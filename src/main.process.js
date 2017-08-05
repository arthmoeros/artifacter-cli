const interface = require('readline-sync');
const artifacter = require('./artifacter.service');
const fs = require('fs');

let switchUseJson = false;
let switchPresetFormOptions = null;

const mainProcess = async () => {

    let args = process.argv.slice(2, process.argv.length);

    let jsonSwitchIndex = args.indexOf('--json');
    let jsonFileContents = null;
    if (jsonSwitchIndex != -1) {
        let jsonFileName = args[jsonSwitchIndex + 1];
        if (jsonFileName == null) {
            throw new Error('--json switch specified without a JSON file');
        }
        if (!fs.existsSync(jsonFileName)) {
            throw new Error(`JSON file ${jsonFileName} does not exists`);
        }
        jsonFileContents = JSON.parse(fs.readFileSync(jsonFileName).toString());
        switchUseJson = true;
    }

    let presetFormOptionsIndex = args.indexOf('--form');
    if (presetFormOptionsIndex != -1) {
        let presetFormOptions = args[presetFormOptionsIndex + 1];
        if (presetFormOptions == null) {
            throw new Error('--form switch specified without a preset options');
        }
        if (presetFormOptions.split(',').length != 2) {
            throw new Error('--form preset options must follow the format <formConfigIndex>,<formIndex> (IE: 1,2)');
        }
        switchPresetFormOptions = presetFormOptions.split(',');
    }

    let requestBody = null;
    if (!switchUseJson) {
        let input = null;
        let forms = await artifacter.getFormConfigurations();
        if (switchPresetFormOptions != null) {
            console.log('Artifacter Command Line Interface (Forms preset + interactive)');
        } else {
            console.log('Artifacter Command Line Interface (full interactive)')
        }
        console.log('version 1.0.4');
        console.log();
        if (process.env.ARTIFACTER_API == null) {
            console.log('ARTIFACTER_API env variable is not set!, using the default configuration');
        }
        console.log(`Using Artifacter API at '${artifacter.artifacterApi}'`);
        console.log();

        if (switchPresetFormOptions != null) {
            input = parseInt(switchPresetFormOptions[0]) - 1;
        } else {
            console.log('The following Form Configurations are available:');
            for (let i = 0; i < forms.length; i++) {
                console.log(`[${i + 1}: ${forms[i]}]`);
            }
            do {
                input = interface.question('Enter the number of the Form Configuration you want to use: ');
                input = parseInt(input) - 1;
            } while (forms[input] == null);
        }
        let selectedFormConfig = forms[input];
        if (selectedFormConfig == null) {
            throw new Error(`Invalid Form Configuration selected: ${input} at ${forms}`);
        }
        console.log(`You have selected ${selectedFormConfig}`);
        console.log();
        console.log('Retrieving Form Configuration');
        let formConfig = await artifacter.getFormConfiguration(selectedFormConfig);
        console.log();
        console.log(`##### ${formConfig.$formsTitle}`);
        console.log(`### ${formConfig.$formsDescription}`);
        console.log();

        if (switchPresetFormOptions != null) {
            input = parseInt(switchPresetFormOptions[1]) - 1;
        } else {
            console.log('Select a specific form:');
            for (let i = 0; i < formConfig.$forms.length; i++) {
                console.log(`[${i + 1}: ${formConfig.$forms[i].$formName}]`);
            }
            do {
                input = interface.question('Enter the number of the form you want to use: ');
                input = parseInt(input) - 1;
            } while (formConfig.$forms[input] == null);
        }
        let selectedForm = formConfig.$forms[input];
        if (selectedForm == null) {
            throw new Error(`Invalid form selected: ${input} at ${formConfig.$forms}`);
        }
        console.log(`You have selected ${selectedForm.$formName}`);
        console.log();
        processInput(selectedForm, selectedForm.$requestSchema, '');
        console.log("Preparing Body Request");
        requestBody = prepareRequestBody(JSON.parse(JSON.stringify(selectedForm.$requestSchema)));
    } else {
        console.log('Artifacter Command Line Interface (JSON File load)')
        console.log('version 1.0.0');
        console.log();
        console.log(`Using Artifacter API at ${artifacter.artifacterApi}`);
        console.log();
        requestBody = jsonFileContents;
    }
    console.log("Submitting generation request");
    let location = await artifacter.requestArtifactGeneration(requestBody);
    console.log("Retrieving Artifact at " + location);
    let fileName = await artifacter.downloadArtifact(location);
    console.log(`Artifact downloaded successfully as '${fileName}'`);
    if (!switchUseJson) {
        fs.writeFileSync(fileName + '-REQUEST.json', JSON.stringify(requestBody));
        console.log('Dumped a JSON file from the prepared Request');
    }
}

function prepareRequestBody(element) {
    if (element['@value'] !== undefined) {
        element = element['@value'];
    } else if (element['@item'] != null) {
        let tmpElement = [];
        for (let i = 0; i < element['@items'].length; i++) {
            tmpElement.push(prepareRequestBody(element['@items'][i]));
        }
        element = tmpElement;
    } else if (typeof (element) == 'object') {
        for (let key in element) {
            if (key.indexOf("$") != 0 && key.indexOf("@") != 0) {
                element[key] = prepareRequestBody(element[key]);
            }
        }
    }
    return element;
}

function printDisplayData(selectedForm, currentHierarchy, type) {
    let displayData = selectedForm.$inputDisplayData[currentHierarchy];
    if (displayData == null) {
        console.log(`Field: *${currentHierarchy} (Display Data not found)*`);
    } else {
        console.log(`Field: *${displayData.label}*`);
        if (displayData.helptext != null) {
            console.log(`Helptext: ${displayData.helptext}`);
        }
        console.log(`Type: ${type}`);
    }
}

function askInput(element) {
    let required = element['@required'] ? '(Required!) ' : '';
    let defaultValue = element['@defaultValue'] ? ' (' + element['@defaultValue'] + ')' : '';
    return interface.question(`${required}Enter Value${defaultValue}: `)
}

function processInput(selectedForm, element, currentHierarchy) {
    if (element['@type'] != null) {
        let type = element['@type'];
        printDisplayData(selectedForm, currentHierarchy, type);
        if (type == 'string') {
            let inputValue = '';
            do {
                inputValue = askInput(element);
                if (element['@defaultValue'] != null && inputValue == '') {
                    inputValue = element['@defaultValue'];
                }
            } while (element['@required'] && inputValue == '');
            element['@value'] = inputValue;
        } else if (type == 'number') {
            let inputValue = '';
            do {
                inputValue = askInput(element);
                if (element['@defaultValue'] != null && inputValue == '') {
                    inputValue = element['@defaultValue'];
                }
            } while ((element['@required'] && inputValue == '') || isNaN(parseInt(inputValue)));
            element['@value'] = parseInt(inputValue);
        } else if (type == 'boolean') {
            let inputValue = '';
            do {
                console.log('Boolean: Answer "y" or "n"');
                inputValue = askInput(element);
                if (element['@defaultValue'] != null && inputValue == '') {
                    inputValue = element['@defaultValue'] ? 'Y' : 'N';
                }
            } while ((element['@required'] && inputValue == '') || !isBoolean(inputValue));
            element['@value'] = inputValue == 'Y' || inputValue == 'y';
        } else if (type == 'choice') {
            console.log('Available options:');
            for (let i = 0; i < element['@options'].length; i++) {
                console.log(`[${i + 1}: ${element['@options'][i]}]`);
            }
            let inputValue = '';
            do {
                console.log('Choice: Enter a valid option number');
                inputValue = askInput(element);
                if (element['@defaultValue'] != null && inputValue == '') {
                    inputValue = element['@defaultValue'];
                }
            } while ((element['@required'] && inputValue == '') || element['@options'][inputValue - 1] == null);
            element['@value'] = element['@options'][inputValue - 1];
        } else if (type == 'array') {
            if (element['@items'] == null) {
                element['@items'] = [];
            }
            let addElement = true;
            let inputValue = '';
            while (addElement) {
                do {
                    console.log('Array: Add an element? (y or n)');
                    inputValue = interface.question(`Enter Value: `);
                } while (!isBoolean(inputValue));
                addElement = inputValue == 'Y' || inputValue == 'y'
                if (addElement) {
                    let newElement = JSON.parse(JSON.stringify(element['@item']));
                    processInput(selectedForm, newElement, currentHierarchy);
                    element['@items'].push(newElement);
                    console.log('Element added to Array');
                    console.log();
                }
            }
        }
        console.log();
    } else {
        for (let key in element) {
            if (key.indexOf('$') != 0) {
                processInput(selectedForm, element[key], currentHierarchy + (currentHierarchy != '' ? '.' : '') + key);
            }
        }
    }
}

function isBoolean(value) {
    return value == 'Y' || value == 'N' || value == 'y' || value == 'n'
}

module.exports.run = mainProcess;