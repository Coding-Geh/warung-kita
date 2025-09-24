import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Array<'admin' | 'cashier'>) => SetMetadata(ROLES_KEY, roles);
