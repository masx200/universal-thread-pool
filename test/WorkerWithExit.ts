export class WorkerWithExit extends Worker {
    #exited = false;
    terminate() {
        if (this.#exited) {
            return;
        }
        this.#exited = true;
        super.terminate();
        this.dispatchEvent(new Event("exit"));
    }
}
