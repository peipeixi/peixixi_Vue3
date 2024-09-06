//比对并更新style
export function patchStyle(el, prevValue, nextValue) {
    //先设置新值
    if (nextValue) {
        for (let key in nextValue) {
            el.style[key] = nextValue[key];
        }
    }
    //再删除旧值
    if (prevValue) {
        for (let key in prevValue) {
            if (nextValue && !nextValue[key]) {
                el.style[key] = null;
            }
        }
    }
}
