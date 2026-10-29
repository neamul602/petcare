/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    /** The signed-in owner or provider, when there is one. */
    user?: { role: 'owner' | 'provider'; id: string; name: string };
    /** The signed-in admin, when there is one. */
    admin?: { role: 'admin'; id: string; name: string };
  }
}
