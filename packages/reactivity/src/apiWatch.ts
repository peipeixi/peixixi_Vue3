import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";
import { isRef } from "./ref";
import { isObject } from "@myvue/shared";

/**
 *  watch函数
 * @param source 要观察的源对象,可以是响应式对象、ref对象、函数,相当于effect的getter函数
 * @param cb  回调函数，当source发生变化时执行，回调函数的参数为source的新值和旧值，相当于在effect的scheduler函数中执行
 * @param options  配置项，包括immediate:是否立即执行回调函数,deep:是否深度观察
 * @returns  wach函数返回一个停止观察的函数
 */
export function watch(source, cb, options = {}) {
    return doWatch(source, cb, options);
}
/**
 *  watchEffect函数
 * @param effectGetter effect的getter函数，当source发生变化时执行
 * @param options  配置项，包括immediate:是否立即执行回调函数,deep:是否深度观察,
 * @returns  watchEffect函数返回一个停止观察的函数
 */
export function watchEffect(effectGetter, options = {}) {
    return doWatch(effectGetter, null, options);
}

/**
 *  watch函数和watchEffect函数的实现
 * @param source 要观察的源对象
 * @param cb  回调函数
 * @param options 配置项
 */
function doWatch(source, cb, options) {
    let getter;
    if (typeof source === "function") {
        //如果source是函数,则将source赋值给getter
        getter = source;
    } else if (isRef(source)) {
        //如果source是ref对象,则将source.value赋值给getter
        getter = () => source.value;
    } else if (isReactive(source)) {
        //如果source是响应式对象,则将遍历source的函数赋值给getter
        const reactiveGetter = (source) => {
            return reverse(source, options.deep ? 1 : undefined);
        };
        getter = () => reactiveGetter(source);
    }
    let oldValue;
    let clean;
    const onCleanUp = (fn) => {
        //清理函数，用于清理watch
        clean = () => {
            fn();
            clean = undefined;
        };
    };
    const job = () => {
        //job函数，用于执行effect和cb函数
        if (cb) {
            const newValue = effect.run();
            if (clean) {
                clean(); //执行cb回调前，先对上一次的watch操作进行清理
            }
            cb(newValue, oldValue, onCleanUp);
            oldValue = newValue;
        } else {
            effect.run(); //如果cb函数不存在，则只执行effect函数,使用于watchEffect函数
        }
    };
    const effect = new ReactiveEffect(getter, job); //创建一个effect,将getter函数和job函数作为参数传入

    if (cb) {
        if (options.immediate) {
            //如果设置了immediate选项,则立即执行job函数
            job();
        } else {
            oldValue = effect.run(); //先执行一次getter函数追踪依赖关系，将返回值赋值给oldValue
        }
    } else {
        effect.run(); //如果cb函数不存在，则只执行effect函数,使用于watchEffect函数
    }

    const unwatch = () => {
        effect.stop(); //停止effect函数
        if (clean) {
            clean(); //清理watch
        }
    };
    return unwatch; //返回停止观察的函数
}

/**
 * 递归遍历source,让source中的响应式属性和作为effect的getter函数建立依赖关系
 * @param source 要观察的源对象
 * @param depth  深度
 * @param currentDepth 当前深度
 * @param seened  已经遍历过的对象
 * @returns
 */
function reverse(source, depth, currentDepth = 0, seened = new Set()) {
    if (!isObject(source))
        //如果source不是对象,则直接返回source
        return source;

    if (depth) {
        //如果设置了深度
        if (currentDepth >= depth) {
            //如果当前深度大于等于设置的深度,则直接返回source
            return source;
        }
        currentDepth++; //当前深度加1
    }
    if (seened.has(source)) {
        //如果已经遍历过source,则直接返回source
        return source;
    }
    seened.add(source); //将source添加到已经遍历过的对象中
    if (Array.isArray(source)) {
        //如果source是数组,则遍历数组中的每一个元素,并递归调用reverse函数
        for (let i = 0; i < source.length; i++) {
            reverse(source[i], depth, currentDepth, seened); //递归调用reverse函数,将当前元素作为source传入
        }
    } else if (typeof source === "object" && source !== null) {
        //如果source是对象,则遍历对象中的每一个属性,并递归调用reverse函数
        for (const key in source) {
            reverse(source[key], depth, currentDepth, seened); //
        }
    }
    return source;
}
