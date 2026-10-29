import { buildDummyApp } from './app.ts';

const port = Number(process.env.DUMMY_PORT ?? 4100);
await buildDummyApp().listen({ port, host: '0.0.0.0' });
