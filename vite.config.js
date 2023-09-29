import devViteConfig from './dev.vite.config'
import prodViteConfig from './prod.vite.config'
import { defineConfig } from 'vite'

export default ({ mode }) => {
  switch (mode) {
    case 'development':
      return defineConfig(devViteConfig)
    case 'production':
      return defineConfig(prodViteConfig)
  }
}
