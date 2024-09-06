//对元素的增删改查操作
export const nodeOps = {
    insert(el, parent, anchor) {
        //插入元素
        parent.insertBefore(el, anchor || null);
    },
    remove(el) {
        //删除元素
        const parent = el.parentNode;
        if (parent) {
            parent.removeChild(el);
        }
    },
    createElement(tagName) {
        //创建元素
        return document.createElement(tagName);
    },
    createText(text) {
        //创建文本
        return document.createTextNode(text);
    },
    setText(el, text) {
        //设置文本
        el.nodeValue = text;
    },
    setElementText(el, text) {
        //设置元素文本
        el.textContent = text;
    },
    parentNode(el) {
        //获取父元素
        return el.parentNode;
    },
    nextSibling(el) {
        //获取下一个兄弟元素
        return el.nextSibling;
    },
    querySelector(sel) {
        //查询元素
        return document.querySelector(sel);
    },
};
