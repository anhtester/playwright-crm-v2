import { test as base, expect } from '../fixtures';

type DemoFixtures = { note: string };
type DemoWorkerFixtures = { workerNote: string };

// Thêm 2 fixture chỉ để IN LOG, giúp nhìn thấy vòng đời. Không dùng cho test thật.
const test = base.extend<DemoFixtures, DemoWorkerFixtures>({
  // Phạm vi worker: phụ thuộc runId (cũng phạm vi worker)
  workerNote: [async ({ runId }, use) => {
    console.log(`[${runId}] ▶ SETUP    workerNote (phạm vi worker)`);
    await use(`ghi chú của ${runId}`);
    console.log(`[${runId}] ◀ TEARDOWN workerNote (phạm vi worker)`);
  }, { scope: 'worker' }],

  // Phạm vi test (mặc định): phụ thuộc workerNote và runId
  note: async ({ workerNote, runId }, use, testInfo) => {
    console.log(`[${runId}]   ▶ setup    note cho "${testInfo.title}"`);
    await use(`${workerNote} / ${testInfo.title}`);
    console.log(`[${runId}]   ◀ teardown note cho "${testInfo.title}"`);
  },
});

for (const name of ['Test A', 'Test B', 'Test C', 'Test D']) {
  test(name, async ({ note, runId }) => {
    console.log(`[${runId}]     • thân ${name} đang chạy`);
    expect(note).toContain(runId);
  });
}
