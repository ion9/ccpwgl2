import {Tw2BaseClass, util, resMan} from "../../global";
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
 * Tr2MeshLod
 * TODO: Implement "depthAreas"
 * TODO: What should the mesh index be for it's render batch?
 * TODO: Confirm "associatedResources" is geometryRes cache
 * @ccp Tr2MeshLod
 *
 * @property {Array.<Tw2MeshArea>} additiveAreas         -
 * @property {Array<Tw2GeometryRes>} associatedResources -
 * @property {Array.<Tw2MeshArea>} decalAreas            -
 * @property {Array.<Tw2MeshArea>} depthAreas            -
 * @property {Boolean} display                           -
 * @property {Tw2LodResource} geometryRes                -
 * @property {Tw2GeometryRes} geometryResource           -
 * @property {Array.<Tw2MeshArea>} opaqueAreas           -
 * @property {Array.<Tw2MeshArea>} pickableAreas         -
 * @property {Array.<Tw2MeshArea>} transparentAreas      -
 * @property {null|Tw2GeometryRes} _geometryPending      -
 * @property {null|Tw2GeometryRes} _geometryQuality      -
 */
export class Tr2MeshLod extends Tw2BaseClass
{

    // ccp
    additiveAreas = [];
    associatedResources = [];
    decalAreas = [];
    depthAreas = [];
    geometryRes = null;
    opaqueAreas = [];
    pickableAreas = [];
    transparentAreas = [];

    // ccpwgl
    display = true;
    geometryResource = null;
    visible = {
        opaqueAreas: true,
        transparentAreas: true,
        additiveAreas: true,
        pickableAreas: true,
        decalAreas: true,
        depthAreas: true
    };

    _geometryPending = null;
    _geometryQuality = null;


    /**
     * Initializes the mesh
     */
    Initialize()
    {
        this.SetQuality(0);
    }

    /**
     * Sets lod level
     * @param {Number} [level=3]
     */
    SetQuality(level = 3)
    {
        level = Math.min(3, Math.max(0, level));
        if (this._geometryQuality === level) return;

        // Clear any pending geometry changes
        if (this._geometryPending)
        {
            this._geometryPending.UnregisterNotification(this);
            this._geometryPending = null;
        }

        let res = null;
        if (this.geometryRes && level < 3)
        {
            const
                aRes = this.associatedResources,
                path = this.geometryRes;

            // Low
            if (level === 2)
            {
                if (!aRes[2] && path.lowDetailResPath) aRes[2] = resMan.GetResource(path.lowDetailResPath);
                res = aRes[2];
            }

            // Medium
            if (level === 1 || !res)
            {
                if (!aRes[1] && path.mediumDetailResPath) aRes[1] = resMan.GetResource(path.mediumDetailResPath);
                res = aRes[1];
            }

            // High
            if (!res)
            {
                if (!aRes[0] && path.highDetailResPath) aRes[0] = resMan.GetResource(path.highDetailResPath);
                res = aRes[0];
            }
        }
        else
        {
            this.geometryResource = null;
        }

        if (res && res !== this.geometryResource)
        {
            if (res.IsGood())
            {
                this.geometryResource = res;
            }
            else
            {
                this._geometryPending = res;
                res.RegisterNotification(this);
            }
        }

        this.EmitEvent("lod_changed", {level});
        this._geometryQuality = level;
    }

    /**
     * Rebuilds cached data
     * @param {Tw2GeometryRes} res
     */
    RebuildCachedData(res)
    {
        this.geometryResource = res;
        res.UnregisterNotification(this);

        if (this._geometryPending)
        {
            this._geometryPending.UnregisterNotification(this);
        }

        this._geometryPending = null;
    }

    /**
     * Checks if the mesh's resource is good
     * @returns {Boolean}
     */
    IsGood()
    {
        return this.geometryResource && this.geometryResource.IsGood();
    }

    /**
     * Gets mesh resources
     * @param {Array} [out=[]] - Optional receiving array
     * @returns {Array.<Tw2Resource>} [out]
     */
    GetResources(out = [])
    {
        for (let i = 0; i < this.associatedResources; i++)
        {
            if (out[i] && !out.includes(this.associatedResources[i]))
            {
                out.push(this.associatedResources[i]);
            }
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
     * Gets render batches from a mesh area array and commits them to an accumulator
     * @param {Tr2MeshLod} mesh
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
                const batch = new area.constructor.batchType();
                batch.renderMode = mode;
                batch.perObjectData = perObjectData;
                batch.geometryRes = mesh.geometryResource;
                batch.meshIx = 0;                           // Why no mesh index?
                batch.start = area.index;
                batch.count = area.count;
                batch.effect = area.effect;
                accumulator.Commit(batch);
            }
        }
    }
}

Tw2BaseClass.define(Tr2MeshLod, Type =>
{
    return {
        isStaging: true,
        type: "Tr2MeshLod",
        category: "Mesh",
        props: {
            additiveAreas: [["Tw2MeshArea"]],
            associatedResources: Type.ARRAY,
            decalAreas: [["Tw2MeshArea"]],
            depthAreas: [["Tw2MeshArea"]],
            display: Type.BOOLEAN,
            geometryRes: ["Tr2LodResource"],
            opaqueAreas: [["Tw2MeshArea"]],
            pickableAreas: [["Tw2MeshArea"]],
            transparentAreas: [["Tw2MeshArea"]],
            visible: Type.PLAIN
        },
        notImplemented: [
            "depthAreas"
        ]
    };
});

