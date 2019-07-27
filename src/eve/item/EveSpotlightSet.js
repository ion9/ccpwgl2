import {vec3, vec4, mat4, util, device, Tw2BaseClass} from "../../global";
import {Tw2VertexDeclaration, Tw2RenderBatch} from "../../core";
import {EveObjectSet, EveObjectSetItem} from "./EveObjectSet";
import {assignIfExists, isFunction} from "../../global/util";
import {Tw2Effect} from "../../core/mesh";

/**
 * Spotlight set render batch
 * @property {EveSpotlightSet} spotlightSet
 */
export class EveSpotlightSetBatch extends Tw2RenderBatch
{

    spotlightSet = null;

    /**
     * Commits the spotlight set for rendering
     * @param {String} technique - technique name
     */
    Commit(technique)
    {
        this.spotlightSet.RenderCones(technique);
        this.spotlightSet.RenderGlow(technique);
    }

}


/**
 * Spotlight
 * TODO: Identify if "boosterGainInfluence" is deprecated
 * @ccp EveSpotlightSetItem
 *
 * @property {String} name                  - The spotlight's name
 * @property {mat4} transform               - The spotlight's transform
 * @property {vec4} coneColor               - Colour of the spotlight's cone
 * @property {vec4} spriteColor             - Colour of the spotlight's sprite texture
 * @property {vec4} flareColor              - Colour of the spotlight's flare
 * @property {vec4} spriteScale             - The size of the spotlight
 * @property {Number} boosterGainInfluence  - If true, the spotlight can change size on booster gain
 * @property {Number} boneIndex             - The spotlight's bone index
 * @property {Number} groupIndex            - The sof faction group that the spotlight belongs to
 * @property {Number} coneIntensity         - Scales the spotlight's cone colour, set by an object's sof Faction
 * @property {Number} spriteIntensity       - Scales the spotlight's sprite colour, set by an object's sof Faction
 * @property {Number} flareIntensity        - Scales the spotlight's flare colour, set by an object's sof Faction
 */
export class EveSpotlightSetItem extends EveObjectSetItem
{
    // ccp
    name = "";
    coneColor = vec4.create();
    flareColor = vec4.create();
    spriteColor = vec4.create();
    spriteScale = vec3.fromValues(1, 1, 1);
    transform = mat4.create();

    // ccpwgl
    boosterGainInfluence = 0;
    boneIndex = 0;                  // retain from EveSOF?
    display = true;
    groupIndex = -1;                // retain from EveSOF?
    coneIntensity = 0;              // Faction intensity
    spriteIntensity = 0;            // Faction intensity
    flareIntensity = 0;             // faction intensity


    /**
     * Creates a spotlight set item from an object
     * @param {*} [opt={}
     * @returns {EveSpotlightSetItem}
     */
    static from(opt = {})
    {
        const item = new this();
        util.assignIfExists(item, opt, [
            "name", "display", "boosterGainInfluence", "boneIndex", "groupIndex",
            "coneIntensity", "spriteIntensity", "flareIntensity", "transform",
            "coneColor", "spriteColor", "flareColor", "spriteScale"
        ]);
        return item;
    }

    /**
     * Black definition
     * @param {*} r
     * @returns {*[]}
     */
    static black(r)
    {
        return [
            ["coneColor", r.color],
            ["flareColor", r.color],
            ["name", r.string],
            ["spriteColor", r.color],
            ["spriteScale", r.vector3],
            ["transform", r.matrix]
        ];
    }

}


/**
 * Spotlight set
 * Todo: Implement "intensity"
 * @ccp EveSpotlightSet
 *
 * @property {String} name                                - The spotlight set's name
 * @property {Tw2Effect} coneEffect                       - The spotlight set's cone effect
 * @property {Tw2Effect} glowEffect                       - The spotlight set's glow effect
 * @property {Number} intensity                           - The spotlight set's intensity
 * @property {Array.<EveSpotlightSetItem>} spotlightItems - The spotlight set's children
 * @property {WebGLBuffer} _coneVertexBuffer              - Vertex buffer for the spotlight set's cone vertices
 * @property {WebGLBuffer} _spriteVertexBuffer            - Vertex buffer for the spotlight set's sprite/glow vertices
 * @property {WebGLBuffer} _indexBuffer                   - Index buffer for the spotlight set
 * @property {Tw2VertexDeclaration} _decl                 - The spotlight set's vertex declarations
 */
