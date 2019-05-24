import * as fs from 'fs-extra';
import * as path from 'path';
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
                let unzombified = { ...json };
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
// tslint:enable
export { ngxKillTranslateZombies };
export default ngxKillTranslateZombies;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDL0IsT0FBTyxLQUFLLElBQUksTUFBTSxNQUFNLENBQUM7QUFTN0IsTUFBTSx1QkFBdUIsR0FBRyxLQUFLLEVBQUUsTUFBa0IsRUFBZ0IsRUFBRTtJQUN6RSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2xCLE9BQU8sSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUMzQyxJQUFJO1lBQ0YsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDL0QsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5QixNQUFNLElBQUksR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRWhELElBQUk7Z0JBQ0YsTUFBTSxRQUFRLEdBQUcsTUFBTSxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzNELE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFFaEYsSUFBSSxPQUFPLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO2dCQUN4QixLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtvQkFDakQsTUFBTSxJQUFJLEdBQUcs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