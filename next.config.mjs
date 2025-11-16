/** @type {import('next').NextConfig} */
const nextConfig = {
    // Prevent hot reload on output/ and public/output.mp4
    watchOptions: {
        ignored: [
            '**/output/**',
            '**/public/output.mp4'
        ]
    }
};

export default nextConfig;
