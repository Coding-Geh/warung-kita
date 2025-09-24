import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceIndexes1704067200000 implements MigrationInterface {
	name = 'AddPerformanceIndexes1704067200000';

	public async up(queryRunner: QueryRunner): Promise<void> {
		// Users table indexes
		await queryRunner.query(`CREATE INDEX "IDX_users_username" ON "users" ("username")`);
		await queryRunner.query(`CREATE INDEX "IDX_users_isActive" ON "users" ("isActive")`);
		await queryRunner.query(`CREATE INDEX "IDX_users_role" ON "users" ("role")`);

		// Products table indexes
		await queryRunner.query(`CREATE INDEX "IDX_products_name" ON "products" ("name")`);
		await queryRunner.query(`CREATE INDEX "IDX_products_categoryId" ON "products" ("categoryId")`);
		await queryRunner.query(`CREATE INDEX "IDX_products_isActive" ON "products" ("isActive")`);
		await queryRunner.query(`CREATE INDEX "IDX_products_stock" ON "products" ("stock")`);
		await queryRunner.query(`CREATE INDEX "IDX_products_price" ON "products" ("price")`);
		await queryRunner.query(`CREATE INDEX "IDX_products_createdAt" ON "products" ("createdAt")`);

		// Categories table indexes
		await queryRunner.query(`CREATE INDEX "IDX_categories_name" ON "categories" ("name")`);
		await queryRunner.query(`CREATE INDEX "IDX_categories_isActive" ON "categories" ("isActive")`);

		// Sales table indexes
		await queryRunner.query(`CREATE INDEX "IDX_sales_createdAt" ON "sales" ("createdAt")`);
		await queryRunner.query(`CREATE INDEX "IDX_sales_paymentMethod" ON "sales" ("paymentMethod")`);
		await queryRunner.query(`CREATE INDEX "IDX_sales_status" ON "sales" ("status")`);
		await queryRunner.query(`CREATE INDEX "IDX_sales_finalAmount" ON "sales" ("finalAmount")`);
		await queryRunner.query(`CREATE INDEX "IDX_sales_date_range" ON "sales" ("createdAt", "finalAmount")`);

		// SaleItems table indexes
		await queryRunner.query(`CREATE INDEX "IDX_saleItems_saleId" ON "saleItems" ("saleId")`);
		await queryRunner.query(`CREATE INDEX "IDX_saleItems_productId" ON "saleItems" ("productId")`);
		await queryRunner.query(`CREATE INDEX "IDX_saleItems_createdAt" ON "saleItems" ("createdAt")`);

		// Composite indexes for common queries
		await queryRunner.query(`CREATE INDEX "IDX_products_category_active" ON "products" ("categoryId", "isActive")`);
		await queryRunner.query(`CREATE INDEX "IDX_sales_date_payment" ON "sales" ("createdAt", "paymentMethod")`);
		await queryRunner.query(`CREATE INDEX "IDX_saleItems_sale_product" ON "saleItems" ("saleId", "productId")`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Drop all indexes
		await queryRunner.query(`DROP INDEX "IDX_users_username"`);
		await queryRunner.query(`DROP INDEX "IDX_users_isActive"`);
		await queryRunner.query(`DROP INDEX "IDX_users_role"`);

		await queryRunner.query(`DROP INDEX "IDX_products_name"`);
		await queryRunner.query(`DROP INDEX "IDX_products_categoryId"`);
		await queryRunner.query(`DROP INDEX "IDX_products_isActive"`);
		await queryRunner.query(`DROP INDEX "IDX_products_stock"`);
		await queryRunner.query(`DROP INDEX "IDX_products_price"`);
		await queryRunner.query(`DROP INDEX "IDX_products_createdAt"`);

		await queryRunner.query(`DROP INDEX "IDX_categories_name"`);
		await queryRunner.query(`DROP INDEX "IDX_categories_isActive"`);

		await queryRunner.query(`DROP INDEX "IDX_sales_createdAt"`);
		await queryRunner.query(`DROP INDEX "IDX_sales_paymentMethod"`);
		await queryRunner.query(`DROP INDEX "IDX_sales_status"`);
		await queryRunner.query(`DROP INDEX "IDX_sales_finalAmount"`);
		await queryRunner.query(`DROP INDEX "IDX_sales_date_range"`);

		await queryRunner.query(`DROP INDEX "IDX_saleItems_saleId"`);
		await queryRunner.query(`DROP INDEX "IDX_saleItems_productId"`);
		await queryRunner.query(`DROP INDEX "IDX_saleItems_createdAt"`);

		await queryRunner.query(`DROP INDEX "IDX_products_category_active"`);
		await queryRunner.query(`DROP INDEX "IDX_sales_date_payment"`);
		await queryRunner.query(`DROP INDEX "IDX_saleItems_sale_product"`);
	}
}
