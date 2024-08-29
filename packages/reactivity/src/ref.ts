import { isObject } from "@myvue/shared";
import { reactive } from "./reactive";
import { activeEffect, trackEffect, triggerEffect } from "./effect";
import { createDep } from "./reactiveEffect";

export function ref(target) {
    return createRef(target);
}

function createRef(target) {
    return new RefImpl(target);
}

class RefImpl {
    public __v_isRef = true; //ref标识
    private _value; //当前ref的值
    public dep; //收集对应的effect依赖关系

    constructor(public target) {
        if (isObject(target)) {
            //对象调用reactive的响应式方式
            reactive(target);
        }
    }

    get value() {
        trackRefValue(this);
        return this._value;
    }

    set value(value) {
        if (this._value !== value) {
            this._value = value;
            triggerRefValue(this);
        }
    }
}

function trackRefValue(ref) {
    if (activeEffect) {
        trackEffect((ref.dep = ref.dep || createDep(() => (ref.dep = undefined), undefined)), activeEffect);
        console.log(ref.dep);
    }
}

function triggerRefValue(ref) {
    const dep = ref.dep;
    if (dep) {
        triggerEffect(ref.dep);
    }
}
