CREATE TYPE "receipt_type" AS ENUM ('subscription', 'one_time');
ALTER TABLE receipts ADD COLUMN type receipt_type NOT NULL DEFAULT 'one_time';
