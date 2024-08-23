import { ReactiveFlags } from "./constants";
import { reactiveEffect } from "./effect";

export const mutableHandler: ProxyHandler<any> = {
    get(target, key, receiver) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            //判断是否是代理对象，未被代理过的对象读取该key时不会进入get
            return true;
        }

        //依赖收集，当读取属性时，将当前effect收集到该属性的依赖中，将effect和key一一对应
        console.log(key, reactiveEffect);

        /**
         *  这里使用Reflect的原因是？receiver用于调用目标对象的方法时指定方法中 this 的值从而使this指向的属性也能通过代理代理对象来访问
            举例：
            const obj = {
                name: "张三",
                get fullname() {
                    return this.name + "haha";
                },
            };
            const proxy = new Proxy(obj, {
                get(target,key,receiver){
                    //return target[key]
                    return Reflect.get(target,key,receiver)
                }
            })
            console.log(proxy.fullname);
            这个例子中当通过proxy访问fullname时，
            get方法如果是return target[key]，fullname中的this指向的是obj，而不是proxy,读取name属性就没有通过代理对象导致更改了name属性的值没有促发更新视图
            get方法如果是return Reflect.get(target,key,receiver)，fullname中的this指向的是receiver，读取name属性也是通过代理对象
        */
        return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
        return Reflect.set(target, key, value, receiver);
    },
};
