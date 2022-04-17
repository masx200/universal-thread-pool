export declare const get_cpu_Count: () => number;
declare global {
    const os: {
        cpus(): Array<any>;
    };
}
