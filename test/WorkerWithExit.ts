export function WorkerWithExit(worker: Worker): Worker {
    let exited = false;
    function terminate() {
        if (exited) {
            return;
        }
        exited = true;
        Worker.prototype.terminate.call(worker);
        worker.dispatchEvent(new Event("exit"));
    }
    worker.terminate = terminate;
    return worker;
}
