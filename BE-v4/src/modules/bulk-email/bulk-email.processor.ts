import { processPendingJobs } from "./bulk-email.service";

let isRunning = false;
let shouldStop = false;

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const startProcessor = async () => {
  if (isRunning) {
    console.log("Bulk Email Processor already running.");
    return;
  }

  isRunning = true;
  shouldStop = false;

  console.log("✅ Bulk Email Processor: STARTED");

  while (!shouldStop) {
    try {
      const workDone = await processPendingJobs();

      // If job processed → short delay
      if (workDone) {
        await sleep(1000);
      }
      // If no job → longer delay
      else {
        await sleep(5000);
      }
    } catch (error) {
      console.error("❌ Bulk Email Processor Error:", error);
      await sleep(5000); // prevent crash loop
    }
  }

  isRunning = false;
  console.log("🛑 Bulk Email Processor: STOPPED");
};

export const stopProcessor = () => {
  console.log("Stopping Bulk Email Processor...");
  shouldStop = true;
};

const initBulkEmailProcessor = () => {
  startProcessor();
};

export default initBulkEmailProcessor;