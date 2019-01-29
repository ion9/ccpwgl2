import {vec3, util, resMan, device, Tw2BaseClass} from "../../global";
import {Tw2InstancedMeshBatch} from "../batch";
import {
    RM_ADDITIVE,
    RM_DEPTH,
    RM_DISTORTION,
    RM_DECAL,
    RM_OPAQUE,
    RM_TRANSPARENT,
    RM_PICKABLE
} from "../../global/engine";

/**
 * Tw2InstancedMesh
 * TODO: Implement "distortionAreas"
 * TODO: Implement "depthAreas"
 * Todo: Handle "reversed" meshAreas
 * Todo: Handle "useSHLighting" meshAreas
 * @ccp Tr2InstancedMesh
 *
 * @property {Array.<Tw2MeshArea>} additiveAreas                                       -
 * @property {Array.<Tw2MeshArea>} decalAreas                                          -
 * @property {Array.<Tw2MeshArea>} depthAreas                                          -
 * @property {Boolean} display-                                                        -
 * @property {Array.<Tw2MeshArea>} distortionAreas                                     -
 * @property {Tw2GeometryRes} geometryRes                                              -
 * @property {String} geometryResPath                                                  -
 * @property {String} instanceGeometryResPath                                          -
 * @property {ParticleSystem|Tr2RuntimeInstanceData|Resource} instanceGeometryResource -
 * @property {Number} instanceMeshIndex                                                -
 * @property {vec3} maxBounds                                                          -
 * @property {vec3} minBounds                                                          -
 * @property {Array.<Tw2MeshArea>} opaqueAreas                                         -
 * @property {Array.<Tw2MeshArea>} transparentAreas                                    -
 * @property {*} visible                                                               -
 */
export class Tw2InstancedMesh extends Tw2BaseClass
{

    additiveAreas = [];
    decalAreas = [];
    depthAreas = [];
    distortionAreas = [];
    geometryResPath = "";
    instanceGeometryResPath = "";
    instanceGeometryResource = null;
    instanceMeshIndex = 0;
    maxBounds = vec3.create();
    minBounds = vec3.create();
    opaqueAreas = [];
    transparentAreas = [];

    //ccpwgl
    display = true;
    geometryResource = null;
    pickableAreas = [];
    visible = {
        additiveAreas: true,
        decalAreas: true,
        depthAreas: true,
        distortionAreas: true,
        opaqueAreas: true,
        pickableAreas: true,
        transparentAreas: true,
    };

    /**
     * Initializes the instanced mesh
     */
    Initialize()
    {
        if (this.geometryResPath !== "")
        {
            this.geometryResource = resMan.GetResource(this.geometryResPath);
        }

        if (this.instanceGeometryResPath !== "")
        {
            this.instanceGeometryResource = resMan.GetResource(this.instanceGeometryResPath);
        }
    }

    /**
     * Checks if the instances meshes' resources are good
     * @returns {Boolean}
     */
    IsGood()
    {
        const
            instanced = this.instanceGeometryResource,
            isResGood = this.geometryResource && this.geometryResource.IsGood(),
            isInstancedResGood = !instanced ? false : instanced.IsGood ? instanced.IsGood() : true;

        return isResGood && isInstancedResGood;
    }

    /**
     * Gets mesh resources
     * @param {Array} [out=[]] - Optional receiving array
     * @returns {Array.<Tw2Resource>} [out]
     */
    GetResources(out = [])
    {
        if (this.geometryResource && !out.includes(this.geometryResource))
        {
            out.push(this.geometryResource);
        }

        if (this.instanceGeometryResource && "GetResources" in this.instanceGeometryResource)
        {
            this.instanceGeometryResource.GetResources(out);
        }

        //return super.GetResources(out);
        util.perArrayChild(this.additiveAreas, "GetResources", out);
        util.perArrayChild(this.decalAreas, "GetResources", out);
        util.perArrayChild(this.depthAreas, "GetResources", out);
        util.perArrayChild(this.distortionAreas, "GetResources", out);
        util.perArrayChild(this.opaqueAreas, "GetResources", out);
        util.perArrayChild(this.pickableAreas, "GetResources", out);
        util.perArrayChild(this.transparentAreas, "GetResources", out);
        return out;
    }

