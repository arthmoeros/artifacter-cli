const requestApi = require('request-promise');
const fs = require('fs');

const qsdtApi = process.env.QSDT_API || 'http://localhost:8080';

const getFormConfigurations = async () => {
    return requestApi.get({
        uri: qsdtApi + '/forms',
        json: true
    })
        .then((result) => {
            return result;
        }, (error) => {
            throw new Error(error);
        });
};

const getFormConfiguration = async (id) => {
    return requestApi.get({
        uri: qsdtApi + '/forms/' + id,
        json: true
    })
        .then((result) => {
            return result;
        }, (error) => {
            throw new Error(error);
        });
};

const requestArtifactGeneration = async (bodyRequest) => {
    return requestApi({
        method: 'POST',
        uri: qsdtApi + '/generatedArtifacts',
        json: bodyRequest,
        resolveWithFullResponse: true
    })
        .then((response) => {
            return response.headers['location'];
        }, (error) => {
            throw new Error(error);
        });
};

const downloadArtifact = async (location) => {
    return requestApi.get(qsdtApi + location, { encoding: null })
        .then((response) => {
            let fileName = `generatedArtifacts-${new Date().getTime()}.zip`;
            fs.writeFileSync(fileName, response);
            return fileName;
        }, (error) => {
            throw new Error(error);
        });
}

module.exports.downloadArtifact = downloadArtifact;
module.exports.requestArtifactGeneration = requestArtifactGeneration;
module.exports.getFormConfigurations = getFormConfigurations;
module.exports.getFormConfiguration = getFormConfiguration;
module.exports.qsdtApi = qsdtApi;
