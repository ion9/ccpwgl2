import {num} from "./num";
import {vec3} from "./vec3";

/**
 * 3D Box
 * @typedef {Float32Array} box3
 */

export const box3 = { bounds: {} };

/**
 * Gets a subarray of a box3's min vector
 * @property {box3} a
 * @returns {TypedArray}
 */
box3.$min = function(a)
{
    return a.subarray(0, 3);
};

/**
 * Gets a subarray of a box3's max vector
 * @property {box3} a
 * @returns {TypedArray}
 */
box3.$max = function(a)
{
    return a.subarray(3, 6);
};

/**
 * Adds a point to a box3
 *
 * @param {box3} out   - receiving box3
 * @param {box3} a     - source box3
 * @param {vec3} p     - point to add
 * @returns {box3} out - receiving box3
 */
box3.addPoint = function (out, a, p)
{
    out[0] = Math.min(a[0], p[0]);
    out[1] = Math.min(a[1], p[1]);
    out[2] = Math.min(a[2], p[2]);
    out[3] = Math.max(a[3], p[0]);
    out[4] = Math.max(a[4], p[1]);
    out[5] = Math.max(a[5], p[2]);
    return out;
};

/**
 * Sets a box3 from a box3 with added points
 *
 * @param {box3} out              - receiving box3
 * @param {box3} a                - source box3
 * @param {Array.<number>} points - points to add
 * @returns {box3} out            - receiving box3
 */
box3.addPoints = function (out, a, points)
{
    let minX = a[0],
        minY = a[1],
        minZ = a[2],
        maxX = a[3],
        maxY = a[4],
        maxZ = a[5];

    for (let i = 0; i < points.length; i++)
    {
        minX = Math.min(minX, points[i][0]);
        minY = Math.min(minY, points[i][1]);
        minZ = Math.min(minZ, points[i][2]);
        maxX = Math.max(maxX, points[i][0]);
        maxY = Math.max(maxY, points[i][1]);
        maxZ = Math.max(maxZ, points[i][2]);
    }

    out[0] = minX;
    out[1] = minY;
    out[2] = minZ;
    out[3] = maxX;
    out[4] = maxY;
    out[5] = maxZ;
    return out;
};

/**
 * Clones a box3
 *
 * @param {box3} a - source box3
 * @returns {box3} - a new box3
 */
box3.clone = function (a)
{
    let out = new Float32Array(6);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    return out;
};

/**
 * Checks if a box3 contains another box3
 *
 * @param {box3} a    - source box3
 * @param {box3} b    - box3 to compare
 * @returns {boolean} - true if the source box3 contains the second
 */
box3.contains = function (a, b)
{
    return (
        (a[0] <= b[0]) && (b[3] <= a[3]) &&
        (a[1] <= b[1]) && (b[4] <= a[4]) &&
        (a[2] <= b[2]) && (b[5] <= a[5])
    );
};

/**
 * Checks if the box3 contains min and max bounds
 *
 * @param {box3} a    - source box3
 * @param {vec3} min  - min bounds
 * @param {vec3} max  - max bounds
 * @returns {boolean} - true if the source box3 contains the bounds
 */
box3.containsBounds = function (a, min, max)
{
    return (
        (a[0] <= min[0]) && (max[0] <= a[3]) &&
        (a[1] <= min[1]) && (max[1] <= a[4]) &&
        (a[2] <= min[2]) && (max[2] <= a[5])
    );
};

/**
 * Checks if a box3 contains a point
 *
 * @param {box3} a    - source box3
 * @param {vec3} p    - point to compare
 * @returns {boolean} - true if the source box contains the point
 */
box3.containsPoint = function (a, p)
{
    return !(
        p[0] < a[0] || p[0] > a[3] ||
        p[1] < a[1] || p[1] > a[4] ||
        p[2] < a[2] || p[2] > a[5]
    );
};

/**
 * Checks if a box3 contains a point's values
 *
 * @param {box3} a    - source box3
 * @param {Number} px - point X
 * @param {Number} py - point Y
 * @param {Number} pz - point Z
 * @returns {boolean} - true if the source box3 contains the point
 */
