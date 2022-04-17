export const get_cpu_Count = function (): number {
    if (typeof navigator !== "undefined") {
        return navigator.hardwareConcurrency;
    }

    if (typeof os !== "undefined") {
        return os.cpus().length;
    }
    return 1;
};
declare global {
    // deno-lint-ignore no-explicit-any
    const os: { cpus(): Array<any> };
}
