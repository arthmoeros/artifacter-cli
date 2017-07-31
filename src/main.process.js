const interface = require('readline-sync');
const artifacter = require('./artifacter.service');

const mainProcess = async () => {

    let input = null;

    let forms = await artifacter.getFormConfigurations();
    console.log('Artifacter Command Line Interface (interactive)')
    console.log('version 1.0.0');
    console.log();
    console.log(`Using Artifacter API at ${artifacter.artifacterApi}`);
    console.log();

    console.log('The following Form Configurations are available:');
    for (let i = 0; i < forms.length; i++) {
        console.log(`[${i + 1}: ${forms[i]}]`);
    }
    do {
        input = interface.question('Enter the number of the Form Configuration you want to use: ');
        input = parseInt(input) - 1;
    } while (forms[input] == null);
    let selectedFormConfig = forms[input];
    console.log(`You have selected ${selectedFormConfig}`);
    console.log();
    console.log('Retrieving Form Configuration');
    let formConfig = await artifacter.getFormConfiguration(selectedFormConfig);
    console.log();
    console.log(`##### ${formConfig.$formsTitle}`);
    console.log(`### ${formConfig.$formsDescription}`);
    console.log();
    console.log('Select a specific form:');
    for (let i = 0; i < formConfig.$forms.length; i++) {
        console.log(`[${i + 1}: ${formConfig.$forms[i].$formName}]`);
    }
    do {
        input = interface.question('Enter the number of the form you want to use: ');
        input = parseInt(input) - 1;
    } while (formConfig.$forms[input] == null);
    let selectedForm = formConfig.$forms[input];
    console.log(`You have selected ${selectedForm.$formName}`);
    console.log();
    console.log(selectedForm);
}

function processInput(formConfig, element, currentHierarchy) {
    if (element['@type'] != null) {
        let type = element['@type'];
        if (type == 'string') {
            let displayData = formConfig.$inputDisplayData[currentHierarchy];
            if (displayData == null) {
                console.log(`Field: ${currentHierarchy} (Display Data not found)`);
            } else {
                console.log(`Field: ${displayData.label}`);
                console.log(`Helptext: ${displayData.helptext}`);
                console.log(`Type: ${type}`);
            }
            let inputValue = '';
            do {
                inputValue = interface.question(`${element['@required'] ? '(Required) ' : ''}Enter Value${element['@defaultValue'] ? '(' + element['@defaultValue'] + ')' : ''}: `);
                if (element['@defaultValue'] != null && inputValue == '') {
                    inputValue = element['@defaultValue'];
                }
            } while (element['@required'] && inputValue == '');
            element['@value'] = inputValue;
        } else if (type == 'number') {
            let displayData = formConfig.$inputDisplayData[currentHierarchy];
            if (displayData == null) {
                console.log(`Field: ${currentHierarchy} (Display Data not found)`);
            } else {
                console.log(`Field: ${displayData.label}`);
                console.log(`Helptext: ${displayData.helptext}`);
                console.log(`Type: ${type}`);
            }
            let inputValue = '';
            do {
                inputValue = interface.question(`${element['@required'] ? '(Required) ' : ''}Enter Value${element['@defaultValue'] ? '(' + element['@defaultValue'] + ')' : ''}: `);
                if (element['@defaultValue'] != null && inputValue == '') {
                    inputValue = element['@defaultValue'];
                }
            } while ((element['@required'] && inputValue == '') || isNaN(parseInt(inputValue)));
            element['@value'] = inputValue;
        } else if (type == 'boolean') {
            let displayData = formConfig.$inputDisplayData[currentHierarchy];
            if (displayData == null) {
                console.log(`Field: ${currentHierarchy} (Display Data not found)`);
            } else {
                console.log(`Field: ${displayData.label}`);
                console.log(`Helptext: ${displayData.helptext}`);
                console.log(`Type: ${type}`);
            }
            let inputValue = '';
            do {
                console.log('Boolean: Answer "y" or "n"');
                inputValue = interface.question(`${element['@required'] ? '(Required) ' : ''}Enter Value${element['@defaultValue'] ? '(' + element['@defaultValue'] + ')' : ''}: `);
                if (element['@defaultValue'] != null && inputValue == '') {
                    inputValue = element['@defaultValue'] ? 'Y' : 'N';
                }
            } while ((element['@required'] && inputValue == '') || isBoolean(inputValue));
            element['@value'] = inputValue == 'Y' || inputValue == 'y';
        } else if (type == 'choice') {
            let displayData = formConfig.$inputDisplayData[currentHierarchy];
            if (displayData == null) {
                console.log(`Field: ${currentHierarchy} (Display Data not found)`);
            } else {
                console.log(`Field: ${displayData.label}`);
                console.log(`Helptext: ${displayData.helptext}`);
                console.log(`Type: ${type}`);
            }
            console.log('Available options:');
            for (let i = 0; i < element['@options'].length; i++) {
                console.log(`[${i + 1}: ${element['@options'][i]}]`);
            }
            let inputValue = '';
            do {
                console.log('Choice: Enter a valid option number');
                inputValue = interface.question(`${element['@required'] ? '(Required) ' : ''}Enter Value${element['@defaultValue'] ? '(' + element['@defaultValue'] + ')' : ''}: `);
                if (element['@defaultValue'] != null && inputValue == '') {
                    inputValue = element['@defaultValue'];
                }
            } while ((element['@required'] && inputValue == '') || element['@options'][inputValue] == null);
            element['@value'] = element['@options'][inputValue];
        } else if (type == 'array') {
            if(element['@items'] == null){
                element['@items'] = [];
            }
        }
    }
    if (typeof (element) == 'object') {

        for (let key in element) {
            if (key.indexOf('$') != 0) {
                processInput(element[key]);
            }
        }
    }
}

function isBoolean(value) {
    return value == 'Y' || value == 'N' || value == 'y' || value == 'n'
}

module.exports.run = mainProcess;