export class EveSpotlightSet extends EveObjectSet
{

    name = "";
    coneEffect = null;
    glowEffect = null;
    intensity = 1;

    // ccpwgl
    _coneVertexBuffer = null;
    _spriteVertexBuffer = null;
    _indexBuffer = null;
    _decl = Tw2VertexDeclaration.from(EveSpotlightSet.vertexDeclarations);

    /**
     * Alias for this.items
     * @returns {Array}
     */
    get spotlightItems()
    {
        return this.items;
    }

    /**
     * Alias for this.items
     * @param {Array} arr
     */
    set spotlightItems(arr)
    {
        this.items = arr;
    }

    /**
     * Gets object resources
     * @param {Array} [out=[]] - Optional receiving array
     * @returns {Array.<Tw2Resource>} [out]
     */
    GetResources(out = [])
    {
        if (this.coneEffect) this.coneEffect.GetResources(out);
        if (this.glowEffect) this.glowEffect.GetResources(out);
        return out;
    }

    /**
     * Unloads the spotlight set's buffers
     * @param {Boolean} [skipEvent]
     */
    Unload(skipEvent)
    {
        if (this._coneVertexBuffer)
        {
            device.gl.deleteBuffer(this._coneVertexBuffer);
            this._coneVertexBuffer = null;
        }

        if (this._spriteVertexBuffer)
        {
            device.gl.deleteBuffer(this._spriteVertexBuffer);
            this._spriteVertexBuffer = null;
        }

        if (this._indexBuffer)
        {
            device.gl.deleteBuffer(this._indexBuffer);
            this._indexBuffer = null;
        }

        super.Unload(skipEvent);
    }

