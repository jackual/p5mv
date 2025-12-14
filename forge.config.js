export default {
    packagerConfig: {
        // App name / bundle name
        name: 'p5mv',
        icon: 'public/icons/icon', // Electron Packager adds .icns/.ico automatically
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin', 'linux', 'win32'],
        },
        {
            name: '@electron-forge/maker-dmg',
            platforms: ['darwin'],
        },
    ],
};
