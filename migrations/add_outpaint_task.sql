-- 扩图任务队列表
CREATE TABLE IF NOT EXISTS "t_outpaint_task" (
    "id" SERIAL NOT NULL,
    "taskId" VARCHAR(64) NOT NULL,
    "imageKey" VARCHAR(500) NOT NULL,
    "expandDirection" VARCHAR(10) NOT NULL DEFAULT '16:9',
    "alignment" VARCHAR(20) NOT NULL DEFAULT 'Middle',
    "prompt" VARCHAR(1000),
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "resultUrl" VARCHAR(1000),
    "errorMessage" VARCHAR(1000),
    "userEmail" VARCHAR(255),
    "ipAddress" VARCHAR(50),
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "t_outpaint_task_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "t_outpaint_task_taskId_key" ON "t_outpaint_task"("taskId");
ALTER TABLE "t_outpaint_task" ADD COLUMN IF NOT EXISTS "userEmail" VARCHAR(255);
ALTER TABLE "t_outpaint_task" ADD COLUMN IF NOT EXISTS "ipAddress" VARCHAR(50);
