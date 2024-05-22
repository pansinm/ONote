import { CronJob } from 'cron';
import IpcHandler from '../IpcHandler';

let id = 0;
function uniqId() {
  return id++;
}

class CronHandler extends IpcHandler {
  async startJob(cronTime: string) {
    const id = uniqId();
    const job = CronJob.from({
      cronTime,
      onTick: () => {
        // 执行任务逻辑
        this.send('ticked', {
          id,
        });
      },
    });
    job.start();
    return id;
  }
}

export default CronHandler;
