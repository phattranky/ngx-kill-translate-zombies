import * as fs from 'fs-extra';
import * as path from 'path';

// tslint:disable
export interface KillOption {
  translateFilePath: string;
  baseSrc: string;
  exportFreshTranslatePath?: string;
}

const ngxKillTranslateZombies = async (option: KillOption): Promise<any> => {
  console.log('Finding...')
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
            console.log(`Deleting key ${prop}`)
          }
        }

        if (option.exportFreshTranslatePath) {
          console.log(`Writing File at ${option.exportFreshTranslatePath}`)
          const content = JSON.stringify(unzombified, null, 2);
          fs.writeFile(option.exportFreshTranslatePath, content, 'utf8', () => {
            console.log(`Fresh file created at ${option.exportFreshTranslatePath}. Successfully....`);
          });
        }

        resolve(unzombified);
      } catch (err) {
        const errorMessage = `Error when walkThroughAllFiles ${err}`
        console.error(errorMessage, err);
        reject(errorMessage);
      }
    } catch (err) {
      const errorMessage = `Error while parsing the file: ${err}`;
      console.error(errorMessage, err);
      reject(errorMessage);
    }
  })
}

const findInFile = (filePath: string, keys: string[]) => {
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
  } catch (err) {
    console.error('error while reading file: ' + filePath, err);
  }
  return zombies;
}

const getTranslationKeys = (obj: any, cat: any, tKeys: string[]): string[] => {
  const currentKeys = [...tKeys];
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value === 'object') {
      currentKeys.push(...getTranslationKeys(value, cat === null ? key : cat.concat('.', key), tKeys));
    } else {
      currentKeys.push(cat === null ? key : cat.concat('.', key));
    }
  }
  return currentKeys;
}

const walkThroughAllFiles = async (dir: string): Promise<string[]> => {
  let results: string[] = [];
  
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
        } else {
          results.push(file);

          if (!--pending) {
            resolve(results);
          }
        }
      });
    } catch(err) {
      reject(err)
    }
  })
};
// tslint:enable

export { ngxKillTranslateZombies };
export default ngxKillTranslateZombies;
