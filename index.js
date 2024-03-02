const rbxlx = require("@shiinazzz/rbxm-reader");
const express = require('express');
const app = express ();
app.use(express.json());
const PORT = process.env.PORT || 2530;
console.log(PORT)
app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
  });
const axios = require('axios');
const crypto = require("crypto");
const fs = require("fs");
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");

async function asset(assetId) {
    const response = await axios.get(`https://assetdelivery.roblox.com/v1/asset?id=${assetId}`, { responseType: 'arraybuffer' });
    const fileHash = crypto.randomUUID()
    fs.writeFileSync(`./cache/${fileHash}`, response.data)
    return `./cache/${fileHash}`
}
async function getImageId(assetId) {
    const assetFilePath = await asset(assetId)
    try {
        const obtainedData = rbxlx.parseBuffer(fs.readFileSync(assetFilePath))
        
        for (const instance of obtainedData.instances) {
            if (instance.TextureID !== undefined) {
                let finalId = instance.TextureId
                finalId.replace('http://www.roblox.com/asset/?id=', '')
                finalId.replace('rbxassetid://', '')
                return [finalId, assetFilePath]
            }
            if (instance.TextureId !== undefined) {
                let finalId = instance.TextureId
                finalId = finalId.replace('http://www.roblox.com/asset/?id=', '')
                finalId = finalId.replace('rbxassetid://', '')
                return [finalId, assetFilePath]
            }
        }
    }
    catch {
        try {
            const parser = new XMLParser();
            let xml = parser.parse(fs.readFileSync(assetFilePath));
            let finalId = xml.roblox.Item.Properties.Content.url
            finalId = finalId.replace('http://www.roblox.com/asset/?id=', '')
            finalId = finalId.replace('rbxassetid://', '')
            return [finalId, assetFilePath]
        }
        catch {
            return ['', assetFilePath]
        }
    }
}

app.get("/image", async(request, response) => {  
    const imageIdData = await getImageId(request.query.id);
    fs.unlinkSync(imageIdData[1])
    response.send(imageIdData[0]);
 });