box3.containsValue = function (a, px, py, pz)
{
    return !(
        px < a[0] || px > a[3] ||
        py < a[1] || py > a[4] ||
        pz < a[2] || pz > a[5]
    );
};

/**
 * Copies the values from one box3 into another
 *
 * @param {box3} out   - receiving box3
 * @param {box3} a     - source box3
 * @returns {box3} out - receiving box3
 */
box3.copy = function (out, a)
{
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    return out;
};

/**
 * Copies the min vector of one box3 to another
 *
 * @param {box3} out
 * @param {box3} a
 * @returns {box3}
 */
box3.copyMin = vec3.copy;

/**
 * Copies the max vector of one box3 to another
 *
 * @param {box3} out
 * @param {box3} a
 * @returns {box3}
 */
box3.copyMax = function(out, a)
{
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
};

/**
 * Creates a box3
 *
 * @returns {box3} - The new box3
 */
box3.create = function ()
{
    let out = new Float32Array(6);
    out[0] = -Infinity;
    out[1] = -Infinity;
    out[2] = -Infinity;
    out[3] = Infinity;
    out[4] = Infinity;
    out[5] = Infinity;
    return out;
};

/**
 * Gets the distance from a box3 to a point
 *
 * @param {box3} a   - source box3
 * @param {vec3} p   - point
 * @returns {number} - distance between the source box3 and point
 */
box3.distanceToPoint = function (a, p)
{
    let x = Math.max(a[0], Math.min(a[3], p[0])) - p[0],
        y = Math.max(a[1], Math.min(a[4], p[1])) - p[1],
        z = Math.max(a[2], Math.min(a[5], p[2])) - p[2];

    return Math.sqrt(x * x + y * y + z * z);
};

/**
 * Gets the distance from a box3 to a point's values
 *
 * @param {box3} a    - source box3
 * @param {Number} px - point x
 * @param {Number} py - point y
 * @param {Number} pz - point z
 * @returns {number}  - distance between the source box3 and point
 */
box3.distanceToValues = function (a, px, py, pz)
{
    let x = Math.max(a[0], Math.min(a[3], px)) - px,
        y = Math.max(a[1], Math.min(a[4], py)) - py,
        z = Math.max(a[2], Math.min(a[5], pz)) - pz;

    return Math.sqrt(x * x + y * y + z * z);
};

/**
 * Empties a box3
 *
 * @param {box3} a - box3 to empty
 * @returns {box3} - the empty box3
 */
box3.empty = function (a)
{
    a[0] = +Infinity;
    a[1] = +Infinity;
    a[2] = +Infinity;
    a[3] = -Infinity;
    a[4] = -Infinity;
    a[5] = -Infinity;
    return a;
};

/**
 * Empties bounds
 *
 * @param {vec3} min - min bounds
 * @param {vec3} max - max bounds
 */
box3.bounds.empty = function (min, max)
{
    min[0] = +Infinity;
    min[1] = +Infinity;
    min[2] = +Infinity;
    max[0] = -Infinity;
    min[1] = -Infinity;
    min[2] = -Infinity;
};

/**
 * Checks two box3's for equality
 *
 * @param {box3} a    - box3 to compare
 * @param {box3} b    - box3 to compare
 * @returns {boolean} - true if box3s are equal
 */
box3.equals = function (a, b)
{
    let a0 = a[0],
        a1 = a[1],
        a2 = a[2],
        a3 = a[3],
        a4 = a[4],
        a5 = a[5];

    let b0 = b[0],
        b1 = b[1],
        b2 = b[2],
        b3 = b[3],
        b4 = b[4],
        b5 = b[5];

    return (
        Math.abs(a0 - b0) <= num.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
        Math.abs(a1 - b1) <= num.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
        Math.abs(a2 - b2) <= num.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
        Math.abs(a3 - b3) <= num.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
        Math.abs(a4 - b4) <= num.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
        Math.abs(a5 - b5) <= num.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5))
    );
};

/**
 * Checks a box3 and box3 components for equality
 *
 * @param {box3} a    - box3 to compare
 * @param {vec3} min  - min bounds to compare
 * @param {vec3} max  - max bounds to compare
 * @returns {boolean} - true if the box3 and bounds are equal
 */
