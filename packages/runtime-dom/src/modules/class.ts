//更新class属性
export function patchClass(el, value) {
    if (value === null) {
        el.removeAttribute("class"); //没有新值，则移除class属性
    } else {
        el.className = value; //有新值，则更新class属性
    }
}
