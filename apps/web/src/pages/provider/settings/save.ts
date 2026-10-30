import type { APIRoute } from 'astro';
import { saveSettings } from '@/lib/settings';

export const prerender = false;
export const POST: APIRoute = (context) => saveSettings(context, '/provider/settings');