box3.equalsBounds = function (a, min, max)
{
    let a0 = a[0],
        a1 = a[1],
        a2 = a[2],
        a3 = a[3],
        a4 = a[4],
        a5 = a[5];

    let b0 = min[0],
        b1 = min[1],
        b2 = min[2],
        b3 = max[0],
        b4 = max[1],
        b5 = max[2];

    return (
        Math.abs(a0 - b0) <= num.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
        Math.abs(a1 - b1) <= num.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
        Math.abs(a2 - b2) <= num.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
        Math.abs(a3 - b3) <= num.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
        Math.abs(a4 - b4) <= num.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
        Math.abs(a5 - b5) <= num.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5))
    );
};

/**
 * Checks for vec6 exact equality
 *
 * @param {box3} a    - box3 to compare
 * @param {box3} b    - box3 to compare
 * @returns {boolean} - true if both box3s are exactly equal
 */
box3.exactEquals = function (a, b)
{
    return (
        a[0] === b[0] && a[1] === b[1] && a[2] === b[2] &&
        a[3] === b[3] && a[4] === b[4] && a[5] === b[5]
    );
};

/**
 * Checks for exact equality between a box3 and components
 *
 * @param {box3} a    - box3 to compare
 * @param {vec3} min  - min bounds to compare
 * @param {vec3} max  - max bounds to compare
 * @returns {boolean} - true if the box3 and bounds are exactly equal
 */
box3.exactEqualsBounds = function (a, min, max)
{
    return (
        a[0] === min[0] && a[1] === min[1] && a[2] === min[2] &&
        a[3] === max[0] && a[4] === max[1] && a[5] === max[2]
    );
};

/**
 * Sets a box3 from the expansion of a box3 and a given scalar
 *
 * @param {box3} out   - receiving box3
 * @param {box3} a     - source box3
 * @param {number} s   - scalar to expand by
 * @returns {box3} out - receiving box3
 */
box3.expandScalar = function (out, a, s)
{
    out[0] = a[0] - s;
    out[1] = a[1] - s;
    out[2] = a[2] - s;
    out[3] = a[3] + s;
    out[4] = a[4] + s;
    out[5] = a[5] + s;
    return out;
};

/**
 * Sets a box3 from the expansion of a box3 and a vector's values
 *
 * @param {box3} out   - receiving box3
 * @param {box3} a     - source box3
 * @param {number} vx  - vector x
 * @param {number} vy  - vector y
 * @param {number} vz  - vector z
 * @returns {box3} out - receiving box3
 */
box3.expandValues = function (out, a, vx, vy, vz)
{
    out[0] = a[0] - vx;
    out[1] = a[1] - vy;
    out[2] = a[2] - vz;
    out[3] = a[3] + vx;
    out[4] = a[4] + vy;
    out[5] = a[5] + vz;
    return out;
};

/**
 * Expands a box3 by a vec3
 *
 * @param {box3} out   - receiving box3
 * @param {box3} a     - source box3
 * @param {vec3} v     - vector to expand by
 * @returns {box3} out - receiving box3
 */
box3.expandVec3 = function (out, a, v)
{
    out[0] = a[0] - v[0];
    out[1] = a[1] - v[1];
    out[2] = a[2] - v[2];
    out[3] = a[3] + v[0];
    out[4] = a[4] + v[1];
    out[5] = a[5] + v[2];
    return out;
};

/**
 * Sets a box3 from an array at an optional offset
 *
 * @param {box3} out         - receiving box3
 * @param {Array} arr        - source array
 * @param {number} [index=0] - optional array index
 * @returns {box3}           - receiving box3
 */
box3.fromArray = function (out, arr, index = 0)
{
    out[0] = arr[index];
    out[1] = arr[index + 1];
    out[2] = arr[index + 2];
    out[3] = arr[index + 3];
    out[4] = arr[index + 4];
    out[5] = arr[index + 5];
    return out;
};

/**
 * Sets a box3 from bounds
 *
 * @param {box3} out   - receiving box3
 * @param {vec3} min   - source min bounds
 * @param {vec3} max   - source max bounds
 * @returns {box3} out - receiving box3
 */
