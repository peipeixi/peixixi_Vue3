import { DirtyLevels } from "./constants";

/**
 * effect函数,用于注册副作用函数,当响应式数据变化时,会重新执行副作用函数
 * @param fn effect执行的回调函数
 * @param options effect的配置项
 */
export function effect(fn, options?) {
    const _effect = new ReactiveEffect(fn, () => {
        // scheduler函数。当effect执行时,会调用这个函数,这个函数会执行scheduler
        _effect.run();
    });
    _effect.run(); // 默认执行一次

    if (options) {
        Object.assign(_effect, options); //用户自定义的配置覆盖掉内置的，让用户来决定执行的操作
    }
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner; //可以让用户自己决定如何执行runner;
}

export let activeEffect; //当前正在执行的effect，用于在依赖收集时,将当前effect添加到依赖中
/**
 * ReactiveEffect类,用于注册副作用函数
 */
export class ReactiveEffect {
    _trackId = 0; //记录当前effect被执行的次数，用于防止effect中多次出现的同一个属性被重复收集
    deps = []; //记录当前effect被哪些dep依赖收集了，让effect和dep形成双向保存，用于effect中对同一个属性前后两次无效收集的清除
    _depsLength = 0;

    _dirtyLevel = DirtyLevels.Dirty; //effect的脏值级别，默认为Dirty

    _running = 0; //effect是否正在运行

    constructor(public fn, public scheduler) {}

    get dirty() {
        return this._dirtyLevel === DirtyLevels.Dirty;
    }
    set dirty(value) {
        this._dirtyLevel = value ? DirtyLevels.Dirty : DirtyLevels.NotDirty;
    }

    // 执行副作用函数
    run() {
        let lastActiveEffect = activeEffect; //缓存上一次的全局effect,针对effect嵌套的情况
        try {
            this._dirtyLevel = DirtyLevels.NotDirty; //每次effect执行前,将脏值级别重置为NotDirty，保证后面在计算属性依赖的属性更新之前,读取到缓存的脏值

            // 将当前effect赋值给全局变量,用于依赖收集
            activeEffect = this;

            this._running++; //表示当前effect正在运行

            //每次effect执行前需要清理上一次的依赖收集
            preCleanEffect(this);

            return this.fn();
        } finally {
            postCleanEffect(this); //清理deps列表中_depsLength之后无效的dep

            this._running--; //表示当前effect运行结束

            //reactiveEffect = undefined;// 清空全局变量，防止不需要执行effect时,还引用了effect
            activeEffect = lastActiveEffect; // 恢复全局effect变量
        }
    }
}

/**
 * effect执行之前的清理操作
 * @param effect 当前effect
 */
function preCleanEffect(effect) {
    effect._depsLength = 0; //每次effect执行，deps从第一个元素进行比较
    effect._trackId++; //每次effect执行，_trackId计数次数加一，所以同一个effect中，收集映射表中属性的dep里effect对应的_trackId值相同
}

/**
 * 清理deps列表中_depsLength之后无效的dep
 * @param effect 当前effect
 */
function postCleanEffect(effect) {
    if (effect._depsLength < effect.deps.length) {
        for (let i = effect._depsLength; i < effect.deps.length; i++) {
            clearDepEffect(effect.deps[i], effect); //先清除映射表中dep的effect
        }
        effect.deps.length = effect._depsLength; //再清空effect的deps中无效的dep
    }
}

/**
 * 清理dep和effect的依赖关系
 * @param dep 需要清理的dep
 * @param effect 当前的effect
 */
function clearDepEffect(dep, effect) {
    dep.delete(effect);
    if (dep.size === 0) {
        //dep中已经没有收集任何的effect则从映射表中删除该dep
        dep.cleanUp();
    }
}

/**
 * 收集dep和effect的对应关系.
 * 1、避免重复收集：比较dep中保存的effect对应的value值_trackId与当前effect中计算的_trackId值，相同说明该属性已收集，不同说明未收集则需收集
 * 2、清空effect的deps中无效的dep：用当前的dep跟deps中的dep从头开始依次进行比较，如果不同说明列表中该dep是无效的，替换为当前的dep
 * 3、比较并清理无效的dep后，deps中从_depsLength开始到deps最后一个dep都是无效的dep，需将它们删除，run()方法finally中的postCleanEffect()执行该步骤
 * @param dep 依赖集合
 * @param effect effect函数
 */
export function trackEffect(dep, effect) {
    //1、比较dep中保存的effect对应的value值_trackId与当前effect中计算的_trackId值，相同说明该属性已收集，不同说明未收集则需收集
    if (dep.get(effect) !== effect._trackId) {
        dep.set(effect, effect._trackId); //收集effect

        //2、更新effect的deps
        const oldDep = effect.deps[effect._depsLength];
        if (oldDep !== dep) {
            if (oldDep) {
                //删除对应位置的oldDep
                clearDepEffect(oldDep, effect);
            }
            //对应位置的dep换成新的
            effect.deps[effect._depsLength++] = dep;
        } else {
            effect._depsLength++; //下次比较取后一个dep
        }
    }
}

/**
 * 触发更新执行effect
 * @param dep 依赖集合
 */
export function triggerEffect(dep) {
    for (const effect of dep.keys()) {
        if (!effect.dirty) {
            //如果effect的值不是脏值，则将其设为脏值，保证依赖的数据变化后重新计算计算属性的值
            effect.dirty = true;
        }
        if (!effect._running && effect.scheduler) {
            effect.scheduler(); // 如果有scheduler函数,通过scheduler来执行effect.run()
        }
    }
}
