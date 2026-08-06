import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // IMPORTANT: change this to match your GitHub repo name, e.g. '/dardy-site/'
  // If deploying to a custom domain or a user/org page (username.github.io), use '/'

  base: '/',

  
})
