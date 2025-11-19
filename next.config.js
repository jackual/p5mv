/** @type {import('next').NextConfig} */

const nextConfig = {
    serverExternalPackages: ['skia-canvas'],
    webpack: (config, options) => {
        if (options.isServer) {
            config.externals = [
                ...config.externals,
                { 'skia-canvas': 'commonjs skia-canvas' },
            ]
        }
        return config
    }
};

export default nextConfig;