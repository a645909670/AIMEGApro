-- 图片生成任务的幂等与原子处理锁。
-- requestId 对历史记录保留 NULL 兼容性；下一步接口会要求新请求必须提供该字段。
ALTER TABLE "t_outpaint_task"
  ADD COLUMN IF NOT EXISTS "requestId" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "provider_task_id" VARCHAR(128),
  ADD COLUMN IF NOT EXISTS "processing_started_at" TIMESTAMP(3);

-- PostgreSQL 的唯一索引允许多条 NULL，故不会影响没有 requestId 的历史任务。
-- 相同用户重复提交同一个 requestId 时，只能写入一条任务。
CREATE UNIQUE INDEX IF NOT EXISTS "t_outpaint_task_userEmail_requestId_key"
  ON "t_outpaint_task"("userEmail", "requestId");

-- 本地任务与第三方任务分开存储，防止重试时把第三方任务重复提交。
CREATE UNIQUE INDEX IF NOT EXISTS "t_outpaint_task_provider_task_id_key"
  ON "t_outpaint_task"("provider_task_id");

-- 支撑用户当前处理中任务的查询与状态抢占，避免全表扫描。
CREATE INDEX IF NOT EXISTS "t_outpaint_task_userEmail_status_idx"
  ON "t_outpaint_task"("userEmail", "status");

-- 用户级分布式提交锁：同一登录用户在排队或处理中只能存在一条任务。
-- PostgreSQL 部分唯一索引在多实例部署下同样生效，防止更换 requestId 后并发调用第三方接口。
CREATE UNIQUE INDEX IF NOT EXISTS "t_outpaint_task_one_active_task_per_user_key"
  ON "t_outpaint_task"("userEmail")
  WHERE "userEmail" IS NOT NULL AND "status" IN ('PENDING', 'PROCESSING');
