// https://nuxt.com/docs/api/configuration/nuxt-config
export default {
  devtools: {enabled: true},
  ssr: false,
  env: {
    apiUrl: process.env.API_URL || 'http://backend:5000',
  },
}
