-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ANONYMOUS_USER', 'PLAIN_USER', 'ADMIN_USER');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEED', 'FAILED');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('WAIT_PAID', 'PAY_SUCCEED', 'PAY_FAILED');

-- CreateTable
CREATE TABLE "s_user" (
    "id" TEXT NOT NULL,
    "type" "UserType" NOT NULL DEFAULT 'ANONYMOUS_USER',
    "name" VARCHAR(50),
    "nickname" VARCHAR(30),
    "password" VARCHAR(255),
    "image" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "credit" INTEGER NOT NULL DEFAULT 0,
    "total_credit" INTEGER NOT NULL DEFAULT 0,
    "giveCredit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "s_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "s_account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "s_account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "s_session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "s_verification_token" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "s_verification_token_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "s_dict" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "remark" VARCHAR(255),
    "create_by" VARCHAR(50) NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(50) NOT NULL,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "s_dict_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "s_dict_data" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER NOT NULL DEFAULT 0,
    "type" VARCHAR(50) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "layer" INTEGER NOT NULL DEFAULT 0,
    "path" VARCHAR(255) NOT NULL,
    "create_by" VARCHAR(50) NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(50) NOT NULL,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "s_dict_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "s_setting" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'default',
    "key" VARCHAR(50) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "is_require" BOOLEAN NOT NULL DEFAULT false,
    "tootip" VARCHAR(255),
    "remark" VARCHAR(255),
    "create_by" VARCHAR(50) NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(50) NOT NULL,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "s_setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "s_behavior_log" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "url" VARCHAR(255),
    "method" VARCHAR(10),
    "ip" VARCHAR(50),
    "os" VARCHAR(50),
    "browser" VARCHAR(50),
    "params" VARCHAR(255),
    "restuls" VARCHAR(255),
    "deatils" VARCHAR(255),
    "errors" VARCHAR(255),
    "status" VARCHAR(20) NOT NULL,
    "create_by" VARCHAR(50) NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "s_behavior_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_order" (
    "id" SERIAL NOT NULL,
    "order_no" TEXT NOT NULL,
    "user_id" VARCHAR(64) NOT NULL,
    "nickname" TEXT,
    "product_code" VARCHAR(20) NOT NULL,
    "product_name" VARCHAR(20) NOT NULL,
    "credit" INTEGER NOT NULL DEFAULT 0,
    "input_image_path" VARCHAR(200) NOT NULL,
    "output_id" VARCHAR(200),
    "output_image_path" VARCHAR(200),
    "output_options" TEXT,
    "output_quantity" INTEGER NOT NULL DEFAULT 1,
    "status" "OrderStatus" NOT NULL,
    "reason" VARCHAR(500),
    "create_time" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3),
    "cost_time" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "t_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_trade" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "trade_no" VARCHAR(32) NOT NULL,
    "plan_code" VARCHAR(30) NOT NULL,
    "plan_name" VARCHAR(100) NOT NULL,
    "channel" VARCHAR(50) NOT NULL,
    "amount" VARCHAR(50) NOT NULL,
    "credit" INTEGER NOT NULL DEFAULT 0,
    "details" VARCHAR(255) NOT NULL,
    "status" "TradeStatus" NOT NULL,
    "out_trade_no" VARCHAR(100),
    "out_trade_status" VARCHAR(50),
    "reason" TEXT,
    "done_time" TIMESTAMP(3),
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "t_trade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "s_user_email_key" ON "s_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "s_session_sessionToken_key" ON "s_session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "s_dict_type_key" ON "s_dict"("type");

-- CreateIndex
CREATE UNIQUE INDEX "t_order_order_no_key" ON "t_order"("order_no");

-- CreateIndex
CREATE UNIQUE INDEX "t_trade_trade_no_key" ON "t_trade"("trade_no");

-- AddForeignKey
ALTER TABLE "s_account" ADD CONSTRAINT "s_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "s_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "s_session" ADD CONSTRAINT "s_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "s_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_order" ADD CONSTRAINT "t_order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "s_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_trade" ADD CONSTRAINT "t_trade_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "s_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