box3.fromBounds = function (out, min, max)
{
    out[0] = min[0];
    out[1] = min[1];
    out[2] = min[2];
    out[0] = max[0];
    out[1] = max[1];
    out[2] = max[2];
    return out;
};

/**
 * Sets a box3 from position and size
 *
 * @param {box3} out      - receiving box3
 * @param {vec3} position - source position
 * @param {vec3} size     - source size
 * @returns {box3} out    - receiving box3
 */
box3.fromPositionSize = function (out, position, size)
{
    out[0] = position[0] - size[0] * 0.5;
    out[1] = position[1] - size[1] * 0.5;
    out[2] = position[2] - size[2] * 0.5;
    out[3] = position[0] + size[0] * 0.5;
    out[4] = position[1] + size[1] * 0.5;
    out[5] = position[2] + size[2] * 0.5;
    return out;
};

/**
 * Sets a box3 from an array of points
 *
 * @param {box3} out            - receiving box3
 * @param {Array.<vec3>} points - array of points
 * @returns {box3} out          - receiving box3
 */
box3.fromPoints = function (out, points)
{
    out[0] = +Infinity;
    out[1] = +Infinity;
    out[2] = +Infinity;
    out[3] = -Infinity;
    out[4] = -Infinity;
    out[5] = -Infinity;

    for (let i = 0; i < points.length; i++)
    {
        out[0] = Math.min(out[0], points[i][0]);
        out[1] = Math.min(out[1], points[i][1]);
        out[2] = Math.min(out[2], points[i][2]);
        out[3] = Math.max(out[3], points[i][0]);
        out[4] = Math.max(out[4], points[i][1]);
        out[5] = Math.max(out[5], points[i][2]);
    }

    return out;
};

/**
 * Sets a box3 from a sphere's components
 *
 * @param {box3} out      - receiving box3
 * @param {vec3} position - position
 * @param {number} radius - radius
 * @returns {box3}        - receiving box3
 */
box3.fromPositionRadius = function (out, position, radius)
{
    out[0] = position[0] - radius;
    out[1] = position[1] - radius;
    out[2] = position[2] - radius;
    out[3] = position[0] + radius;
    out[4] = position[1] + radius;
    out[5] = position[2] + radius;
    return out;
};

/**
 * Sets a box3 from a Float32Array(4) sphere
 *
 * @param {box3} out   - receiving box3
 * @param {sph3} sphere - source sphere
 * @returns {box3} out - receiving box3
 */
box3.fromSph3 = function (out, sphere)
{
    out[0] = sphere[0] - sphere[3];
    out[1] = sphere[1] - sphere[3];
    out[2] = sphere[2] - sphere[3];
    out[3] = sphere[0] + sphere[3];
    out[4] = sphere[1] + sphere[3];
    out[5] = sphere[2] + sphere[3];
    return out;
};

/**
 * Sets a vec3 from a point clamped to a box3
 *
 * @param {vec3} out     - receiving vec3
 * @param {box3} a       - source box
 * @param {vec3} p       - the point to clamp
 * @returns {vec3} [out] - receiving vec3
 */
box3.getClampedPoint = function (out, a, p)
{
    out[0] = Math.max(a[0], Math.min(a[3], p[0]));
    out[1] = Math.max(a[1], Math.min(a[4], p[1]));
    out[2] = Math.max(a[2], Math.min(a[5], p[2]));
    return out;
};

/**
 * Sets a vec3 with the box3's max bounds
 *
 * @param {vec3} out     - receiving vec3
 * @param {box3} a          - source box
 * @returns {vec3} [out] - receiving vec3
 */
box3.getMax = function (out, a)
{
    out[0] = a[3];
    out[1] = a[4];
    out[2] = a[5];
    return out;
};

/**
 * Sets a vec3 with the box3's min bounds
 *
 * @param {vec3} out     - receiving vec3
 * @param {box3} a          - source box
 * @returns {vec3} [out] - receiving vec3
 */
