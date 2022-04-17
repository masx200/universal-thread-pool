export interface ThreadPool<W> {
    minThreads: number;
    onQueueSizeChange(callback: (queueSize: number) => void): () => void;
    drain(): boolean;
    destroy: () => void;
    run<R>(
        callback: (w: W) => Promise<R>,
        signal?: AbortSignal | undefined,
    ): Promise<R>;
    maxThreads: number;
    [Symbol.toStringTag]: string;
    destroyed(): boolean;
    free(): boolean;
    busy(): boolean;
    threads: readonly W[];
    queueSize(): number;
    pendingSize(): number;
    onPendingSizeChange(callback: (pendingSize: number) => void): () => void;
}
