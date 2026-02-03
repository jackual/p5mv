export default {
    packagerConfig: {
        // App name / bundle name
        name: 'p5mv',
        icon: 'public/icons/icon', // Electron Packager adds .icns/.ico automatically
        // macOS specific settings
        appBundleId: 'com.jackual.p5mv',
        appCategoryType: 'public.app-category.graphics-design',
        extendInfo: {
            CFBundleDocumentTypes: [
                {
                    CFBundleTypeName: 'p5mv Project',
                    CFBundleTypeRole: 'Editor',
                    CFBundleTypeExtensions: ['p5mvProject'],
                    CFBundleTypeIconFile: 'public/icons/icon.icns',
                    LSHandlerRank: 'Owner',
                    LSItemContentTypes: ['com.jackual.p5mv.project']
                }
            ],
            UTExportedTypeDeclarations: [
                {
                    UTTypeIdentifier: 'com.jackual.p5mv.project',
                    UTTypeDescription: 'p5mv Project File',
                    UTTypeConformsTo: ['public.json', 'public.data'],
                    UTTypeTagSpecification: {
                        'public.filename-extension': ['p5mvProject']
                    }
                }
            ]
        }
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin'],
        },
    ],
};
