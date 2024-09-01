import { isObject } from "@myvue/shared";
import { ReactiveFlags } from "./constants";
import { mutableHandler } from "./baseHanddle";

//缓存代理对象，防止一个对象被重复代理
const reactiveProxy = new WeakMap();
function createReactiveObject(target) {
    // 判断是否是对象
    if (!isObject(target)) {
        return target;
    }
    // 判断是否已经被代理
    if (target[ReactiveFlags.IS_REACTIVE]) {
        return target;
    }

    //判断对象是否重复代理
    const existingProxy = reactiveProxy.get(target);
    if (existingProxy) {
        return existingProxy;
    }
    // 创建代理对象
    const proxy = new Proxy(target, mutableHandler);
    reactiveProxy.set(target, proxy); //缓存代理对象
    return proxy;
}

/**
 * 创建代理对象
 * @param target 目标对象
 * @returns 返回一个代理对象
 */
export function reactive(target) {
    return createReactiveObject(target);
}

export function toReactive(value) {
    return isObject(value) ? reactive(value) : value;
}

export function isReactive(value) {
    return !!(value && value[ReactiveFlags.IS_REACTIVE]);
}
