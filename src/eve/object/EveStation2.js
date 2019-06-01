import {vec3} from "../../global/index";
import {Tw2BaseClass} from "../../global/index";

/**
 * EveStation2
 * TODO: Implement
 * @ccp EveStation2
 *
 * @property {Array.<EveObjectSet>} attachments       -
 * @property {vec3} boundingSphereCenter              -
 * @property {Number} boundingSphereRadius            -
 * @property {Array.<EveObject>} children             -
 * @property {Array.<TriCurveSet>} curveSets          -
 * @property {Array.<EveObjectItem>} decals           -
 * @property {Array.<ObjectChild>} effectChildren     -
 * @property {Array.<Tr2PointLight>} lights           -
 * @property {Array.<EveObjectSet>} locatorSets       -
 * @property {Array.<EveObjectItem>} locators         -
 * @property {Tr2Mesh} mesh                           -
 * @property {Tr2MeshLod} meshLod                     -
 * @property {Tr2RotationAdapter} modelRotationCurve  -
 * @property {Number} modelScale                      -
 * @property {Array.<TriObserverLocal>} observers     -
 * @property {Tr2RotationAdapter} rotationCurve       -
 * @property {Tr2Effect} shadowEffect                 -
 * @property {Tr2TranslationAdapter} translationCurve -
 */
export class EveStation2 extends Tw2BaseClass
{

    attachments = [];
    boundingSphereCenter = vec3.create();
    boundingSphereRadius = 0;
    children = [];
    curveSets = [];
    decals = [];
    effectChildren = [];
    lights = [];
    locatorSets = [];
    locators = [];
    mesh = null;
    meshLod = null;
    modelRotationCurve = null;
    modelScale = 0;
    observers = [];
    rotationCurve = null;
    shadowEffect = null;
    translationCurve = null;

    /**
     * Black definition
     * @param {*} r
     * @returns {*[]}
     */
    static black(r)
    {
        return [
            ["attachments", r.array],
            ["boundingSphereCenter", r.vector3],
            ["boundingSphereRadius", r.float],
            ["children", r.array],
            ["curveSets", r.array],
            ["decals", r.array],
            ["effectChildren", r.array],
            ["lights", r.array],
            ["locatorSets", r.array],
            ["locators", r.array],
            ["name", r.string],
            ["mesh", r.object],
            ["meshLod", r.object],
            ["modelScale", r.float],
            ["observers", r.array],
            ["rotationCurve", r.object],
            ["modelRotationCurve", r.object],
            ["shadowEffect", r.object],
            ["translationCurve", r.object]
        ];
    }

    /**
     * Identifies that the class is in staging
     * @property {null|Number}
     */
    static __isStaging = 4;

}
