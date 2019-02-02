import * as math from "./global/math";
import * as clazz from "./global/class";
import * as core from "./core";
import * as curve from "./curve";
import * as eve from "./eve";
import * as interior from "./interior";
import * as particle from "./particle";
import * as sof from "./sof";
import * as state from "./state";
import {device, store, resMan, logger, util, consts} from "./global";

export * from "./core";
export * from "./curve";
export * from "./eve";
export * from "./particle";
export * from "./interior";
export * from "./particle";
export * from "./sof";
export * from "./state";

export {math, util, device, store, resMan, logger, consts};

const {vec4, mat4} = math;

/**
 * Register global configurations
 */
store.Register({

    resMan: {
        "systemMirror": false,
        "autoPurgeResources": true,
        "purgeTime": 60,
        "maxPrepareTime": 0.05
    },

    logger: {
        "name": "CCPWGL2",
        "history": 50,
        "throttle": 10,
        "display": true,
        "visible": {
            "error": true,
            "warning": true,
            "log": true,
            "info": false,
            "debug": true
        }
    },

    paths: {
        "res": "https://developers.eveonline.com/ccpwgl/assetpath/1097993/"
    },

    extensions: {
        "sm_hi": core.Tw2EffectRes,
        "sm_lo": core.Tw2EffectRes,
        "wbg": core.Tw2GeometryRes,
        "png": core.Tw2TextureRes,
        "dds": core.Tw2TextureRes,
        "cube": core.Tw2TextureRes,
        "mp4": core.Tw2VideoRes,
        "ogg": core.Tw2VideoRes,
        "webm": core.Tw2VideoRes,
        "black": core.Tw2BlackRes
    },

    classes: [
        clazz,
        core,
        curve,
        eve,
        interior,
        particle,
        sof,
        state
    ],

    types: {
        "float": core.Tw2FloatParameter,
        "number": core.Tw2FloatParameter,
        "texture": core.Tw2TextureParameter,
        "vector2": core.Tw2Vector2Parameter,
        "vector3": core.Tw2Vector3Parameter,
        "vector4": core.Tw2Vector4Parameter,
        "matrix4": core.Tw2Matrix4Parameter
    },

    variables: {
        "WorldMat": mat4.create(),
        "ViewMat": mat4.create(),
        "ProjectionMat": mat4.create(),
        "ViewProjectionMat": mat4.create(),
        "ViewportSize": vec4.create(),
        "Time": vec4.create(),
        "u_DecalMatrix": mat4.create(),
        "u_InvDecalMatrix": mat4.create(),
        "EveSpaceSceneEnvMap": "",
        "EnvMap1": "",
        "EnvMap2": "",
        "EnvMap3": "",
        "ShadowLightness": 0,
        "OccluderValue": vec4.fromValues(1, 1, 0, 0),
        "LensflareFxOccScale": vec4.fromValues(1, 1, 0, 0),
        "LensflareFxDirectionScale": vec4.create()
    }

});

/**
 * Staging
 */

import * as staging from "./.staging";

export {staging};

/**
 * Registers a staging class
 * @param {String} name - The name of the staging class
 * @returns {null|class|Function} the class
 */
export function useStaging(name)
{
    if (name in staging)
    {
        store.RegisterClass(name, staging[name]);
        return staging[name];
    }
    return null;
}


