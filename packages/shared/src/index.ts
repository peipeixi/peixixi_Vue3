export const isObject = (value) => value !== null && typeof value === "object"; // 判断是否是对象

export const isFunction = (value) => typeof value === "function"; // 判断是否是函数

export const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key); // 判断对象中是否有某个属性

export const isArray = Array.isArray; // 判断是否是数组

export const isString = (val: unknown): val is string => typeof val === "string";

export const isSymbol = (val: unknown): val is symbol => typeof val === "symbol"; // 判断是否是Symbol

// 判断是否是整数
export const isIntegerKey = (key: unknown) =>
    isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;

export const toTypeString = (value: unknown): string => Object.prototype.toString.call(value); // 获取字符串形式的数据类型

export function isMap(value: unknown): value is Map<any, any> {
    return toTypeString(value) === "[object Map]";
}
