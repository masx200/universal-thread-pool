# universal-thread-pool

Universal thread pool 通用线程池

适用于 CPU 密集型的任务的 通用线程池

可以与 comlink 配合使用实现,web worker 线程池,或者 nodejs 线程池

https://www.npmjs.com/package/comlink

## 导入模块

```ts
import {} from "https://deno.land/x/masx200_universal_thread_pool@1.0.1/mod.ts";
```

### `createThreadPool`:创建线程池,

接受参数`create`:创建抽象线程的函数

接受参数`terminate`:结束抽象线程的函数

接受参数`maxThreads`:线程池中最多的线程数

### `ThreadPool`线程池接口

`destroy`:销毁线程池中所有线程

`run`:在线程池中使用一个线程运行指定的`callback`回调函数,并返回结果,可选第二个参数`signal`可以使用`AbortSignal`来提前终止线程的运行.

`threads`:可以查看所有的线程.

## 查看 web worker 例子

https://github.com/masx200/universal-thread-pool/tree/main/test/test.ts

## 最简单的例子

```ts
function sleep(timeout: number): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, timeout);
    });
}
function create() {
    return {
        terminate() {
            console.log("terminate");
        },
        async echo(a: number): Promise<number> {
            await sleep(100);
            return a;
        },
    };
}
const pool = createThreadPool({
    create,
    terminate(w) {
        w.terminate();
    },
});

const r = await Promise.all(
    Array(10)
        .fill(0)
        .map((_v, i) => pool.run((w) => w.echo(i))),
);
assertEquals(
    r,
    Array(10)
        .fill(0)
        .map((_v, i) => i),
);
pool.destroy();
```