    /**
     * Gets render batches
     * @param {Number} mode
     * @param {Tw2BatchAccumulator} accumulator
     * @param {Tw2PerObjectData} perObjectData
     */
    GetBatches(mode, accumulator, perObjectData)
    {
        if (!this.IsGood() || !this.display) return false;

        const getBatches = this.constructor.GetAreaBatches;
        switch (mode)
        {
            case RM_ADDITIVE:
                if (this.visible.additiveAreas)
                {
                    getBatches(this, this.additiveAreas, mode, accumulator, perObjectData);
                }
                return;

            case RM_DECAL:
                if (this.visible.decalAreas)
                {
                    getBatches(this, this.opaqueAreas, mode, accumulator, perObjectData);
                }
                return;

            case RM_DEPTH:
                /*
                if (this.visible.depthAreas)
                {
                    getBatches(this, this.depthAreas, mode, accumulator, perObjectData);
                }
                */
                return;

            case RM_DISTORTION:
                /*
                if (this.visible.distortionAreas)
                {
                    getBatches(this, this.distortionAreas, mode, accumulator, perObjectData);
                }
                */
                return;

            case RM_OPAQUE:
                if (this.visible.opaqueAreas)
                {
                    getBatches(this, this.opaqueAreas, mode, accumulator, perObjectData);
                }
                return;

            case RM_PICKABLE:
                if (this.visible.pickableAreas)
                {
                    getBatches(this, this.pickableAreas, mode, accumulator, perObjectData);
                }
                return;

            case RM_TRANSPARENT:
                if (this.visible.transparentAreas)
                {
                    getBatches(this, this.transparentAreas, mode, accumulator, perObjectData);
                }
                return;
        }
    }

    /**
     * RenderAreas
     * @param {Number} meshIx
     * @param {Number} start
     * @param {Number} count
     * @param {Tw2Effect} effect
     * @param {String} technique
     */
    RenderAreas(meshIx, start, count, effect, technique)
    {
        if (!this.IsGood()) return;

        const buffer = this.instanceGeometryResource.GetInstanceBuffer(this.instanceMeshIndex);
        if (buffer)
        {
            this.geometryResource.RenderAreasInstanced(meshIx, start, count, effect, technique, buffer,
                this.instanceGeometryResource.GetInstanceDeclaration(this.instanceMeshIndex),
                this.instanceGeometryResource.GetInstanceStride(this.instanceMeshIndex),
                this.instanceGeometryResource.GetInstanceCount(this.instanceMeshIndex));
        }
    }

    /**
     * Gets area batches
     * @param {Tw2InstancedMesh} mesh
     * @param {Array.<Tw2MeshArea>} areas
     * @param {Number} mode
     * @param {Tw2BatchAccumulator} accumulator
     * @param {Tw2PerObjectData} perObjectData
     */
    static GetAreaBatches(mesh, areas, mode, accumulator, perObjectData)
    {
        for (let i = 0; i < areas.length; ++i)
        {
            const area = areas[i];
            if (area.effect && area.display)
            {
                const batch = new Tw2InstancedMeshBatch();
                batch.renderMode = mode;
                batch.perObjectData = perObjectData;
                batch.instanceMesh = mesh;
                batch.meshIx = area.meshIndex;
                batch.start = area.index;
                batch.count = area.count;
                batch.effect = area.effect;
                accumulator.Commit(batch);
            }
        }
    }

}


Tw2BaseClass.define(Tw2InstancedMesh, Type =>
{
    return {
        type: "Tw2InstancedMesh",
        category: "Mesh",
        props: {
            additiveAreas: [["Tw2MeshArea"]],
            decalAreas: [["Tw2MeshArea"]],
            depthAreas: [["Tw2MeshArea"]],
            display: Type.BOOLEAN,
            distortionAreas: [["Tw2MeshArea"]],
            geometryResPath: Type.PATH,
            instanceGeometryResPath: Type.PATH,
            instanceGeometryResource: ["Tr2ParticleSystem", "Tr2RuntimeInstanceData", "TriGeometryRes"],
            instanceMeshIndex: Type.NUMBER,
            maxBounds: Type.VECTOR3,
            minBounds: Type.VECTOR3,
            opaqueAreas: [["Tw2MeshArea"]],
            pickableAreas: [["Tw2MeshArea"]],
            transparentAreas: [["Tw2MeshArea"]],
            visible: Type.PLAIN
        },
        notImplemented: [
            "distortionAreas",
            "pickableAreas"
        ]
    };
});

