module.exports = {
  content: [`_site/**/*.html`],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Avenir\\ Next'],
        'body': ['Avenir\\ Next'],
      },
      spacing: {
        '0': '0px',
        '1': '4.5px',
        '2': '9px',
        '3': '13.5px',
        '4': '18px',
        '5': '22.5px',
        '6': '27px',
        '8': '36px',
        '10': '45px',
        '12': '54px',
        '16': '72px',
        '20': '90px',
        '24': '108px',
        '32': '144px',
        '40': '180px',
        '48': '216px',
        '56': '252px',
        '64': '288px',
      },
      colors: {
        teal: {
          '100': '#D4ECEE', // Teal 5
          '200': '#A8DADD', // Teal 4
          '300': '#7DC7CC', // Teal 3
          '400': '#46B0B7', // Teal 2
          '500': '#25A2AA', // Teal 1
          '600': '#25A2AA',
        },
        yellow: {
	        '800': '#867E79', // Brown 1
        },
        green: {
	        '800': '#829260', // Green 1
        },
        gray: {
          '100': '#F6F8F9', // Gray/Light 1
          '200': '#F6F8F9',
	        '300': '#D1D3D4', // Black 5
	        '500': '#A3A7A9', // Black 4
	        '700': '#767B7E', // Black 3
          '800': '#3C4448', // Black 2
          '900': '#1A2328', // Black 1
        },
      },
    }
  },
  variants: {},
  plugins: [
    require('@tailwindcss/forms'), 
    require('@tailwindcss/typography')
  ],
}
