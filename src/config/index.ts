// Configuration file for environment variables with fallback defaults
interface Config {
  api: {
    baseUrl: string;
    mediaUrl: string;
  };
  app: {
    name: string;
    version: string;
  };
}

const config: Config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    mediaUrl: import.meta.env.VITE_MEDIA_URL || 'http://localhost:3000',
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Sharingo',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },
};

export default config;
