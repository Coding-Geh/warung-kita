/****** Tailwind Config ******/
/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: [
		'./index.html',
		'./src/**/*.{ts,tsx,js,jsx}',
	],
	theme: {
		extend: {
			colors: {
				brand: {
					DEFAULT: '#0ea5e9',
					dark: '#0284c7',
					light: '#38bdf8',
				},
			},
		},
	},
	plugins: [],
};
