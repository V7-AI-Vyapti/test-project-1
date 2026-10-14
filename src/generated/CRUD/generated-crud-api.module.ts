import { Module } from '@nestjs/common';
import {
    CreateCustomerController,
    CreateCustomerService,
} from '@generated-crud/customer/create_customer.api';
import {
    DeleteCustomerController,
    DeleteCustomerService,
} from '@generated-crud/customer/delete_customer.api';
import {
    ListCustomerController,
    ListCustomerService,
} from '@generated-crud/customer/list_customer.api';
import {
    UpdateCustomerController,
    UpdateCustomerService,
} from '@generated-crud/customer/update_customer.api';
import {
    ViewCustomerController,
    ViewCustomerService,
} from '@generated-crud/customer/view_customer.api';

@Module({
    controllers: [
        CreateCustomerController,
        DeleteCustomerController,
        ListCustomerController,
        UpdateCustomerController,
        ViewCustomerController,
    ],
    providers: [
        CreateCustomerService,
        DeleteCustomerService,
        ListCustomerService,
        UpdateCustomerService,
        ViewCustomerService,
    ],
})
export class GeneratedCrudApiModule {}
