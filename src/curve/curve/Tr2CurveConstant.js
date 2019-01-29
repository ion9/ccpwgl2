import {vec4, Tw2BaseClass} from "../../global";

/**
 * Tr2CurveConstant
 * @implements Curve
 *
 * @property {vec4} value -
 */
export default class Tr2CurveConstant extends Tw2BaseClass
{

    value = vec4.create();

}

Tw2BaseClass.define(Tr2CurveConstant, Type =>
{
    return {
        isStaging: true,
        type: "Tr2CurveConstant",
        category: "Curve",
        props: {
            value: Type.VECTOR4
        }
    };
});

