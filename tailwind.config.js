/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				inria: ['Inria Serif']
			}
		}
	},
	plugins: [require('@tailwindcss/forms')]
};
