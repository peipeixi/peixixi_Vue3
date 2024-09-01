/**
 * 计算属性
 */

import { isFunction } from "@myvue/shared";
import { ReactiveEffect } from "./effect";
import { trackRefValue, triggerRefValue } from "./ref";

export function computed(getterOrOptions) {
    let getter, setter;
    if (isFunction(getterOrOptions)) {
        getter = getterOrOptions;
        setter = () => {};
    } else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }
    return new ComputedRefImpl(getter, setter);
}

class ComputedRefImpl {
    public _value;
    public effect;
    public dep;

    constructor(getter, public setter) {
        this.effect = new ReactiveEffect(
            () => getter(this._value),
            () => {
                console.log("computed effect scheduler exe....");
                // 如果计算属性依赖的响应式数据变化了，那么计算属性就会重新计算（
                //      1、先让依赖响应式数据的计算属性中的此处this.effect的scheduler执行。
                //      2、在此处的scheduler中触发有使用了该计算属性的effect的调度器scheduler执行
                //      3、在调度器scheduler中执行了此处的this.effect.run()，即这里的getter(this._value)执行来重新计算计算属性的值
                //）
                triggerRefValue(this);
            }
        );
    }

    get value() {
        if (this.effect.dirty) {
            //计算属性对应的effect中的dirty为true，表示缓存的值已经是脏值，需要重新计算
            this._value = this.effect.run(); // 重新计算计算属性的值
            trackRefValue(this); //计算属性的值更新后，需要重新收集使用了该计算属性的effect与计算属性的依赖关系
        }
        return this._value;
    }

    set value(newValue) {
        this.setter(newValue);
    }
}