    /**
     * Rebuilds the spotlight set's buffers
     */
    Rebuild()
    {
        this.Unload(true);
        this.RebuildItems();
        this._dirty = false;
        const itemCount = this._visibleItems.length;
        if (!itemCount)
        {
            super.Rebuild();
            return;
        }

        const
            d = device,
            vertCount = 4,
            coneQuadCount = 4,
            coneVertexCount = itemCount * coneQuadCount * vertCount,
            vertexSize = 22,
            coneIndices = [1, 0, 2, 3],
            coneArray = new Float32Array(coneVertexCount * vertexSize);

        for (let i = 0; i < itemCount; ++i)
        {
            const item = this._visibleItems[i];
            for (let q = 0; q < coneQuadCount; ++q)
            {
                for (let v = 0; v < vertCount; ++v)
                {
                    const offset = (i * coneQuadCount * vertCount + vertCount * q + v) * vertexSize;
                    coneArray[offset] = item.coneColor[0] * item.coneIntensity * this.intensity;
                    coneArray[offset + 1] = item.coneColor[1] * item.coneIntensity * this.intensity;
                    coneArray[offset + 2] = item.coneColor[2] * item.coneIntensity * this.intensity;
                    coneArray[offset + 3] = item.coneColor[3];

                    coneArray[offset + 4] = item.transform[0];
                    coneArray[offset + 5] = item.transform[4];
                    coneArray[offset + 6] = item.transform[8];
                    coneArray[offset + 7] = item.transform[12];

                    coneArray[offset + 8] = item.transform[1];
                    coneArray[offset + 9] = item.transform[5];
                    coneArray[offset + 10] = item.transform[9];
                    coneArray[offset + 11] = item.transform[13];

                    coneArray[offset + 12] = item.transform[2];
                    coneArray[offset + 13] = item.transform[6];
                    coneArray[offset + 14] = item.transform[10];
                    coneArray[offset + 15] = item.transform[14];

                    coneArray[offset + 16] = 1;
                    coneArray[offset + 17] = 1;
                    coneArray[offset + 18] = 1;

                    coneArray[offset + 19] = q * vertCount + coneIndices[v];
                    coneArray[offset + 20] = item.boneIndex;
                    coneArray[offset + 21] = item.boosterGainInfluence ? 255 : 0;
                }
            }
        }

        this._coneVertexBuffer = d.gl.createBuffer();
        d.gl.bindBuffer(d.gl.ARRAY_BUFFER, this._coneVertexBuffer);
        d.gl.bufferData(d.gl.ARRAY_BUFFER, coneArray, d.gl.STATIC_DRAW);
        this._coneVertexBuffer.count = itemCount * coneQuadCount * 6;

        const
            spriteQuadCount = 2,
            spriteVertexCount = itemCount * spriteQuadCount * vertCount,
            spriteArray = new Float32Array(spriteVertexCount * vertexSize),
            spriteIndexes = [1, 0, 2, 3];

        for (let i = 0; i < itemCount; ++i)
        {
            const item = this._visibleItems[i];
            for (let q = 0; q < spriteQuadCount; ++q)
            {
                for (let v = 0; v < vertCount; ++v)
                {
                    const offset = (i * spriteQuadCount * vertCount + vertCount * q + v) * vertexSize;
                    if (q % 2 === 0)
                    {
                        spriteArray[offset] = item.spriteColor[0] * item.spriteIntensity * this.intensity;
                        spriteArray[offset + 1] = item.spriteColor[1] * item.spriteIntensity * this.intensity;
                        spriteArray[offset + 2] = item.spriteColor[2] * item.spriteIntensity * this.intensity;
                        spriteArray[offset + 3] = item.spriteColor[3];

                        spriteArray[offset + 16] = item.spriteScale[0];
                        spriteArray[offset + 17] = 1;
                        spriteArray[offset + 18] = 1;
                    }
                    else
                    {
                        spriteArray[offset] = item.flareColor[0] * item.flareIntensity * this.intensity;
                        spriteArray[offset + 1] = item.flareColor[1] * item.flareIntensity * this.intensity;
                        spriteArray[offset + 2] = item.flareColor[2] * item.flareIntensity * this.intensity;
                        spriteArray[offset + 3] = item.flareColor[3];

                        spriteArray[offset + 16] = 1;
                        spriteArray[offset + 17] = item.spriteScale[1];
                        spriteArray[offset + 18] = item.spriteScale[2];
                    }

                    spriteArray[offset + 4] = item.transform[0];
                    spriteArray[offset + 5] = item.transform[4];
                    spriteArray[offset + 6] = item.transform[8];
                    spriteArray[offset + 7] = item.transform[12];

                    spriteArray[offset + 8] = item.transform[1];
                    spriteArray[offset + 9] = item.transform[5];
                    spriteArray[offset + 10] = item.transform[9];
                    spriteArray[offset + 11] = item.transform[13];

                    spriteArray[offset + 12] = item.transform[2];
                    spriteArray[offset + 13] = item.transform[6];
                    spriteArray[offset + 14] = item.transform[10];
                    spriteArray[offset + 15] = item.transform[14];

                    spriteArray[offset + 19] = q * vertCount + spriteIndexes[v];
                    spriteArray[offset + 20] = item.boneIndex;
                    spriteArray[offset + 21] = item.boosterGainInfluence ? 255 : 0;
                }
            }
        }

        this._spriteVertexBuffer = d.gl.createBuffer();
        d.gl.bindBuffer(d.gl.ARRAY_BUFFER, this._spriteVertexBuffer);
        d.gl.bufferData(d.gl.ARRAY_BUFFER, spriteArray, d.gl.STATIC_DRAW);
        this._spriteVertexBuffer.count = itemCount * spriteQuadCount * 6;

        const indexes = new Uint16Array(itemCount * coneQuadCount * 6);
        for (let i = 0; i < itemCount * coneQuadCount; ++i)
        {
            const
                offset = i * 6,
                vtxOffset = i * 4;

            indexes[offset] = vtxOffset;
            indexes[offset + 1] = vtxOffset + 1;
            indexes[offset + 2] = vtxOffset + 2;
            indexes[offset + 3] = vtxOffset + 2;
            indexes[offset + 4] = vtxOffset + 3;
            indexes[offset + 5] = vtxOffset;
        }

        this._indexBuffer = d.gl.createBuffer();
        d.gl.bindBuffer(d.gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        d.gl.bufferData(d.gl.ELEMENT_ARRAY_BUFFER, indexes, d.gl.STATIC_DRAW);
        d.gl.bindBuffer(d.gl.ELEMENT_ARRAY_BUFFER, null);
        this._indexBuffer.count = itemCount;

        super.Rebuild();
    }

    /**
     * Gets the spotlight set's render batches
     * @param {Number} mode
     * @param {Tw2BatchAccumulator} accumulator
     * @param {Tw2PerObjectData} perObjectData
     */
    GetBatches(mode, accumulator, perObjectData)
    {
        if (this.display && mode === device.RM_ADDITIVE && this._indexBuffer && this._indexBuffer.count)
        {
            const batch = new EveSpotlightSetBatch();
            batch.renderMode = device.RM_ADDITIVE;
            batch.spotlightSet = this;
            batch.perObjectData = perObjectData;
            accumulator.Commit(batch);
        }
    }

    /**
     * Renders the spotlight set's cone effect
     * @param {String} technique - technique name
     * @returns {Boolean}
     */
    RenderCones(technique)
    {
        return EveSpotlightSet.Render(this, this.coneEffect, technique, this._coneVertexBuffer);
    }

    /**
     * Renders the spotlight set's glow effect
     * @param {String} technique - technique name
     * @returns {Boolean}
     */
    RenderGlow(technique)
    {
        return EveSpotlightSet.Render(this, this.glowEffect, technique, this._spriteVertexBuffer);
    }

    /**
     * Internal render function
     * @param {EveSpotlightSet} spotlightSet
     * @param {Tw2Effect} effect   - The Tw2Effect to render
     * @param {String} technique - technique name
     * @param {WebGLBuffer} buffer - A webgl buffer (ie. cone or glow buffer)
     * @returns {Boolean}
     * @private
     */
    static Render(spotlightSet, effect, technique, buffer)
    {
        if (!effect || !effect.IsGood() || !buffer || !spotlightSet._indexBuffer) return false;

        const
            d = device,
            gl = d.gl,
            stride = 22 * 4;

        d.SetStandardStates(d.RM_ADDITIVE);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, spotlightSet._indexBuffer);

        for (let pass = 0; pass < effect.GetPassCount(technique); ++pass)
        {
            effect.ApplyPass(technique, pass);
            if (!spotlightSet._decl.SetDeclaration(d, effect.GetPassInput(technique, pass), stride)) return false;
            d.ApplyShadowState();
            d.gl.drawElements(gl.TRIANGLES, buffer["count"], gl.UNSIGNED_SHORT, 0);
        }
        return true;
    }

