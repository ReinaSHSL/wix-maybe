// Escapes special characters for HTML.
// https://stackoverflow.com/a/12034334/1070107
const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
}
module.exports.escapeHTML = function escapeHTML (string) {
    return String(string).replace(/[&<>"'`=/]/g, function (s) {
        return entityMap[s]
    })
}
