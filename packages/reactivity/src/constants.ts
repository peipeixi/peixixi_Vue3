export const enum ReactiveFlags {
    IS_REACTIVE = "__v_isReactive",
    IS_REF = "__v_isRef",
    IS_READONLY = "__v_isReadonly",
    RAW = "__v_raw",
}

//effect的脏值标记
export const enum DirtyLevels {
    Dirty = 4, //4表示是脏值，需要重新取值
    NotDirty = 0, //0表示不是脏值，不需要重新取值
}

//响应式对象属性更改的方式：增加、删除、修改，清除
export enum TriggerOpTypes {
    SET = "set",
    ADD = "add",
    DELETE = "delete",
    CLEAR = "clear",
}
