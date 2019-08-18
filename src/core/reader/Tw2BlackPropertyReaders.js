import {vec2, vec3, vec4, mat4, store} from "../../global";
import {ErrBinaryObjectTypeNotFound, ErrBinaryReaderReadError} from "../Tw2Error";

/**
 * Internal handler for modifying ccp paths and strings
 * @param {String} path
 * @returns {String}
 */
function onString(path)
{
    // Because there are two sources for "res:" now we need to replace
    // any references from the eve cdn with a new res path mapping
    if (path.indexOf("res:") === 0)
    {
        path = "cdn:" + path.substring(4);
    }

    let ext = "";
    const dot = path.lastIndexOf(".");
    if (dot !== -1) ext = path.substr(dot + 1).toLowerCase();

    switch (ext)
    {
        case "dds":
        case "png":
            // TODO: Remove the need to do this in Tw2TextureRes
            // Will need to provide all quality versions of these files in the cdn even if they
            // don't exist as ccpwgl will have no idea if they exist or not, and so we'd get
            // errors when changing texture qualities in the ccpwgl_int.device
            path = path.replace("_lowdetail", "");       // Shouldn't exist
            path = path.replace("_mediumdetail", "");    // Shouldn't exist
            path = path.replace(ext, `0.${ext}`);
            break;

        case "gr2":
            // TODO: Add support for these files
            // Temporarily use ccpwgl resources (this won't always work but will do for now)
            path = path.replace(ext, "wbg").replace("cdn:", "res:");
            break;

        case "red":
            // TODO: Handle red files
            // There may still be legit .red files some of which we won't be able to read
            // (Some are in .black format so we'll just rename for now...)
            path = path.replace(ext, "black");
            break;

        case "sm_hi":
        case "sm_lo":
            path = path.replace(ext, "fx");
            break;

        case "sm_depth":
            // TODO: Add support for depth shaders
            path = "";
            break;
    }

    return path;
}

/**
 * Reads objects
 * @param {Tw2BlackBinaryReader} reader
 * @param {undefined|Number} [id]
 * @returns {*|Object} out
 */
export function object(reader, id)
{
    const
        context = reader.context,
        givenId = id !== undefined,
        debugEnabled = store.classes.constructor.DEBUG_ENABLED;

    if (!givenId)
    {
        id = reader.ReadU32();

        if (id === 0)
        {
            return null;
        }
        else if (reader.references.has(id))
        {
            return reader.references.get(id);
        }
    }

    const
        objectReader = reader.ReadBinaryReader(reader.ReadU32()),
        type = objectReader.ReadStringU16(),
        result = context.ConstructType(type);

    if (!givenId)
    {
        reader.references.set(id, result);
    }

    if (!store.blacks.Has(type))
    {
        throw new ErrBinaryObjectTypeNotFound({type});
    }

    let properties = store.blacks.Get(type);

    while (!objectReader.AtEnd())
    {
        let propertyName = objectReader.ReadStringU16();

        if (properties.has(propertyName))
        {
            if (!(propertyName in result) && debugEnabled)
            {
                console.log(`'${type}' missing property: '${propertyName}'`);
            }

            try
            {
                result[propertyName] = properties.get(propertyName)(objectReader);
            }
            catch (err)
            {
                if (debugEnabled)
                {
                    console.dir(result);
                }

                throw new ErrBinaryReaderReadError({readError: `${propertyName} > ` + err.message});
            }
        }
        else
        {
            if (debugEnabled)
            {
                console.dir(result);
            }

            throw new ErrBinaryReaderReadError({readError: `Unknown property "${propertyName}" for "${type}"`});
        }
    }

    objectReader.ExpectEnd("object did not read to end");

    if ("Initialize" in result)
    {
        result.Initialize();
    }

    return result;
}

/**
 * Reads a plain object
 * @param {Tw2BlackBinaryReader} reader
 * @returns {Object} out
 */
export function plain(reader)
{
    return object(reader, null);
}

/**
 * Reads an array
 * @param {Tw2BlackBinaryReader} reader
 * @param {Array} [out=[]]
 * @returns {Array} out
 */
export function array(reader)
{
    const
        result = [],
        count = reader.ReadU32();

    for (let i = 0; i < count; i++)
    {
        result[i] = object(reader);
    }
    return result;
}

/**
 * Reads a boolean
 * @param {Tw2BlackBinaryReader} reader
 * @returns {Boolean}
 */
export function boolean(reader)
{
    return reader.ReadU8() !== 0;
}

