-- 仅处理图片生成任务表 t_outpaint_task。
-- 该表的时间列为 timestamp without time zone；历史值原以 UTC 墙上时间写入，
-- 本迁移将其整体校正为北京时间（UTC+8）墙上时间，并保证后续写入保持一致。
-- 注意：这是一次性迁移，历史数据的 +8 小时校正只能执行一次。

BEGIN;

-- 将现有 UTC 墙上时间转换为对应的北京时间墙上时间，不影响其他任何表。
UPDATE "t_outpaint_task"
SET
  "create_time" = "create_time" + INTERVAL '8 hours',
  "update_time" = "update_time" + INTERVAL '8 hours';

-- 新建任务未显式传入 create_time 时，数据库直接按北京时间生成时间。
ALTER TABLE "t_outpaint_task"
  ALTER COLUMN "create_time"
  SET DEFAULT timezone('Asia/Shanghai', now());

-- Prisma 会在更新时传入 update_time，因此通过表级触发器统一覆盖为北京时间。
CREATE OR REPLACE FUNCTION set_outpaint_task_beijing_update_time()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW."update_time" := timezone('Asia/Shanghai', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_outpaint_task_beijing_update_time ON "t_outpaint_task";

CREATE TRIGGER trg_outpaint_task_beijing_update_time
BEFORE INSERT OR UPDATE ON "t_outpaint_task"
FOR EACH ROW
EXECUTE FUNCTION set_outpaint_task_beijing_update_time();

COMMIT;
