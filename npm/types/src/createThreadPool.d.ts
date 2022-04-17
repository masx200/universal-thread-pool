import { ThreadPool } from "./ThreadPool.js";
export declare function createThreadPool<W>(
    { create, minThreads, terminate, maxThreads }: {
        create: () => W;
        terminate: (w: W) => void;
        maxThreads?: number;
        minThreads?: number;
    },
): ThreadPool<W>;
