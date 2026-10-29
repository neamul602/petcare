import { buildApp } from './app.ts';
import { loadRuntimeConfig } from './config.ts';

const { API_PORT } = loadRuntimeConfig();
const app = buildApp();
await app.listen({ port: API_PORT, host: '0.0.0.0' });
