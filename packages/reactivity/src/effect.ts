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

export let activeEffect; //当前正在执行的effect，用于在依赖收集时,将当前effect添加到依赖中
/**
 * ReactiveEffect类,用于注册副作用函数
 */
class ReactiveEffect {
    _trackId = 0; //记录当前effect被执行的次数
    deps = []; //记录当前effect被哪些dep依赖收集了，让effect和dep形成双向保存
    _depsLength = 0;

    constructor(public fn, public scheduler) {}

    // 执行副作用函数
    run() {
        let lastActiveEffect = activeEffect; //缓存上一次的全局effect,针对effect嵌套的情况
        try {
            // 将当前effect赋值给全局变量,用于依赖收集
            activeEffect = this;
            this.fn();
        } finally {
            //reactiveEffect = undefined;// 清空全局变量，防止不需要执行effect时,还引用了effect
            activeEffect = lastActiveEffect; // 恢复全局effect变量
        }
    }
}

/**
 * 收集dep和effect的对应关系
 * @param dep 依赖集合
 * @param effect effect函数
 */
export function trackEffects(dep, effect) {
    dep.set(effect, effect._trackId);
    effect.deps[effect._depsLength++] = dep; // 将dep添加到effect的deps中
}

/**
 * 触发更新执行effect
 * @param dep 依赖集合
 */
export function triggerEffects(dep) {
    for (const effect of dep.keys()) {
        if (effect.scheduler) {
            effect.scheduler(); // 如果有scheduler函数,通过scheduler来执行effect.run()
        }
    }
}
