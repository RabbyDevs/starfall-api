const rbxlx = require("@shiinazzz/rbxm-reader");
console.log(rbxlx.parseBuffer())
const util = require("util");
const path = require("path");
const fs = require("fs");

const path = "./72109a3cc0927472b41523bb75b6dcfb.rbxlx";
const file = Bun.file(path);

arrayBuffer(fs.readfileas)

const buffer = await file.arrayBuffer();

rbxlx.parseBuffer()
rbxlx.parseBuffer(fs.readFileSync(path.join(__dirname, "")))
.then(tree => {
    // console.log("Parsed file!");

    // var descendants = tree.getDescendants();
    // for (var object of descendants) {
    //     if (object.class == "Part") {
    //         console.log("We found a Part named", object.getProperty("Name"));
    //     }
    // }

    // You can also output the entire tree structure
    console.log(util.inspect(tree, {depth: Infinity, colors: true}));
})
.catch(err => {
    console.log(`Could not parse file because: ${err.message}`);
})