box3.getMin = function (out, a)
{
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Sets a vec3 with a box3's size
 *
 * @param {vec3} out     - receiving vec3
 * @param {box3} a          - source box
 * @returns {vec3} [out] - receiving vec3
 */
box3.getSize = function (out, a)
{
    out[0] = a[3] - a[0];
    out[1] = a[4] - a[1];
    out[2] = a[5] - a[2];
    return out;
};

/**
 * Sets a vec3 with the box3's position
 *
 * @param {vec3} out     - receiving vec3
 * @param {box3} a          - source box
 * @returns {vec3} [out] - receiving vec3
 */
box3.getPosition = function (out, a)
{
    out[0] = (a[0] + a[3]) * 0.5;
    out[1] = (a[1] + a[4]) * 0.5;
    out[2] = (a[2] + a[5]) * 0.5;
    return out;
};

/**
 * Sets a box3 from the intersect of two box3s
 *
 * @param {box3} out   - receiving box3
 * @param {box3} a     - first box3
 * @param {box3} b     - second box3
 * @returns {box3} out - receiving box3
 */
box3.intersect = function (out, a, b)
{
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    out[3] = Math.min(a[3], b[3]);
    out[4] = Math.min(a[4], b[4]);
    out[5] = Math.min(a[5], b[5]);
    return out;
};

/**
 * Sets a box3 from the intersect of a box3 and min and max bounds
 *
 * @param {box3} out   - receiving box3
 * @param {box3} a     - box3
 * @param {vec3} min   - min bounds
 * @param {vec3} max   - max bounds
 * @returns {box3} out - receiving box3
 */
box3.intersectBounds = function (out, a, min, max)
{
    out[0] = Math.max(a[0], min[0]);
    out[1] = Math.max(a[1], min[1]);
    out[2] = Math.max(a[2], min[2]);
    out[3] = Math.min(a[3], max[0]);
    out[4] = Math.min(a[4], max[1]);
    out[5] = Math.min(a[5], max[2]);
    return out;
};

/**
 * Checks for box3 intersection with another box3
 *
 * @param a           - first box3 to compare
 * @param b           - second box3 to compare
 * @returns {boolean} - true if intersection occurred
 */
box3.intersects = function (a, b)
{
    return !(
        b[3] < a[0] || b[0] > a[3] ||
        b[4] < a[1] || b[1] > a[4] ||
        b[5] < a[2] || b[2] > a[5]
    );
};

/**
 * Checks for box3 intersection with min and max bounds
 *
 * @param {box3} a    - box3 to compare
 * @param {vec3} min  - min bounds to compare
 * @param {vec3} max  - max bounds to compare
 * @returns {boolean} - true if intersection occurred
 */
box3.intersectsBounds = function (a, min, max)
{
    return !(
        max[0] < a[0] || min[0] > a[3] ||
        max[1] < a[1] || min[1] > a[4] ||
        max[2] < a[2] || min[2] > a[5]
    );
};

/**
 * Checks for box3 intersection with a plane normal and constant
 *
 * @param {box3} a          - source box3
 * @param {vec3} normal     - plane normal vec3
 * @param {number} constant - plane constant
 * @returns {boolean}       - true if intersection occurs
 */
box3.intersectsNormalConstant = function (a, normal, constant)
{
    let tMin, tMax;

    if (normal[0] > 0)
    {
        tMin = normal[0] * a[0];
        tMax = normal[0] * a[3];
    }
    else
    {
        tMin = normal[0] * a[3];
        tMax = normal[0] * a[0];
    }

    if (normal[1] > 0)
    {
        tMin = normal[1] * a[1];
        tMax = normal[1] * a[4];
    }
    else
    {
        tMin = normal[1] * a[4];
        tMax = normal[1] * a[1];
    }

    if (normal[2] > 0)
    {
        tMin += normal[2] * a[2];
        tMax += normal[2] * a[5];
    }
    else
    {
        tMin += normal[2] * a[5];
        tMax += normal[2] * a[2];
    }

    return (tMin <= constant && tMax >= constant);
};

/**
 * Checks for box3 intersection with a Float32Array(4) plane
 *
 * @param {box3} a                   - box3 to compare
 * @param {(pln|Float32Array)} p     - plane to compare
 * @returns {boolean}                - true if intersection occurs
 */
box3.intersectsPln = function (a, p)
{
    // const x = p.subarray(0, 3);
    return box3.intersectsNormalConstant(a, p, p[3]);
};

/**
 * Checks for box3 intersection with a point
 *
 * @param {box3} a    - box3 to compare
 * @param {vec3} p    - point to compare
 * @returns {boolean} - true if intersection occurs
 */
box3.intersectsPoint = function (a, p)
{
    return p[0] >= a[0] && p[0] <= a[3] && p[1] >= a[1] && p[1] <= a[4] && p[2] >= a[2] && p[2] <= a[5];
};

/**
 * Checks for box3 intersection with a point's values
 *
 * @param {box3} a    - box3 to compare
 * @param {Number} px - point x to compare
 * @param {Number} py - point y to compare
 * @param {Number} pz - point z to compare
 * @returns {boolean} - true if intersection occurs
 */
box3.intersectsValues = function (a, px, py, pz)
{
    return px >= a[0] && px <= a[3] && py >= a[1] && py <= a[4] && pz >= a[2] && pz <= a[5];
};

/**
 * Checks for box3 intersection with a sphere's components
 *
 * @param {box3} a        - box3 to compare
 * @param {vec3} position - sphere position to compare
 * @param {number} radius - sphere radius to compare
 * @returns {boolean}     - true if intersection occurs
 */
box3.intersectsPositionRadius = function (a, position, radius)
{
    let x = Math.max(a[0], Math.min(a[3], position[0])) - position[0],
        y = Math.max(a[1], Math.min(a[4], position[1])) - position[1],
        z = Math.max(a[2], Math.min(a[5], position[2])) - position[2];

    return (x * x + y * y + z * z) <= radius * radius;
};

/**
 * Checks for box3 intersection with a Float32Array(4) sphere
 *
 * @param {box3} a      - box3 to compare
 * @param {sph3} sphere - sph3 to compare
 * @returns {boolean}   - true if intersection occurs
 */
box3.intersectsSph3 = function (a, sphere)
{
    let x = Math.max(a[0], Math.min(a[3], sphere[0])) - sphere[0],
        y = Math.max(a[1], Math.min(a[4], sphere[1])) - sphere[1],
        z = Math.max(a[2], Math.min(a[5], sphere[2])) - sphere[2];

    return (x * x + y * y + z * z) <= sphere[3] * sphere[3];
};

/**
 * Checks if a box3 is empty
 *
 * @param {box3} a    - source box3
 * @returns {boolean} - true if empty
 */
box3.isEmpty = function (a)
{
    return (a[3] < a[0]) || (a[4] < a[1]) || (a[5] < a[2]);
};

/**
 * Checks if bounds are empty
 *
 * @param {vec3} min
 * @param {vec3} max
 * @returns {boolean}
 */
box3.bounds.isEmpty = function (min, max)
{
    return (max[0] < min[0]) || (max[1] < min[1]) || (max[2] < min[2]);
};

/**
 * Sets a box3 from values
 *
 * @param {box3} out  - receiving box3
 * @param {Number} aX
 * @param {Number} aY
 * @param {Number} aZ
 * @param {Number} bX
 * @param {Number} bY
 * @param {Number} bZ
 * @returns {box3}
 */
box3.set = function (out, aX, aY, aZ, bX, bY, bZ)
{
    out[0] = aX;
    out[1] = aY;
    out[2] = aZ;
    out[3] = bX;
    out[4] = bY;
    out[5] = bZ;
    return out;
};

/**
 * Gets the distance from a box3 to a point
 *
 * @param {box3} a   - source box3
 * @param {vec3} p   - point
 * @returns {number} - distance
 */
box3.squaredDistanceToPoint = function (a, p)
{
    let x = Math.max(a[0], Math.min(a[3], p[0])) - p[0],
        y = Math.max(a[1], Math.min(a[4], p[1])) - p[1],
        z = Math.max(a[2], Math.min(a[5], p[2])) - p[2];

    return x * x + y * y + z * z;
};

/**
 * Gets the surface area of a box3
 *
 * @param {box3} a   - source box3
 * @returns {number} - surface area
 */
box3.surfaceArea = function (a)
{
    let aa = a[3] - a[0],
        h = a[4] - a[1],
        d = a[5] - a[2];

    return 2 * (aa * (h + d) + h * d);
};

/**
 * Converts the box3 into an array
 *
 * @param {box3} a            - receiving box3
 * @param {Array} arr         - source array
 * @param {number} [offset=0] - optional offset
 * @returns {box3} a          - receiving box3
 */
box3.toArray = function (a, arr, offset = 0)
{
    arr[offset] = a[0];
    arr[offset + 1] = a[1];
    arr[offset + 2] = a[2];
    arr[offset + 3] = a[3];
    arr[offset + 4] = a[4];
    arr[offset + 5] = a[5];
    return a;
};

/**
 * Converts a box3 to bounds
 *
 * @param {vec3} outMin - receiving vector for min bounds
 * @param {vec3} outMax - receiving vector for max bounds
 * @param {box3} a      - source box3
 */
box3.toBounds = function (a, outMin, outMax)
{
    outMin[0] = a[0];
    outMin[1] = a[1];
    outMin[2] = a[2];
    outMax[0] = a[3];
    outMax[1] = a[4];
    outMax[2] = a[5];
    return a;
};

/**
 * Sets a receiving box3 from the translation of a box3 and a vec3
 *
 * @param {box3} out   - receiving box3
 * @param {box3} a     - source box3
 * @param {vec3} v     - vec3 to translate by
 * @returns {box3} out - receiving box3
 */
box3.translate = function (out, a, v)
{
    out[0] = a[0] + v[0];
    out[1] = a[1] + v[1];
    out[2] = a[2] + v[2];
    out[3] = a[3] + v[0];
    out[4] = a[4] + v[1];
    out[5] = a[5] + v[2];
    return out;
};

/**
 * Sets a receiving box3 from the transformation of a box3 with a mat4
 *
 * @param {box3} out   - receiving box3
 * @param {box3} a     - source box3
 * @param {mat4} m     - mat4 to transform with
 * @returns {box3} out - receiving box3
 */
box3.transformMat4 = (function ()
{
    let points;

    return function (out, a, m)
    {
        if (!points)
        {
            points = [
                vec3.create(), vec3.create(), vec3.create(), vec3.create(),
                vec3.create(), vec3.create(), vec3.create(), vec3.create()
            ];
        }

        if (box3.isEmpty(a))
        {
            return box3.empty(out);
        }

        vec3.transformMat4(points[0], [a[0], a[1], a[2]], m);
        vec3.transformMat4(points[1], [a[0], a[1], a[5]], m);
        vec3.transformMat4(points[2], [a[0], a[4], a[2]], m);
        vec3.transformMat4(points[3], [a[0], a[4], a[5]], m);
        vec3.transformMat4(points[4], [a[3], a[1], a[2]], m);
        vec3.transformMat4(points[5], [a[3], a[1], a[5]], m);
        vec3.transformMat4(points[6], [a[3], a[4], a[2]], m);
        vec3.transformMat4(points[7], [a[3], a[4], a[5]], m);

        return box3.fromPoints(out, points);
    };
});

/**
 * Sets a box3 from the union of two box3s
 *
 * @param {box3} out   - receiving box3
 * @param {box3} a     - first box3
 * @param {box3} b     - second box3
 * @returns {box3} out - receiving box3
 */
box3.union = function (out, a, b)
{
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    out[3] = Math.max(a[3], b[3]);
    out[4] = Math.max(a[4], b[4]);
    out[5] = Math.max(a[5], b[5]);
    return out;
};

/**
 * Sets a box3 from the union of a box3 and min and max bounds
 *
 * @param {box3} out   - receiving box3
 * @param {box3} a     - box3
 * @param {vec3} min   - min bounds
 * @param {vec3} max   - max bounds
 * @returns {box3} out - receiving box3
 */
box3.unionBounds = function (out, a, min, max)
{
    out[0] = Math.min(a[0], min[0]);
    out[1] = Math.min(a[1], min[1]);
    out[2] = Math.min(a[2], min[2]);
    out[3] = Math.max(a[3], max[0]);
    out[4] = Math.max(a[4], max[1]);
    out[5] = Math.max(a[5], max[2]);
    return out;
};