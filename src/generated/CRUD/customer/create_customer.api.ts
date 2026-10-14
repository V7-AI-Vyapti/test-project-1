import { Body, Controller, Injectable } from '@nestjs/common';
import { buildEndpoint } from '@vyapti/core/custom_api';
import {
    apiSuccess,
    type ApiSuccessResponse,
} from '@vyapti/core/custom_api_response';
import { Customer } from '@entities/customer.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const CreateCustomerRequestSchema = z.object({
    name: z.string(),
    description: z.string(),
    age: z.number().int(),
});

export class CreateCustomerRequestDto extends createZodDto(
    CreateCustomerRequestSchema,
) {}

@Injectable()
export class CreateCustomerService {
    async create(body: CreateCustomerRequestDto) {
        const parsed = CreateCustomerRequestSchema.parse(body);
        return await Customer.createOne(parsed);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class CreateCustomerController {
    constructor(private readonly service: CreateCustomerService) {}

    @RequirePermission('customer', 'create')
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: '/customer',
        tags: ['customer'],
        responses: {
            [HTTP_STATUS_CODES.CREATED]: 'customer created',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async createCustomer(
        @Body() body: CreateCustomerRequestDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.create(body);
        return apiSuccess(data, {
            message: 'customer created',
        });
    }
}
