import { meta, resMan, Tw2BaseClass } from "global";
import { Tw2RenderBatch } from "core/batch";


@meta.notImplemented
export class EveTrailSetRenderBatch extends Tw2RenderBatch
{

    trailsSet = null;

    /**
     * Commits the batch
     * @param {String} technique - technique name
     */
    Commit(technique)
    {
        this.boosters.Render(technique);
    }
}


@meta.notImplemented
@meta.type("EveTrailSet", true)
export class EveTrailsSet extends Tw2BaseClass
{

    @meta.black.object
    effect = null;

    @meta.black.path
    geometryResPath = "";

    @meta.boolean
    display = true;


    _geometryRes = null;


    /**
     * Initializes the object
     */
    Initialize()
    {
        if (this.geometryResPath)
        {
            this._geometryRes = resMan.GetResource(this.geometryResPath, res => this.OnResPrepared(res));
        }
    }

    /**
     * Rebuilds cached data
     * @param {Tw2GeometryRes} res
     */
    OnResPrepared(res)
    {
        //TODO: OnResPrepared
    }

    /**
     * Gets resources
     * @param {Array} [out=[]]
     * @returns {Array<Tw2Resource>}
     */
    GetResources(out = [])
    {
        if (this.effect)
        {
            this.effect.GetResources(out);
        }

        if (this._geometryRes && !out.includes(this._geometryRes))
        {
            out.push(this._geometryRes);
        }

        return out;
    }

}