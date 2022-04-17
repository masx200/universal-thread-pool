# universal-thread-pool

Universal thread pool 通用线程池

适用于 `CPU` 密集型的任务的 通用线程池

由于`JavaScript`有异步方式处理`IO`密集型任务,所以不应该在线程池中使用`IO`密集型任务.

可以与 `comlink` 配合使用实现,浏览器或者 `deno` 的 `web worker` 线程池,或者 `nodejs` 的
`worker_threads` 线程池

https://www.npmjs.com/package/comlink

## 导入模块

### deno

指定版本号

```ts
import {} from "https://deno.land/x/masx200_universal_thread_pool@1.0.5/mod.ts";
```

```ts
import {} from "https://cdn.jsdelivr.net/gh/masx200/universal-thread-pool@1.0.5/mod.ts";
```

### node

```ts
import {} from "@masx200/universal-thread-pool";
```

### `createThreadPool`:创建线程池,

接受必选参数`create`:创建抽象线程的函数

接受必选参数`terminate`:结束抽象线程的函数

接受可选参数`maxThreads`:线程池中最多的线程数，默认为 `cpu` 个数

接受可选参数`minThreads`:线程池中最少的线程数，默认为 1.

### `ThreadPool`线程池接口

`destroy`:销毁线程池中所有线程

`run`:在线程池中使用一个线程运行指定的`callback`回调函数,并返回结果,可选第二个参数`signal`可以使用`AbortSignal`来提前终止线程的运行.

`threads`:可以查看所有的线程.

`onPendingSizeChange`：添加监听器`callback`，当正在运行的任务数改变时，监听器被调用，返回一个停止监听的函数。

`onQueueSizeChange`：添加监听器`callback`，当正在排队的任务数改变时，监听器被调用，返回一个停止监听的函数。

## 查看 `web worker` 例子

https://github.com/masx200/universal-thread-pool/tree/main/test/test.ts
