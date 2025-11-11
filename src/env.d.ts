/// <reference types="astro/client" />

import type { UserResponse } from './lib/api/authApi';

declare namespace App {
  interface Locals {
    user?: UserResponse;
  }
}
