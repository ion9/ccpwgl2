const toString = Object.prototype.toString;

/**
 * Checks if a value is an array
 * @param {*} a
 * @returns {Boolean}
 */
export const isArray = Array.isArray;

/**
 * Checks if a value is an array or a typed array
 * @param {*} a
 * @returns {Boolean}
 */
export function isArrayLike(a)
{
    return a ? isArray(a) || isTyped(a) : false;
}

/**
 * Checks if a value is a boolean
 * @param {*} a
 * @returns {Boolean}
 */
export function isBoolean(a)
{
    return isTag(a, "[object Boolean]");
}

/**
 * Checks if a value is an html canvas element
 * @param {*} a
 * @returns {Boolean}
 */
export function isCanvas(a)
{
    return !!(a && a instanceof HTMLCanvasElement);
}

/**
 * Checks if a value is a descriptor
 * @author jay phelps
 * @param {*} a
 * @returns {Boolean}
 */
export function isDescriptor(a)
{
    if (!a || !a.hasOwnProperty)
    {
        return false;
    }

    const keys = ["value", "initializer", "get", "set"];

    for (let i = 0, l = keys.length; i < l; i++)
    {
        if (a.hasOwnProperty(keys[i]))
        {
            return true;
        }
    }

    return false;
}

/**
 * Checks if a value is a valid sof DNA string
 * @param {*} a
 */
export function isDNA(a)
{
    return isString(a) && a.match(/(\w|\d|[-_])+:(\w|\d|[-_])+:(\w|\d|[-_])+/);
}

/**
 * Checks if a value is an error
 * @param {*} a
 * @returns {Boolean}
 */
export function isError(a)
{
    return !!(a && a instanceof Error || a.constructor.category === "error");
}

/**
 * Checks if a value is a number
 * @param {*} a
 * @returns {Boolean}
 */
export function isNumber(a)
{
    return isTag(a, "[object Number]");
}

/**
 * Checks if a value is a function
 * @param {*} a
 * @returns {Boolean}
 */
export function isFunction(a)
{
    return typeof a === "function";
}

/**
 * Checks if a value is null or undefined
 * @param {*} a
 * @returns {Boolean}
 */
export function isNoU(a)
{
    return a == null;
}

/**
 * Checks if a value is null
 * @param {*} a
 * @returns {Boolean}
 */
export function isNull(a)
{
    return a === null;
}

/**
 * Checks if a value is an object and not null
 * @param {*} a
 * @returns {Boolean}
 */
export function isObject(a)
{
    const type = typeof a;
    return a !== null && (type === "object" || type === "function");
}

/**
 * Checks if a value has the type object, and is not null
 * @param {*} a
 * @returns {Boolean}
 */
export function isObjectLike(a)
{
    return a !== null && typeof a === "object";
}

/**
 * Is Object object
 * @param {*} a
 * @returns {Boolean}
 */
export function isObjectObject(a)
{
    return a !== null && isTag(a, "[object Object]");
}

/**
 * Checks if a value is a plain object
 * @author lodash
 * @param {*} a
 * @returns {Boolean}
 */
export function isPlain(a)
{
    if (!isObject(a) || !isObjectObject)
    {
        return false;
    }

    if (Object.getPrototypeOf(a) === null)
    {
        return true;
    }

    let proto = a;

    while (Object.getPrototypeOf(proto) !== null)
    {
        proto = Object.getPrototypeOf(proto);
    }

    return Object.getPrototypeOf(a) === proto;
}

/**
 * Checks if a value is a primary type
 * @param {*} a
 * @returns {Boolean}
 */
export function isPrimary(a)
{
    return isBoolean(a) || isNumber(a) || isString(a);
}

/**
 * Checks if a value is a promise
 * @param {*} a
 * @returns {Boolean}
 */
export function isPromise(a)
{
    return isObject(a) && isFunction(a.then);
}

/**
 * Checks if a value is a string
 * @param {*} a
 * @returns {Boolean}
 */
export function isString(a)
{
    return isTag(a, "[object String]");
}

/**
 * Checks if a value is a symbol
 * @param {*} a
 * @returns {Boolean}
 */
export function isSymbol(a)
{
    return typeof a === "symbol" || isTag(a, "[object Symbol]");
}

/**
 * Checks if a class is extended from another
 * @param {*} Constructor
 * @param {*} SuperConstructor
 * @returns {boolean}
 */
export function isSubclassOf(Constructor, SuperConstructor)
{
    if (!isFunction(Constructor)) return false;

    while (isFunction(Constructor))
    {
        if (Constructor === SuperConstructor) return true;
        Constructor = Reflect.getPrototypeOf(Constructor);
    }

    return false;
}

/**
 * Checks if a value has a given tag
 * @param {*} a
 * @param {String} tag
 * @returns {Boolean}
 */
export function isTag(a, tag)
{
    return toString.call(a) === tag;
}

/**
 * Checks if a value is a typed array
 * @param {*} a
 * @returns {Boolean}
 */
export function isTyped(a)
{
    return a ? !!(a.buffer instanceof ArrayBuffer && a.BYTES_PER_ELEMENT) : false;
}

/**
 * Checks if a value is undefined
 * @param {*} a
 * @returns {Boolean}
 */
export function isUndefined(a)
{
    return a === undefined;
}

/**
 * Checks if a value is arraylike and only contains numbers
 * @param {*} a
 * @returns {Boolean}
 */
export function isVector(a)
{
    if (a)
    {
        if (isTyped(a))
        {
            return true;
        }

        if (isArray(a))
        {
            for (let i = 0; i < a.length; i++)
            {
                if (!isNumber(a[i])) return false;
            }
            return true;
        }
    }
    return false;
}

/**
 * Checks if a value is a vector of length 2
 * @param {*} a
 * @returns {boolean}
 */
export function isVector2(a)
{
    return isVector(a) ? a.length === 2 : false;
}

/**
 * Checks if a value is a vector of length 3
 * @param {*} a
 * @returns {boolean}
 */
export function isVector3(a)
{
    return isVector(a) ? a.length === 3 : false;
}

/**
 * Checks if a value is a vector of length 4
 * @param {*} a
 * @returns {boolean}
 */
export function isVector4(a)
{
    return isVector(a) ? a.length === 4 : false;
}

/**
 * Checks if a value is a vector of length 9
 * @param {*} a
 * @returns {boolean}
 */
export function isMatrix3(a)
{
    return isVector(a) ? a.length === 9 : false;
}

/**
 * Checks if a value is a vector of length 16
 * @param {*} a
 * @returns {boolean}
 */
export function isMatrix4(a)
{
    return isVector(a) ? a.length === 16 : false;
}