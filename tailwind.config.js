/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				serif: ['Inria Serif'],
				sans: ['Inria Sans']
			}
		}
	},
	plugins: [require('@tailwindcss/forms')]
};
