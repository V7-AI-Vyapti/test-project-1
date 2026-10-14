import { CustomTypeormEntityBase, CustomTypeormFields } from '@vyapti/core';
export class Customer extends CustomTypeormEntityBase {
    static tableName = 'customer';
    customer_id = CustomTypeormFields.AutoPK({ db_column: 'customer_id' });
    name = CustomTypeormFields.CharacterString({ db_column: 'name' });
    description = CustomTypeormFields.Text({ db_column: 'description' });
    age = CustomTypeormFields.Integer({ db_column: 'age' });
    deleted_at = CustomTypeormFields.Integer({
        db_column: 'deleted_at',
        null: true,
    });
}
