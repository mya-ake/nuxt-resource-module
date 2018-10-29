import path from 'path';
export default function nuxtResourceModule() {
    this.addPlugin({
        src: path.resolve(__dirname, 'templates', 'plugin.template.js'),
        ssr: true,
        options: {
            pluginSrc: path.resolve(__dirname, 'index.js'),
        },
    });
}
