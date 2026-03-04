/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                mahesh: {
                    maroon: '#8B0000',
                    gold: '#FFD700',
                    light: '#FFF8F0',
                }
            }
        },
    },
    plugins: [],
}
