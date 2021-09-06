let fs = require("fs")
let all = JSON.parse(fs.readFileSync("input/ids.json").toString().replace(/\/\/\s.*/g, "")).enums

function getBlockData() {
    let obj = all.block
    let arr = Object.keys(obj)
    let dataKeys = new Array
    for (let i = 0; i < arr.length; i++) {
        if (/\./.test(arr[i]) === true) {
            let a = arr.splice(i,1, arr[i - 1])
            dataKeys.push(a[0])
        }
    }
    let dataName = [...dataKeys]
    dataName.forEach((item, i) => {
        dataName[i] = item.split(".")[0]
    })
    dataName = [...new Set(dataName)]
    let data = {}
    dataName.forEach(item => {
        let value = [
            {
                "template": {
                    "input": {
                        "text": "{name} "
                    }
                }
            }
        ]
        dataKeys.filter(key => {
            return key.split(".")[0] === item
        }).forEach(key => {
            value.push({
                "name": key.split(".")[1],
                "info": obj[key]
            })
        })
        data[item] = value
    })
    return data
}

function getEntityEvent(arr) {
    let entityEventsMap = JSON.parse(fs.readFileSync("input/package/package.data.json")).entityEventsMap
    let event = new Array
    arr.forEach(item => {
        let result = [
            {
                "template": {
                    "input": {
                        "text": "{name} "
                    }
                }
            }
        ]
        Object.keys(entityEventsMap).forEach(key => {
            let value = entityEventsMap[key]
            if (value.includes(item)) {
                result.push({
                    "name": key,
                    "info": all.entity_event[key]
                })
            }
        })
        event[item] = result
    })
    return event
}

function generate(name) {
    let obj = all[name]
    if (name === "fog") {
        obj = JSON.parse(fs.readFileSync("input/package/translation.fog.json"))
    }
    if (obj === undefined) {
        return console.warn(`{ ${name}: undefined }`)
    }
    let arr = Object.keys(obj)
    if (name === "block") {
        for (let i = 0; i < arr.length; i++) {
            if (/\./.test(arr[i]) === true) {
                let a = arr.splice(i,1, arr[i - 1])
            }
        }
        arr = [...new Set(arr)]
    }
    let output = [
        {
            "name": name,
            "minecraft_version": JSON.parse(fs.readFileSync("input/package/package.info.json")).version,
            "template": {
                "input": {
                    "text": "{name} "
                }
            }
        }
    ]
    if (name === "enchant_type"
            || name === "summonable_entity"
            || name === "block"
            || name === "item"
            || name === "entity"
            || name === "effect") {
        output[0].template.url = "{normal_page}{info}"
    }
    arr.forEach(key => {
        let value = obj[key]
        let item = {
            "name": key,
            "info": value
        }
        if (name === "block" || name === "item") {
            let blockData = getBlockData()
            if (Object.keys(blockData).includes(key)) {
                item.data = blockData[key]
            }
        } else if (name === "entity" || name === "summonable_entity") {
            let entityEvent = getEntityEvent(arr)
            if (Object.keys(entityEvent).includes(key)) {
                item.event = entityEvent[key]
            }
        }
        console.log(item)
        output.push(item)
    })
    fs.writeFile(`output/${name}.json.js`, `export let json = ${JSON.stringify(output, null, 4)}`, err => {
        if (err) {
            return console.error(err)
        }
        return console.log(`==========\n${name}: "successfully generated"}`)
    })
}

[
    "entity",
    "block",
    "item",
    "particle_emitter",
    "sound",
    "music",
    "summonable_entity",
    "structure",
    "animation",
    "effect",
    "enchant_type",
    "fog",
    "entity_family",
    "location"
].forEach(item => {
    generate(item)
})

// gamerule

