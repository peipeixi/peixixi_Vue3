//更新事件绑定
export function patchEvent(el, key, nextValue) {
    //获取事件缓存
    const invokers = el._vei || (el._vei = {});
    //获取事件名称
    const eventName = key.slice(2).toLowerCase();
    //是否存在该事件的绑定
    const prevInvoker = invokers[key];
    if (nextValue) {
        //有新的绑定回调函数
        if (!prevInvoker) {
            //不存在则创建绑定
            invokers[key] = createInvoker(nextValue);
            //绑定事件
            el.addEventListener(eventName, invokers[key]);
            return;
        }
        //存在则更新绑定
        prevInvoker.value = nextValue;
    } else {
        if (prevInvoker) {
            //没有新的事件回调函数则移除绑定
            el.removeEventListener(eventName, prevInvoker);
            //删除缓存
            invokers[key] = undefined;
        }
    }
}

/**
 *  创建事件绑定,创建invoker函数，并将事件回调函数缓存到invoker.value中,
 *  执行invoker函数时，会执行invoker.value函数，即事件回调函数。这样可以方便的更新事件回调函数，而不用反复绑定和解绑事件
 * @param value 事件回调函数
 * @returns
 */
function createInvoker(value) {
    const invoker = (e) => {
        invoker.value(e);
    };
    invoker.value = value;
    return invoker;
}
