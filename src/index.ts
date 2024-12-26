import * as fs from 'fs-extra';
import * as path from 'path';

// tslint:disable
export interface KillOption {
  translateFilePath: string;
  baseSrc: string;
  exportFreshTranslatePath?: string;
  alreadyVerified?: string[];
  exportZombieKeys?: string;
}

const ngxKillTranslateZombies = async (option: KillOption): Promise<any> => {
  console.log('Finding...')
  return new Promise(async (resolve, reject) => {
    try {
      const text = fs.readFileSync(option.translateFilePath, 'utf8');
      const json = JSON.parse(text);
      const keys = convertToKeys(json, null, []);

      try {
        let allFiles : string[] = [];
        if( Array.isArray( option.baseSrc ) ) {
          for( let src of  option.baseSrc ){
            allFiles = allFiles.concat( walkThroughAllFiles( src ) );
          }
        }else{
            allFiles = walkThroughAllFiles( option.baseSrc );
        }
        const files = allFiles.filter(fn => fn.endsWith('.ts') || fn.endsWith('.html'));

        let zombies = [...keys];
        for (let index = 0; index < files.length; index++) {
          const file = files[index];
          console.log(`Checking for zombies at file #${index}/${files.length}`);
          zombies = removeKeyIfFoundInFile(file, zombies);
        }

        let unzombified = { ...json };
        for (let zombie of zombies) {
          const zombieKeys = zombie.split('.');
          const prop = zombieKeys.pop();
          const parent = zombieKeys.reduce((obj, key) => obj ? obj[key] : {}, unzombified);

          if (parent && prop && parent[prop]) {
            delete parent[prop];
            console.log(`Deleting key ${prop}`)
          }
        }
        if( option.alreadyVerified ) {
          console.log(`Omit in result ${option.alreadyVerified.length} already verified entries...`);
          for( let alreadyVerifiedEntry of option.alreadyVerified ){
            let zombieIndex = zombies.indexOf( alreadyVerifiedEntry );
            if( zombieIndex !== -1 ){
              zombies.splice( zombieIndex, 1 );
            }
          }
        }
        if (option.exportFreshTranslatePath) {
          console.log(`Writing File at ${option.exportFreshTranslatePath}`);
          const content = JSON.stringify(unzombified, null, 2);
          fs.writeFile(option.exportFreshTranslatePath, content, 'utf8', () => {
            console.log(`Fresh file created at ${option.exportFreshTranslatePath}. Successfully....`);
          });
        }
        if( option.exportZombieKeys ){
          console.log(`Writing zombie keys found to ${option.exportZombieKeys}`);
          const zombieKeys = JSON.stringify(zombies, null, 2);
          fs.writeFile(option.exportZombieKeys, zombieKeys, 'utf8', () => {
              console.log(`Fresh file created at ${option.exportZombieKeys}. Successfully....`);
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

const removeKeyIfFoundInFile = (filePath: string, keys: string[]) => {
  const zombies = [...keys];
  try {
    const data = fs.readFileSync(filePath);
    for (const key of keys) {
      const found = data.indexOf(key) !== -1;
      const zombieIndex = zombies.indexOf(key);
      const alreadyZombie = zombieIndex !== -1;
      if (found && alreadyZombie) {
        zombies.splice(zombieIndex, 1);
      }
    }
  } catch (err) {
    console.error('error while reading file: ' + filePath, err);
  }
  return zombies;
}

const convertToKeys = (obj: any, cat: any, tKeys: string[]): string[] => {
  const currentKeys = [...tKeys];
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value === 'object') {
      currentKeys.push(...convertToKeys(value, cat === null ? key : cat.concat('.', key), tKeys));
    } else {
      currentKeys.push(cat === null ? key : cat.concat('.', key));
    }
  }
  return currentKeys;
}

const walkThroughAllFiles = (dir: string): string[] => {
  let results: string[] = [];
  let list = fs.readdirSync(dir, 'utf-8');
  list.forEach(async (file) => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
        const recursiveResults = walkThroughAllFiles(file);
        results = [...results, ...recursiveResults];
    } else {
        results.push(file);
    }
  });
  return results;
}
// tslint:enable

export { ngxKillTranslateZombies };
export default ngxKillTranslateZombies;
