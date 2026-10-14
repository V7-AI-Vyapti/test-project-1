import {
    Body,
    Controller,
    Injectable,
    NotFoundException,
    Param,
} from '@nestjs/common';
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

export const UpdateCustomerRequestSchema = z
    .object({
        name: z.string(),
        description: z.string(),
        age: z.number().int(),
    })
    .partial();

export class UpdateCustomerRequestDto extends createZodDto(
    UpdateCustomerRequestSchema,
) {}

export const CustomerIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class CustomerIdParamsDto extends createZodDto(CustomerIdParamsSchema) {}

@Injectable()
export class UpdateCustomerService {
    async update(id: number, body: UpdateCustomerRequestDto) {
        const record = await Customer.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('customer not found');
        }
        const parsed = UpdateCustomerRequestSchema.parse(body);
        await Customer.updateByPk(id, parsed);
        return await Customer.getByPk(id);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class UpdateCustomerController {
    constructor(private readonly service: UpdateCustomerService) {}

    @RequirePermission('customer', 'update')
    @buildEndpoint({
        method: API_METHOD_TYPES.PATCH,
        path: '/customer/:id',
        tags: ['customer'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'customer updated',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'customer not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async updateCustomer(
        @Param() params: CustomerIdParamsDto,
        @Body() body: UpdateCustomerRequestDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.update(params.id, body);
        return apiSuccess(data, {
            message: 'customer updated',
        });
    }
}
