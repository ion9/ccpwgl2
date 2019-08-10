import {Tw2BaseClass} from "../../global";

/**
 * Tr2ActionOverlay
 * Todo: Implement
 *
 * @property {String} path -
 */
export class Tr2ActionOverlay extends Tw2BaseClass
{

    path = "";

    /**
     * Black definition
     * @param {*} r
     * @returns {*[]}
     */
    static black(r)
    {
        return [
            ["path", r.string]
        ];
    }

    /**
     * Identifies that the class is in staging
     * @property {null|Number}
     */
    static __isStaging = 4;

}