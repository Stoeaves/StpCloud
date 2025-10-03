type TaskInfo = {
  id: number;
  taskFn: Function;
  resolve: Function;
  reject: Function;
  metadata?: any;
  retries: number;
  controller: AbortController;
};

export type BpOptions = {
  concurrency: number;
  maxRetries: number;
  onProgress: Function;
  onComplete: Function;
  onError: Function;
  onCancel: Function;
};
export class BetterPromise {
  // 配置项
  concurrency: number;
  maxRetries: number;
  onProgress: Function;
  onComplete: Function;
  onError: Function;
  onCancel: Function;

  // 控制状态
  private isActive: boolean;
  private isPaused: boolean;
  private isCancelled: boolean;

  // 任务管理
  private taskQueue: TaskInfo[];
  private activeTasks: Map<number, TaskInfo>;
  private pendingTasks: Map<number, TaskInfo>;
  private completedCount: number;
  private failedCount: number;
  private totalTasks: number;
  private taskID: number;
  private taskResults: Map<Object, Object>;
  private cancelControllers: Map<number, AbortController>;

  /**
   * BetterPromise
   * @param {Object} options - 配置选项
   * @param {number} [options.concurrency=5] - 最大并发数
   * @param {number} [options.maxRetries=3] - 每个任务的最大重试次数
   * @param {Function} [options.onProgress] - 进度回调函数
   * @param {Function} [options.onComplete] - 所有任务完成时的回调
   * @param {Function} [options.onError] - 单个任务失败时的回调
   * @param {Function} [options.onCancel] - 调度器被取消时的回调
   */
  constructor(options: BpOptions) {
    // 配置项处理
    this.concurrency = options.concurrency || 5;
    this.maxRetries = options.maxRetries || 3;
    this.onProgress = options.onProgress || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.onError = options.onError || (() => {});
    this.onCancel = options.onCancel || (() => {});

    // 控制状态
    this.isActive = false; // 调度器是否正在运行
    this.isPaused = false; // 调度器是否暂停
    this.isCancelled = false; // 是否已取消所有任务

    // 任务管理
    this.taskQueue = []; // 等待执行的任务队列
    this.activeTasks = new Map(); // 当前执行中的任务
    this.pendingTasks = new Map(); // 已添加但尚未执行的任务
    this.completedCount = 0; // 已完成任务数
    this.failedCount = 0; // 失败任务数
    this.totalTasks = 0; // 总任务数
    this.taskID = 0; // 任务ID生成器
    this.taskResults = new Map(); // 任务结果存储
    this.cancelControllers = new Map(); // 任务取消控制器
  }

  /**
   * 添加任务到队列
   * @param {Function} taskFn - 返回Promise的函数，可接收cancelSignal参数
   * @param {*} [metadata] - 关联的任务元数据
   * @returns {Promise} 当任务完成时的Promise
   */
  add(taskFn: Function, metadata = null) {
    if (this.isCancelled) {
      return Promise.reject('无法添加任务：调度器已取消');
    }

    const id = this.taskID++;
    this.totalTasks++;

    // 为每个任务创建取消控制器
    const controller = new AbortController();
    this.cancelControllers.set(id, controller);

    const taskPromise = new Promise((resolve, reject) => {
      // 存储任务信息
      this.pendingTasks.set(id, {
        id,
        taskFn,
        resolve,
        reject,
        metadata,
        retries: 0,
        controller,
      });

      // 如果调度器已激活，直接加入执行队列
      if (this.isActive && !this.isPaused) {
        this._queueTask(id);
      }
    });

    this._reportProgress();
    return taskPromise;
  }

  /**
   * 手动启动任务执行
   */
  start() {
    if (this.isCancelled) {
      throw new Error('无法启动: 调度器已取消');
    }

    if (!this.isActive) {
      this.isActive = true;
      this._processQueue();
    }

    if (this.isPaused) {
      this.resume();
    }
  }

  /**
   * 暂停任务执行
   * 正在运行的任务会继续完成，但不会启动新任务
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * 恢复被暂停的任务执行
   */
  resume() {
    if (!this.isActive) {
      this.start();
      return;
    }

    if (this.isPaused) {
      this.isPaused = false;
      this._processQueue();
    }
  }

  /**
   * 取消所有任务
   * 包括已排队但未执行的任务和正在执行的任务
   */
  cancel() {
    if (this.isCancelled) return;

    this.isCancelled = true;

    // 收集被取消的任务ID
    const cancelledIds = [...this.pendingTasks.keys(), ...this.activeTasks.keys(), ...this.taskQueue.map((t) => t.id)];

    // 触发取消回调
    this.onCancel(cancelledIds);

    // 取消所有待处理任务
    this.pendingTasks.forEach((task) => {
      this._cancelTask(task);
    });

    // 取消所有正在执行的任务
    this.activeTasks.forEach((task) => {
      this._cancelTask(task);
    });

    // 清空队列
    this.pendingTasks.clear();
    this.activeTasks.clear();
    this.taskQueue = [];

    // 更新计数器
    const remainingTasks = this.totalTasks - this.completedCount - this.failedCount;
    this.failedCount = remainingTasks; // 将所有剩余任务标记为失败
    this.cancelControllers.clear();

    this._reportProgress();
    this._checkCompletion();
  }

