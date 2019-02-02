import {Tw2BaseClass} from "../../global/index";

/**
 * EveSOFDataPattern
 *
 * @property {EveSOFDataPatternLayer} layer1                -
 * @property {EveSOFDataPatternLayer} layer2                -
 * @property {Array.<EveSOFDataPatternPerHull>} projections -
 */
export class EveSOFDataPattern extends Tw2BaseClass
{

    layer1 = null;
    layer2 = null;
    projections = [];

}

Tw2BaseClass.define(EveSOFDataPattern, Type =>
{
    return {
        isStaging: true,
        type: "EveSOFDataPattern",
        props: {
            layer1: ["EveSOFDataPatternLayer"],
            layer2: ["EveSOFDataPatternLayer"],
            projections: [["EveSOFDataPatternPerHull"]]
        }
    };
});

