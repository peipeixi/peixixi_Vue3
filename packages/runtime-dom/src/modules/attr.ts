//更新一般性属性
export function patchAttr(el, key, value) {
    if (value == null) {
        el.removeAttribute(key);
    } else {
        el.setAttribute(key, value);
    }
}
