import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import child_process from 'child_process'
import fs from 'fs'
import path from 'path'
import { env } from 'process'
import { defineConfig, UserConfig } from 'vite'

// Create base configuration that will always be applied
const baseConfig: UserConfig = {
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: parseInt(env.DEV_SERVER_PORT || '3000'),
    host: '0.0.0.0',
  },
}

// Only add HTTPS configuration for development
const isDevelopment = process.env.NODE_ENV !== 'production'

if (isDevelopment) {
  const baseFolder =
    env.APPDATA !== undefined && env.APPDATA !== ''
      ? `${env.APPDATA}/ASP.NET/https`
      : `${env.HOME}/.aspnet/https`

  const certificateName = 'reactwithasp.client'
  const certFilePath = path.join(baseFolder, `${certificateName}.pem`)
  const keyFilePath = path.join(baseFolder, `${certificateName}.key`)

  if (!fs.existsSync(baseFolder)) {
    fs.mkdirSync(baseFolder, { recursive: true })
  }

  if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
    if (
      0 !==
      child_process.spawnSync(
        'dotnet',
        [
          'dev-certs',
          'https',
          '--export-path',
          certFilePath,
          '--format',
          'Pem',
          '--no-password',
        ],
        { stdio: 'inherit' },
      ).status
    ) {
      throw new Error('Could not create certificate.')
    }
  }

  // Add HTTPS configuration to server options
  baseConfig.server = {
    ...baseConfig.server,
    https: {
      key: fs.readFileSync(keyFilePath),
      cert: fs.readFileSync(certFilePath),
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(baseConfig)
