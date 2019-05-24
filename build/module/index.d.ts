export interface KillOption {
    translateFilePath: string;
    baseSrc: string;
    exportFreshTranslatePath?: string;
}
declare const ngxKillTranslateZombies: (option: KillOption) => Promise<any>;
export { ngxKillTranslateZombies };
export default ngxKillTranslateZombies;
