CREATE TABLE `canvassing_batch_items` (
	`batch_id` text NOT NULL,
	`item_id` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`batch_id`, `item_id`),
	FOREIGN KEY (`batch_id`) REFERENCES `canvassing_batches`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`item_id`) REFERENCES `purchase_request_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `canvassing_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_request_id` text NOT NULL,
	`batch` integer NOT NULL,
	`quotes_required` integer DEFAULT 3 NOT NULL,
	`quotes_received_baseline` integer DEFAULT 0 NOT NULL,
	`exempted` integer DEFAULT false NOT NULL,
	`status` text NOT NULL,
	`status_label` text NOT NULL,
	`initiated_on` text NOT NULL,
	`selected_quote_id` text,
	`selected_on` text,
	FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `canvassing_batch_request_idx` ON `canvassing_batches` (`purchase_request_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `canvassing_batch_unique` ON `canvassing_batches` (`purchase_request_id`,`batch`);--> statement-breakpoint
CREATE TABLE `vendor_quote_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`quote_id` text NOT NULL,
	`item_id` text NOT NULL,
	`quantity` real NOT NULL,
	`unit_price` real NOT NULL,
	FOREIGN KEY (`quote_id`) REFERENCES `vendor_quotes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`item_id`) REFERENCES `purchase_request_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `vendor_quote_lines_quote_idx` ON `vendor_quote_lines` (`quote_id`);--> statement-breakpoint
CREATE TABLE `vendor_quotes` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`vendor_id` text NOT NULL,
	`total` real NOT NULL,
	`delivery_estimate` text NOT NULL,
	`quote_date` text NOT NULL,
	`quote_ref` text,
	`payment_terms` text,
	`document_name` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `canvassing_batches`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `vendor_quotes_batch_idx` ON `vendor_quotes` (`batch_id`);--> statement-breakpoint
CREATE TABLE `activity_feed` (
	`id` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `dashboard_kpis` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`value` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `deadlines` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`due` text NOT NULL,
	`overdue` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pending_quotations` (
	`id` text PRIMARY KEY NOT NULL,
	`summary` text NOT NULL,
	`detail` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`message` text NOT NULL,
	`href` text NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notifications_created_idx` ON `notifications` (`created_at`);--> statement-breakpoint
CREATE TABLE `purchase_order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_order_id` text NOT NULL,
	`item_id` text,
	`name` text NOT NULL,
	`quantity` real NOT NULL,
	`unit_price` real,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`item_id`) REFERENCES `purchase_request_items`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `purchase_order_items_order_idx` ON `purchase_order_items` (`purchase_order_id`);--> statement-breakpoint
CREATE TABLE `purchase_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_request_id` text,
	`vendor_id` text,
	`status` text DEFAULT 'Open' NOT NULL,
	`total` real,
	`issued_on` text,
	`expected_delivery` text,
	FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `purchase_orders_request_idx` ON `purchase_orders` (`purchase_request_id`);--> statement-breakpoint
CREATE TABLE `item_creation_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`item_name` text NOT NULL,
	`requested_for` text,
	`requested_by` text NOT NULL,
	`status` text NOT NULL,
	`status_label` text NOT NULL,
	`submitted_on` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pr_activity` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_request_id` text NOT NULL,
	`description` text NOT NULL,
	`occurred_on` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pr_activity_request_idx` ON `pr_activity` (`purchase_request_id`);--> statement-breakpoint
CREATE TABLE `pr_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_request_id` text NOT NULL,
	`author` text NOT NULL,
	`body` text NOT NULL,
	`created_on` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pr_comments_request_idx` ON `pr_comments` (`purchase_request_id`);--> statement-breakpoint
CREATE TABLE `pr_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_request_id` text NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pr_documents_request_idx` ON `pr_documents` (`purchase_request_id`);--> statement-breakpoint
CREATE TABLE `purchase_request_items` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_request_id` text NOT NULL,
	`name` text NOT NULL,
	`quantity` real NOT NULL,
	`unit` text,
	`estimated_unit_cost` real,
	`vendor_id` text,
	`catalog_item_id` text,
	`sourcing` text NOT NULL,
	`status` text NOT NULL,
	`delivered_on` text,
	`batch` integer,
	`not_in_catalog` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`catalog_item_id`) REFERENCES `catalog_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `pr_items_request_idx` ON `purchase_request_items` (`purchase_request_id`);--> statement-breakpoint
CREATE TABLE `purchase_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`auto_title` integer DEFAULT false NOT NULL,
	`requester` text NOT NULL,
	`requester_user_id` text,
	`department` text NOT NULL,
	`amount` real NOT NULL,
	`priority` text NOT NULL,
	`status` text NOT NULL,
	`status_label` text NOT NULL,
	`created_at` text,
	`submitted_on` text,
	`completed_on` text,
	`rejected_on` text,
	`rejection_reason` text,
	`action_panel_note` text,
	`action_step` text,
	`action_step_tone` text,
	`action_order` integer,
	`list_order` integer,
	FOREIGN KEY (`requester_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`department`) REFERENCES `departments`(`name`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `pr_status_idx` ON `purchase_requests` (`status`);--> statement-breakpoint
CREATE INDEX `pr_department_idx` ON `purchase_requests` (`department`);--> statement-breakpoint
CREATE INDEX `pr_list_order_idx` ON `purchase_requests` (`list_order`);--> statement-breakpoint
CREATE TABLE `catalog_items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`unit` text NOT NULL,
	`unit_cost` real NOT NULL,
	`category` text,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `catalog_items_name_unique` ON `catalog_items` (`name`);--> statement-breakpoint
CREATE TABLE `departments` (
	`name` text PRIMARY KEY NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payment_terms` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_terms_label_unique` ON `payment_terms` (`label`);--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`role` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`rating` real,
	`on_time_delivery_pct` integer,
	`pos_fulfilled` integer,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vendors_name_unique` ON `vendors` (`name`);--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`result_title` text NOT NULL,
	`summary` text NOT NULL,
	`chart_unit` text,
	`chart_currency` integer DEFAULT false NOT NULL,
	`chart_data` text NOT NULL,
	`table_columns` text NOT NULL,
	`table_rows` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`department` text NOT NULL,
	`status` text NOT NULL,
	`avatar` text DEFAULT '' NOT NULL,
	`is_current_user` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);