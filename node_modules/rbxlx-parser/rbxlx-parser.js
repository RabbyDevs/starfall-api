const Parser = require("./classes/parser");
const xmljs = require("xml-js");

module.exports = {
    parse: (xml) => {
        return new Promise((resolve, reject) => {
            try {
                let result = new Parser(JSON.parse(xmljs.xml2json(xml, {compact: true, spaces: 4}))).parse().get();
                return resolve(result);
            } catch (err) {
                return reject(err);
            }
        })
    }
}