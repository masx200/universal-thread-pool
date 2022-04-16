import { API } from "./api.ts";
import { Remote, wrap } from "./deps.ts";

export function create_remote(
    error_event_listener: (event: ErrorEvent) => void,
): {
    worker: Worker;
    remote: Remote<API>;
} {
    const w = new Worker("./woker.ts", { type: "module" });
    const remote = wrap<API>(w);
    w.addEventListener("error", error_event_listener);
    return { worker: w, remote };
}
