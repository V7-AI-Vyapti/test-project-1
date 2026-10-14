import { buildEntitySchema } from '@vyapti/core';
import { Customer } from './customer.entity';

export const entitySchemas = [buildEntitySchema(Customer)];
