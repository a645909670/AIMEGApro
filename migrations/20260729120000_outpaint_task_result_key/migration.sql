-- 保存生成结果在对象存储中的 Key，供后续基于当前图片继续生成时使用。
ALTER TABLE "t_outpaint_task"
  ADD COLUMN IF NOT EXISTS "result_key" VARCHAR(500);
