import {
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

export const CustomerIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class CustomerIdParamsDto extends createZodDto(CustomerIdParamsSchema) {}

@Injectable()
export class ViewCustomerService {
    async getById(id: number) {
        const record = await Customer.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('customer not found');
        }
        return record;
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class ViewCustomerController {
    constructor(private readonly service: ViewCustomerService) {}

    @RequirePermission('customer', 'view')
    @buildEndpoint({
        method: API_METHOD_TYPES.GET,
        path: '/customer/:id',
        tags: ['customer'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'customer fetched',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'customer not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async getCustomer(
        @Param() params: CustomerIdParamsDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.getById(params.id);
        return apiSuccess(data, {
            message: 'customer fetched',
        });
    }
}
