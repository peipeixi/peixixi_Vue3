import { TriggerOpTypes } from "vue";
import { activeEffect, trackEffect, triggerEffect } from "./effect";
import { isArray, isIntegerKey, isMap, isSymbol } from "@myvue/shared";

export function createDep(cleanUp, key) {
    const dep = new Map() as any;
    dep.cleanUp = cleanUp;
    dep.name = key; //标记该dep对应的key
    return dep;
}

const targetMap = new WeakMap(); //保存依赖关系
/**
 * 依赖收集。
 * vue3.4收集的数据结构：Map<target, Map<key, (deps)Map<effect,effectId>>>
 * vue3.4之前收集的数据结构：Map<target, Map<key, Set<effect>>>
 * @param target 目标对象
 * @param key 目标对象的key
 */
export function track(target, key) {
    if (!activeEffect) {
        return;
    }

    //有activeEffect才收集依赖
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }

    //属性对应的map: Map<key, (dep)Map<effect,effectId>>
    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = createDep(() => depsMap.delete(key), key))); //传入的匿名函数为cleanUp函数，在属性key清理时调用
    }

    //保存activeEffect到dep中，key值的改变会触发effect重新执行
    trackEffect(dep, activeEffect);
    console.log(targetMap);
}

/**
 * 触发更新，找到key对应的dep，执行dep中的effect
 * @param target 目标对象
 * @param type 目标对象被更新的方式
 * @param key 目标对象被更新的key
 * @param newValue key的新值
 * @param oldValue key的旧值
 * @returns
 */
export function trigger(target, type, key, newValue, oldValue) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
        return;
    }
    let deps = []; //收集依赖

    if (type === TriggerOpTypes.CLEAR) {
        //响应式对象被清空
        deps = [...depsMap.values()];
    } else if (isArray(target) && key === "length") {
        //数组长度被修改，触发数组中所有索引大于等于新长度的依赖
        const newLength = Number(newValue);
        depsMap.forEach((dep, key) => {
            if (key === "length" || (!isSymbol(key) && key >= newLength)) {
                deps.push(dep);
            }
        });
    } else {
        //触发key对应的依赖
        if (key !== undefined) {
            deps.push(depsMap.get(key));
        }
        switch (type) {
            case TriggerOpTypes.ADD:
                if (!isArray(target)) {
                    //对象新增属性，触发所有key的依赖deps.push(depsMap.get(ITERATE_KEY))
                    deps.push(depsMap.get(Symbol("")));
                    if (isMap(target)) {
                        deps.push(depsMap.get(Symbol("")));
                    }
                } else if (isIntegerKey(key)) {
                    //数组新增元素
                    deps.push(depsMap.get("length")); //触发数组长度依赖
                }
                break;
            case TriggerOpTypes.DELETE:
                if (!isArray(target)) {
                    //对象删除属性，触发所有key的依赖
                    deps.push(depsMap.get(Symbol("")));
                }
                break;
            case TriggerOpTypes.SET:
                if (isMap(target)) {
                    deps.push(depsMap.get(Symbol("")));
                }
                break;
        }
        for (const dep of deps) {
            if (dep) {
                triggerEffect(dep);
            }
        }
    }
}
