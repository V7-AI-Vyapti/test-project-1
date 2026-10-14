import { Controller, Injectable, Query } from '@nestjs/common';
import { buildEndpoint } from '@vyapti/core/custom_api';
import {
    apiSuccess,
    type ApiSuccessResponse,
    buildPaginationMeta,
} from '@vyapti/core/custom_api_response';
import { Customer } from '@entities/customer.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ILike, IsNull } from 'typeorm';
import {
    buildAllowedOrder,
    normalizeSearch,
    resolvePagination,
} from '@vulcan/shared/utils/list-query';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const ListCustomerQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().optional().nullable(),
    sortBy: z.enum(['customer_id', 'name']).default('customer_id'),
    sortOrder: z.preprocess(
        (value) => (typeof value === 'string' ? value.toUpperCase() : value),
        z.enum(['ASC', 'DESC']).default('DESC'),
    ),
});

export class ListCustomerQueryDto extends createZodDto(
    ListCustomerQuerySchema,
) {}

const LIST_CUSTOMER_SORT_COLUMNS = {
    customer_id: 'customer_id',
    name: 'name',
} as const;

@Injectable()
export class ListCustomerService {
    async list(query: ListCustomerQueryDto) {
        const pagination = resolvePagination(query);
        const search = normalizeSearch(query.search);
        const where: Record<string, unknown> = {
            deleted_at: IsNull(),
        };
        if (search) {
            where.name = ILike(`%${search}%`);
        }
        const order = buildAllowedOrder({
            columns: LIST_CUSTOMER_SORT_COLUMNS,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            defaultSortBy: 'customer_id',
            defaultSortOrder: 'DESC',
        });
        const [rows, total] = await Promise.all([
            Customer.filter(where, {
                order,
                skip: pagination.skip,
                take: pagination.take,
            }),
            Customer.countOf(where),
        ]);
        return { items: rows, total, pagination };
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class ListCustomerController {
    constructor(private readonly service: ListCustomerService) {}

    @RequirePermission('customer', 'list')
    @buildEndpoint({
        method: API_METHOD_TYPES.GET,
        path: '/customer',
        tags: ['customer'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'customer list fetched',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async listCustomer(
        @Query() query: ListCustomerQueryDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const { items, total, pagination } = await this.service.list(query);
        return apiSuccess(items, {
            message: 'customer list fetched',
            meta: buildPaginationMeta(pagination.page, pagination.limit, total),
        });
    }
}
