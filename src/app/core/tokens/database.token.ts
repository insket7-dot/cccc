// src/app/core/tokens/database.token.ts
import { InjectionToken } from '@angular/core';
import type { IDatabaseService } from '../interfaces/database.interface';

export const DATABASE_SERVICE = new InjectionToken<IDatabaseService>('DATABASE_SERVICE');


