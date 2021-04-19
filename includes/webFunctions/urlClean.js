const crossDB = require('includes/crossDB.js');

function getUrlHost(field, warehouse) {
    return ` cast( crossDB.splitPart(crossDB.splitPart(replace(replace(${field}, 'http://', ''), 'https://', ''), '/', 1,${warehouse}), '?', 1,${warehouse}) as string) `
};

function getUrlParameter(field, urlParameter, warehouse) {
    return ` cast( nullif(crossDB.splitPart( crossDB.splitPart(${field}, '${urlParameter}=', 2, ${warehouse}), '&', 1, ${warehouse}),'') as string) `
};

module.exports = {
    getUrlHost,
    getUrlParameter,
}