  /**
   * 取消任务的实际逻辑
   * @param {Object} task - 任务对象
   */
  private _cancelTask(task: TaskInfo) {
    // 触发取消信号
    const controller = this.cancelControllers.get(task.id);
    if (controller) {
      controller.abort('任务取消');
    }

    // 拒绝任务Promise
    task.reject('任务取消');

    // 记录结果
    this.taskResults.set(task.id, {
      status: 'cancelled',
      reason: '任务取消',
      metadata: task.metadata,
      retries: task.retries,
    });
  }

  /**
   * 将待处理任务加入执行队列
   * @param {number} taskId - 任务ID
   */
  private _queueTask(taskId: number) {
    const task = this.pendingTasks.get(taskId);
    if (!task) return;

    // 从未执行任务中移除
    this.pendingTasks.delete(taskId);

    // 加入执行队列
    this.taskQueue.push(task);
  }

  /**
   * 处理任务队列
   */
  private _processQueue() {
    // 如果已取消或暂停，不处理新任务
    if (this.isCancelled || this.isPaused) return;

    // 如果调度器未激活，不处理
    if (!this.isActive) return;

    // 当并发数未满且有待处理任务时
    while (this.activeTasks.size < this.concurrency && (this.taskQueue.length > 0 || this.pendingTasks.size > 0)) {
      // 优先处理已排队的任务
      if (this.taskQueue.length > 0) {
        const task = this.taskQueue.shift()!;
        this._executeTask(task);
      }
      // 否则从待处理任务中取一个
      else if (this.pendingTasks.size > 0) {
        const taskId = this.pendingTasks.keys().next().value!;
        const task = this.pendingTasks.get(taskId)!;
        this.pendingTasks.delete(taskId);
        this._executeTask(task);
      }
    }
  }

  /**
   * 执行单个任务
   * @param {Object} task - 任务对象
   */
  private async _executeTask(task: TaskInfo) {
    // 添加到活动任务集
    this.activeTasks.set(task.id, task);

    try {
      // 传递取消信号
      const result = await task.taskFn({
        metadata: task.metadata,
        cancelSignal: task.controller.signal,
      });

      this._handleTaskSuccess(task, result);
    } catch (error) {
      this._handleTaskError(task, error as Error);
    }
  }

  /**
   * 任务成功处理
   * @param {Object} task - 任务对象
   * @param {*} result - 任务结果
   */
  private _handleTaskSuccess(task: TaskInfo, result: Object) {
    // 如果已取消，不再处理结果
    if (this.isCancelled) return;

    this.completedCount++;
    this.activeTasks.delete(task.id);
    this.cancelControllers.delete(task.id);

    this.taskResults.set(task.id, {
      status: 'fulfilled',
      value: result,
      metadata: task.metadata,
      retries: task.retries,
    });

    task.resolve(result);
    this._reportProgress();
    this._processQueue();
    this._checkCompletion();
  }

  /**
   * 任务失败处理
   * @param {Object} task - 任务对象
   * @param {Error} error - 错误对象
   */
  private _handleTaskError(task: TaskInfo, error: Error) {
    // 如果已取消，不再处理结果
    if (this.isCancelled) return;

    // 取消错误直接处理
    if (error.name === 'AbortError' || error.message === 'Task cancelled') {
      this.completedCount++;
      this.failedCount++;
      this.activeTasks.delete(task.id);
      this.cancelControllers.delete(task.id);

      this.taskResults.set(task.id, {
        status: 'cancelled',
        reason: error.message,
        metadata: task.metadata,
        retries: task.retries,
      });

      task.reject(error);
      this._reportProgress();
      this._processQueue();
      this._checkCompletion();
      return;
    }

    // 非取消错误的处理
    if (task.retries < this.maxRetries) {
      task.retries++;
      this.taskQueue.push(task);
      this.activeTasks.delete(task.id);
      this._processQueue();
    } else {
      this.failedCount++;
      this.completedCount++;
      this.activeTasks.delete(task.id);
      this.cancelControllers.delete(task.id);

      this.taskResults.set(task.id, {
        status: 'rejected',
        reason: error,
        metadata: task.metadata,
        retries: task.retries,
      });

      task.reject(error);
      this.onError(error, task.id);
      this._reportProgress();
      this._processQueue();
      this._checkCompletion();
    }
  }

  /**
   * 报告进度
   */
  private _reportProgress() {
    this.onProgress(this.completedCount, this.totalTasks);
  }

  /**
   * 检查所有任务是否完成
   */
  private _checkCompletion() {
    if (this.completedCount === this.totalTasks) {
      this.onComplete();
      this.isActive = false;
    }
  }

  /**
   * 获取当前状态统计
   * @returns {Object} 包含队列状态的对象
   */
  getStats() {
    return {
      pending: this.pendingTasks.size + this.taskQueue.length,
      active: this.activeTasks.size,
      completed: this.completedCount,
      failed: this.failedCount,
      total: this.totalTasks,
      isActive: this.isActive,
      isPaused: this.isPaused,
      isCancelled: this.isCancelled,
    };
  }

  /**
   * 获取所有任务的最终结果
   * @returns {Map} 任务ID到结果的映射
   */
  getAllResults() {
    return this.taskResults;
  }

  /**
   * 获取特定任务的状态
   * @param {number} taskId - 任务ID
   * @returns {Object|null} 任务状态对象或null
   */
  getTaskStatus(taskId: number) {
    const result = this.taskResults.get(taskId);
    if (result) return result;

    if (this.pendingTasks.has(taskId)) return { status: 'pending' };
    if (this.taskQueue.some((t) => t.id === taskId)) return { status: 'queued' };
    if (this.activeTasks.has(taskId)) return { status: 'active' };

    return null;
  }
}
