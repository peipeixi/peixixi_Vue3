import { isObject } from "@myvue/shared";
import { reactive } from "./reactive";
import { activeEffect, trackEffect, triggerEffect } from "./effect";
import { createDep } from "./reactiveEffect";
import { ReactiveFlags } from "./constants";

/**
 * 将基本类型或者对象转成响应式对象
 * @param target 要转成响应式的目标
 * @returns
 */
export function ref(target) {
    return createRef(target);
}

function createRef(target) {
    return new RefImpl(target);
}

//ref响应式对象的类
class RefImpl {
    public __v_isRef = true; //ref标识
    private _value; //当前ref的值
    public dep; //收集对应的effect依赖关系

    constructor(public rawValue) {
        if (isObject(rawValue)) {
            //对象调用reactive的响应式方式
            this._value = reactive(rawValue);
        }
    }

    //获取响应式对象的值，并进行依赖收集
    get value() {
        trackRefValue(this);
        return this._value;
    }

    //设置响应式对象的值，并派发更新
    set value(value) {
        if (this.rawValue !== value) {
            this.rawValue = value;
            this._value = value;
            triggerRefValue(this);
        }
    }
}

//依赖收集
function trackRefValue(ref) {
    if (activeEffect) {
        trackEffect((ref.dep = ref.dep || createDep(() => (ref.dep = undefined), undefined)), activeEffect);
        console.log(ref.dep);
    }
}

//派发更新
function triggerRefValue(ref) {
    const dep = ref.dep;
    if (dep) {
        triggerEffect(ref.dep);
    }
}

//判断对象是不是一个ref对象
export function isRef(value) {
    return value && value[ReactiveFlags.IS_REF];
}

class ObjectRefImpl {
    public __v_isRef = true;
    constructor(public _object, public _key) {}

    get value() {
        const val = this._object[this._key];
        return val;
    }

    set value(value) {
        this._object[this._key] = value;
    }
}

/**
 * 将reactive对象中的某个key转成ref对象
 * @param object reactive对象
 * @param key 对象的key
 */
export function toRef(object, key) {
    if (isRef(object)) {
        //本身是ref直接返回
        return object;
    } else if (isObject(object) && arguments.length > 1) {
        const val = object[key];
        if (val) {
            //对象中有该key,值为ref直接返回，不是则创建ObjectRefImpl对象并返回
            return isRef(val) ? val : new ObjectRefImpl(object, key);
        }
    } else {
        return ref(object); //普通数据返回ref
    }
}

/**
 * 将reactive对象所有的属性都转成ref对象
 * @param object reactive对象
 * @returns
 */
export function toRefs(object) {
    const res = {};
    for (let key in object) {
        res[key] = toRef(object, key);
    }
    return res;
}

/**
 * 对ref对象进行代理，当访问ref时可以不用加上.value
 * @param object
 * @returns
 */
export function proxyRefs(object) {
    return new Proxy(object, {
        get(target, key, receiver) {
            const res = Reflect.get(target, key, receiver);
            return isRef(res) ? res.value : res; //res是ref对象，取其value属性，不是则直接取
        },
        set(target, key, value, receiver) {
            const oldValue = target[key];
            if (oldValue !== value) {
                if (isRef(oldValue)) {
                    oldValue.value = value; //该属性原值是ref，设置其value属性的值
                    return true;
                }
                return Reflect.set(target, key, value, receiver);
            }
        },
    });
}
