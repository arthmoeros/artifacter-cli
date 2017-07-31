const requestApi = require('request-promise');

const artifacterApi = process.env.ARTIFACTER_API || 'http://localhost:8080';

const getFormConfigurations = async () => {
    return requestApi.get({
        uri: artifacterApi + '/forms',
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
        uri: artifacterApi + '/forms/' + id,
        json: true
    })
        .then((result) => {
            return result;
        }, (error) => {
            throw new Error(error);
        });
}

module.exports.getFormConfigurations = getFormConfigurations;
module.exports.getFormConfiguration = getFormConfiguration;
module.exports.artifacterApi = artifacterApi;
