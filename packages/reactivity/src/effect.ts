export let reactiveEffect; //当前正在执行的effect，用于在依赖收集时,将当前effect添加到依赖中
/**
 * ReactiveEffect类,用于注册副作用函数
 */
class ReactiveEffect {
    constructor(public fn, public scheduler) {}

    // 执行副作用函数
    run() {
        let lastReactiveEffect = reactiveEffect; //缓存上一次的全局effect,针对effect嵌套的情况
        try {
            // 将当前effect赋值给全局变量,用于依赖收集
            reactiveEffect = this;
            this.fn();
        } finally {
            //reactiveEffect = undefined;// 清空全局变量，防止不需要执行effect时,还引用了effect
            reactiveEffect = lastReactiveEffect; // 恢复全局effect变量
        }
    }
}

/**
 * effect函数,用于注册副作用函数,当响应式数据变化时,会重新执行副作用函数
 * @param fn effect执行的回调函数
 * @param options effect的配置项
 */
export function effect(fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, () => {
        // scheduler函数。当effect执行时,会调用这个函数,这个函数会执行scheduler
        _effect.run();
    });
    _effect.run(); // 默认执行一次
    return _effect;
}
