export const get_cpu_Count = function () {
    if (typeof navigator !== "undefined") {
        return navigator.hardwareConcurrency;
    }
    if (typeof os !== "undefined") {
        return os.cpus().length;
    }
    return 1;
};