/**
 * Reads a string
 * @param {Tw2BlackBinaryReader} reader
 * @returns {*}
 */
export function string(reader)
{
    return onString(reader.ReadStringU16());
}

export function enums(reader)
{
    const value = reader.ReadStringU16();
    const entry = value.split(",");
    const out = {};
    for (let i = 0; i < entry.length; i++)
    {
        const split = entry[i].split("=");
        out[split[0]] = Number(split[1]);
    }
    return out;
}

/**
 * Reads a path
 * @param {Tw2BlackBinaryReader} reader
 * @returns {String}
 */
export function path(reader)
{
    return onString(reader.ReadStringU16());
}


/**
 * Reads a float
 * @param {Tw2BlackBinaryReader} reader
 * @returns {Number}
 */
export function float(reader)
{
    return reader.ReadF32();
}

/**
 * Reads a ushort
 * @param {Tw2BlackBinaryReader} reader
 * @returns {Number}
 */
export function ushort(reader)
{
    return reader.ReadU16();
}

/**
 * Reads a uint
 * @param {Tw2BlackBinaryReader} reader
 * @returns {Number}
 */
export function uint(reader)
{
    return reader.ReadU32();
}

/**
 * Reads a byte
 * @param {Tw2BlackBinaryReader} reader
 * @returns {Number}
 */
export function byte(reader)
{
    return reader.ReadU8();
}

/**
 * Reads a vector2
 * @param {Tw2BlackBinaryReader} reader
 * @returns {vec2}
 */
export function vector2(reader)
{
    return vec2.fromValues(reader.ReadF32(), reader.ReadF32());
}

/**
 * Reads a vector3
 * @param {Tw2BlackBinaryReader} reader
 * @param {vec3|TypedArray} [out]
 * @returns {Float32Array} out
 */
export function vector3(reader)
{
    return vec3.fromValues(reader.ReadF32(), reader.ReadF32(), reader.ReadF32());
}

/**
 * Reads a color
 * @param {Tw2BlackBinaryReader} reader
 * @returns {vec4} out
 */
export function color(reader)
{
    return vec4.fromValues(reader.ReadF32(), reader.ReadF32(), reader.ReadF32(), reader.ReadF32());
}

/**
 * Reads a vector4
 * @param {Tw2BlackBinaryReader} reader
 * @param {vec4|TypedArray} [out]
 * @returns {vec4} out
 */
export function vector4(reader, out = vec4.create())
{
    return vec4.fromValues(reader.ReadF32(), reader.ReadF32(), reader.ReadF32(), reader.ReadF32());
}

/**
 * Reads a matrix with 16 elements
 * @param {Tw2BlackBinaryReader} reader
 * @returns {mat4} out
 */
export function matrix(reader)
{
    return mat4.fromValues(
        reader.ReadF32(), reader.ReadF32(), reader.ReadF32(), reader.ReadF32(),
        reader.ReadF32(), reader.ReadF32(), reader.ReadF32(), reader.ReadF32(),
        reader.ReadF32(), reader.ReadF32(), reader.ReadF32(), reader.ReadF32(),
        reader.ReadF32(), reader.ReadF32(), reader.ReadF32(), reader.ReadF32()
    );
}

/**
 * Reads an index buffer
 * @param {Tw2BlackBinaryReader} reader
 * @returns {Uint32Array}
 */
export function indexBuffer(reader)
{
    let count = reader.ReadU32();
    let byteSize = reader.ReadU16();

    if (byteSize === 4)
    {
        return reader.ReadU32Array(count);
    }
    else
    {
        throw "unsupported for now";
    }
}

/**
 * Reads a struct
 * @param {*} struct
 * @returns {Function}
 */
export function struct(struct)
{
    return function(reader)
    {
        return struct.blackStruct(reader);
    };
}

/**
 * Reads a struct list
 * @param {*} struct
 * @returns {Function}
 */
export function structList(struct)
{
    return function(reader)
    {
        let
            count = reader.ReadU32(),
            byteSize = reader.ReadU16(),
            result = [];

        for (let i = 0; i < count; i++)
        {
            const structReader = reader.ReadBinaryReader(byteSize);
            result[i] = struct.blackStruct(structReader);
            structReader.ExpectEnd("struct read to end");
        }

        return result;
    };
}

export function plainFromArray(key)
{
    return function(reader)
    {
        const
            arr = array(reader),
            result = {};

        for (let i = 0; i < arr.length; i++)
        {
            result[arr[i].key] = arr[i];
        }

        return result;
    };
}
