"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const ngxKillTranslateZombies = async (option) => {
    console.log('sss');
    return new Promise(async (resolve, reject) => {
        try {
            const text = fs.readFileSync(option.translateFilePath, 'utf8');
            const json = JSON.parse(text);
            const keys = getTranslationKeys(json, null, []);
            try {
                const allFiles = await walkThroughAllFiles(option.baseSrc);
                const files = allFiles.filter(fn => fn.endsWith('.ts') || fn.endsWith('.html'));
                let zombies = [...keys];
                for (let index = 0; index < files.length; index++) {
                    const file = files[index];
                    zombies = findInFile(file, zombies);
                    console.log(`Find Zombies at ${index}/${files.length}`);
                }
                let unzombified = Object.assign({}, json);
                for (let index = 0; index < zombies.length; index++) {
                    const zombie = zombies[index];
                    const zombieKeys = zombie.split('.');
                    const prop = zombieKeys.pop();
                    const parent = zombieKeys.reduce((obj, key) => obj ? obj[key] : {}, unzombified);
                    if (parent && prop && parent[prop]) {
                        delete parent[prop];
                        console.log(`Deleting key ${prop}`);
                    }
                }
                if (option.exportFreshTranslatePath) {
                    console.log(`Writing File at ${option.exportFreshTranslatePath}`);
                    const content = JSON.stringify(unzombified, null, 2);
                    fs.writeFile(option.exportFreshTranslatePath, content, 'utf8', () => {
                        console.log(`Fresh file created at ${option.exportFreshTranslatePath}. Successfully....`);
                    });
                }
                resolve(unzombified);
            }
            catch (err) {
                const errorMessage = `Error when walkThroughAllFiles ${err}`;
                console.error(errorMessage, err);
                reject(errorMessage);
            }
        }
        catch (err) {
            const errorMessage = `Error while parsing the file: ${err}`;
            console.error(errorMessage, err);
            reject(errorMessage);
        }
    });
};
exports.ngxKillTranslateZombies = ngxKillTranslateZombies;
const findInFile = (filePath, keys) => {
    const zombies = [...keys];
    try {
        const data = fs.readFileSync(filePath);
        for (const key of keys) {
            const found = data.indexOf(key) !== -1;
            const zombieIndex = zombies.indexOf(key);
            const alreadyZombie = zombieIndex !== -1;
            if (!found && !alreadyZombie) {
                zombies.push(key);
            }
            if (found && alreadyZombie) {
                zombies.splice(zombieIndex, 1);
            }
        }
    }
    catch (err) {
        console.error('error while reading file: ' + filePath, err);
    }
    return zombies;
};
const getTranslationKeys = (obj, cat, tKeys) => {
    const currentKeys = [...tKeys];
    for (const key of Object.keys(obj)) {
        const value = obj[key];
        if (typeof value === 'object') {
            currentKeys.push(...getTranslationKeys(value, cat === null ? key : cat.concat('.', key), tKeys));
        }
        else {
            currentKeys.push(cat === null ? key : cat.concat('.', key));
        }
    }
    return currentKeys;
};
const walkThroughAllFiles = async (dir) => {
    let results = [];
    return new Promise((resolve, reject) => {
        try {
            const list = fs.readdirSync(dir);
            let pending = list.length;
            if (!pending) {
                resolve(results);
            }
            list.forEach(async (file) => {
                file = path.resolve(dir, file);
                const stat = fs.statSync(file);
                if (stat && stat.isDirectory()) {
                    const recursiveResults = await walkThroughAllFiles(file);
                    results = [...results, ...recursiveResults];
                    if (!--pending) {
                        resolve(results);
                    }
                }
                else {
                    results.push(file);
                    if (!--pending) {
                        resolve(results);
                    }
                }
            });
        }
        catch (err) {
            reject(err);
        }
    });
};
exports.default = ngxKillTranslateZombies;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsNkNBQStCO0FBQy9CLDJDQUE2QjtBQVM3QixNQUFNLHVCQUF1QixHQUFHLEtBQUssRUFBRSxNQUFrQixFQUFnQixFQUFFO0lBQ3pFLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDbEIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQzNDLElBQUk7WUFDRixNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMvRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlCLE1BQU0sSUFBSSxHQUFHLGtCQUFrQixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFaEQsSUFBSTtnQkFDRixNQUFNLFFBQVEsR0FBRyxNQUFNLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDM0QsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUVoRixJQUFJLE9BQU8sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0JBQ3hCLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO29CQUNqRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzFCLE9BQU8s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