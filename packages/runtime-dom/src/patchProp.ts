import { patchClass } from "./modules/class";
import { patchStyle } from "./modules/style";
import { patchEvent } from "./modules/event";
import { patchAttr } from "./modules/attr";

//对节点的属性的操作：style,class,event,attr
export function patchProp(el, key, prevValue, nextValue) {
    //如果属性是style
    if (key === "style") {
        patchStyle(el, prevValue, nextValue);
    } else if (key === "class") {
        //
        patchClass(el, nextValue);
    } else if (/^on[^a-z]/.test(key)) {
        //如果属性是事件
        patchEvent(el, key, nextValue);
    } else {
        //一般属性
        patchAttr(el, key, nextValue);
    }
}
