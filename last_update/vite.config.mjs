import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel([
            'resources/css/ship.css', // تأكد من إضافة جميع الملفات التي تحتاجها
            'resources/js/ship.js',
            'resources/js/room.js',
        ]),
    ],
});