    /**
     * Creates an eve spotlight set from a plain object
     * @param {*} [values]
     * @param {*} [options]
     * @returns {EveSpotlightSet}
     */
    static from(values, options)
    {
        const item = new EveSpotlightSet();

        if (values)
        {
            assignIfExists(item, values, ["name", "display", "intensity"]);

            if (values.coneEffect)
            {
                if (isFunction(values.coneEffect))
                {
                    item.coneEffect = values.coneEffect;
                }
                else
                {
                    item.coneEffect = Tw2Effect.from(values.coneEffect);
                }
            }

            if (values.glowEffect)
            {
                if (isFunction(values.glowEffect))
                {
                    item.glowEffect = values.glowEffect;
                }
                else
                {
                    item.glowEffect = Tw2Effect.from(values.glowEffect);
                }
            }

            if (values.items)
            {
                for (let i = 0; i < values.items.length; i++)
                {
                    item.CreateItem(values.items[i]);
                }
            }
        }

        if (!options || !options.skipUpdate)
        {
            item.Initialize();
        }

        return item;
    }

    /**
     * Spotlight set item constructor
     * @type {EveSpotlightSetItem}usageIndex:
     elements:    */
    static Item = EveSpotlightSetItem;

    /**
     * Vertex declarations
     * @type {*[]}
     */
    static vertexDeclarations = [
        {usage: "COLOR", usageIndex: 0, elements: 4},
        {usage: "TEXCOORD", usageIndex: 0, elements: 4},
        {usage: "TEXCOORD", usageIndex: 1, elements: 4},
        {usage: "TEXCOORD", usageIndex: 2, elements: 4},
        {usage: "TEXCOORD", usageIndex: 3, elements: 3},
        {usage: "TEXCOORD", usageIndex: 4, elements: 3}
    ];

    /**
     * Black definition
     * @param {*} r
     * @returns {*[]}
     */
    static black(r)
    {
        return [
            ["coneEffect", r.object],
            ["glowEffect", r.object],
            ["intensity", r.float],
            ["name", r.string],
            ["spotlightItems", r.array]
        ];
    }

}



