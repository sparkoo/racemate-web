/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			spacing: {
				// Reduced spacing values
				'0.5': '0.125rem',  // 2px
				'1': '0.25rem',     // 4px
				'2': '0.375rem',    // 6px
				'3': '0.5rem',      // 8px
				'4': '0.75rem',     // 12px
			},
		},
	},
	plugins: [require("daisyui")],
	daisyui: {
		themes: ["dark"],
		// Add custom component overrides to make UI more compact
		styled: true,
		utils: true,
		prefix: "",
		logs: true,
		themeRoot: ":root",
	},
}