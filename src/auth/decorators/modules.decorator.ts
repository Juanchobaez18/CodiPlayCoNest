import { SetMetadata } from '@nestjs/common';

export const MODULES_KEY = 'modules';

export const Modules = (...modules: string[]) => SetMetadata(MODULES_KEY, modules);