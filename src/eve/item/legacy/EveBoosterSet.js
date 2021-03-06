import {vec3, vec4, mat4, util, device} from "../../../global";
import {Tw2VertexDeclaration, Tw2PerObjectData, Tw2RenderBatch} from "../../../core";
import {EveObjectSet, EveObjectSetItem} from "./../EveObjectSet";
import {assignIfExists, get} from "../../../global/util";
import {Tw2Effect} from "../../../core/mesh";
import {EveSpriteSet} from "../EveSpriteSet";

/**
 * Booster render batch
 * @ccp N/A
 *
 * @property {EveBoosterSet} boosters
 */
export class EveBoosterBatch extends Tw2RenderBatch
{

    boosters = null;


    /**
     * Commits the batch
     * @param {String} technique - technique name
     */
    Commit(technique)
    {
        this.boosters.Render(technique);
    }

}


/**
 * Booster
 * TODO: Is this deprecated?
 * @ccp N/A
 *
 * @property {Number} atlas0             - The booster's atlas index 0
 * @property {Number} atlas1             - The booster's atlas index 1
 * @property {*} customValues            - An optional object containing custom values
 * @property {?String} locatorName       - The booster's locator name, if it was built from one
 * @property {Number} seed               - A random seed which affects any glows built from this booster
 * @property {mat4} transform            - The booster's local transform
 * @property {Boolean} updateFromLocator - Sets whether the booster should be updated when it's locator is
 * @property {{}} visible                - Visibility options
 * @property {Boolean} visible.halo      - Toggles halo visibility
 * @property {Boolean} visible.symHalo   - Toggles symmetrical halo visibility
 * @property {Boolean} visible.glow      - Toggles glow visibility
 * @property {Boolean} visible.trail     - Toggles trail visibility (not implemented)
 * @property {Number} wavePhase          - A random seed which affects the booster wave pattern
 */
export class EveBoosterSetItem extends EveObjectSetItem
{

    atlas0 = 0;
    atlas1 = 0;
    customValues = null;
    locatorName = null;
    seed = Math.random() * 7;
    transform = mat4.create();
    updateFromLocator = false;
    visible = {
        glow: true,
        symHalo: true,
        halo: true,
        trail: true,
        customValues: true
    };
    wavePhase = Math.random();

    /**
     * Gets the item's position
     * @param {vec3} out
     * @returns {vec3} out
     */
    GetPosition(out)
    {
        return mat4.getTranslation(out, this.transform);
    }

    /**
     * Gets the item's direction
     * @param {vec3} out
     * @returns {vec3} out
     */
    GetDirection(out)
    {
        vec3.set(out, this.transform[8], this.transform[9], this.transform[10]);
        vec3.normalize(out, out);
        const scale = this.GetScale();
        if (scale < 3) vec3.scale(out, out, scale / 3);
        return out;
    }

    /**
     * Gets the item's scale
     * @returns {Number}
     */
    GetScale()
    {
        const tr = this.transform;
        return Math.max(vec3.length([tr[0], tr[1], tr[2]]), vec3.length([tr[4], tr[5], tr[6]]));
    }

    /**
     * Creates an item from an object
     * @param {*} [values]
     * @returns {EveBoosterSetItem}
     */
    static from(values)
    {
        const item = new this();
        if (values)
        {
            util.assignIfExists(item.visible, values.visible, ["glow", "symHalo", "halo", "trail"]);
            util.assignIfExists(item, values, [
                "name", "display", "seed", "wavePhase", "transform",
                "locatorName", "updateFromLocator", "atlas0", "atlas1"
            ]);
        }
        return item;
    }

}

/**
 * Booster set
 * TODO: Is this deprecated?
 * @ccp EveBoosterSet
 * @property {Number} maxVel                   - (Not implemented)
 * @property {Boolean} alwaysOn                - (Not implemented)
 * @property {Tw2Effect} effect                - The booster's booster effect
 * @property {Number} glowDistance             - The distance between the booster's locators and glow sprites
 * @property {Number} glowScale                - The base scale of the booster's glow sprites
 * @property {vec4} glowColor                  - The color of the booster set's glow sprites
 * @property {?EveSpriteSet} glows             - The booster's glows (sprites)
 * @property {vec4} warpGlowColor              - The color of the booster set's glow sprites when warping (Not implemented)
 * @property {Number} haloDistance             - The distance between the booster set's locators and halo sprites
 * @property {Number} haloScaleX               - The base vertical scale of the booster set's halos
 * @property {Number} haloScaleY               - The base horizontal scale of the booster set's halos
 * @property {vec4} haloColor                  - The color of the booster set's halo sprites
 * @property {vec4} warpHaloColor              - The color of the booster set's halo sprites when warping (Not implemented)
 * @property {vec4} trailSize                  - The booster set's trail size (Not implemented)
 * @property {vec4} trailColor                 - The booster set's trail color (Not implemented)
 * @property {Number} symHaloDistance          - The distance between the booster set's locators and symmetrical halo sprites
 * @property {Number} symHaloScale             - The base scale of the booster set's symmetrical halos
 * @property {{}} visible                      - Visibility controls
 * @property {Boolean} visible.glows           - Toggles glow visibility
 * @property {Boolean} visible.symHalos        - Toggles symmetrical halo visibility
 * @property {Boolean} visible.halos           - Toggles halo visibility
 * @property {Boolean} visible.trails          - Toggles trails visibility (Not implemented)
 * @property {mat4} _parentTransform           - The booster set's parent's transform
 * @property {WebGLBuffer} _positions          - The booster set's webgl buffer
 * @property {Tw2VertexDeclaration} _decl      - The booster set's vertex declarations
 * @property {Tw2PerObjectData} _perObjectData - The booster set's shader data
 * @property {Boolean} _locatorDirty           - Identifies that the booster set needs to be rebuilt from locators
 * @class
 */
export class EveBoosterSet extends EveObjectSet
{
    // ccp
    alwaysOn = true;
    effect = null;
    glowColor = vec4.create();
    glows = null;
    glowScale = 1.0;
    haloColor = vec4.create();
    haloScaleX = 1.0;
    haloScaleY = 1.0;
    maxVel = 250;
    symHaloScale = 1.0;
    trailColor = vec4.create();
    trailSize = vec4.create();
    warpGlowColor = vec4.create();
    warpHaloColor = vec4.create();

    // ccpwgl
    glowDistance = 2.5;
    haloDistance = 3.01;
    symHaloDistance = 3;
    visible = {
        glows: true,
        symHalos: true,
        halos: true,
        trails: true
    };

    _parentTransform = mat4.create();
    _positions = null;
    _decl = Tw2VertexDeclaration.from(EveBoosterSet.vertexDeclarations);
    _perObjectData = Tw2PerObjectData.from(EveBoosterSet.perObjectData);
    _locatorDirty = true;
    _worldSpriteScale = 1;

    /**
     * Gets object resources
     * @param {Array} [out=[]] - Optional receiving array
     * @returns {Array.<Tw2Resource>} [out]
     */
    GetResources(out = [])
    {
        if (this.effect) this.effect.GetResources(out);
        return out;
    }

    /**
     * Rebuilds a booster set's items
     * @param {Boolean} [skipUpdate]
     */
    RebuildItems(skipUpdate)
    {
        const
            glows = this.glows,
            g = EveBoosterSet.global,
            spritePos = g.vec3_0;

        if (glows) glows.ClearItems();
        this._visibleItems = [];

        for (let i = 0; i < this.items.length; i++)
        {
            const item = this.items[i];
            //item.SetParent(this);

            if (item.display)
            {
                this._visibleItems.push(item);

                if (glows)
                {
                    const
                        src = item.customValues && item.customValues.display ? item.customValues : this,
                        pos = item.GetPosition(g.vec3_1),
                        dir = item.GetDirection(g.vec3_2),
                        scale = item.GetScale();

                    if (this.visible.glows && item.visible.glow)
                    {
                        glows.CreateItem({
                            name: item.name + "_glow",
                            position: vec3.subtract(spritePos, pos, vec3.scale(spritePos, dir, src.glowDistance)),
                            blinkRate: item.seed,
                            blinkPhase: item.seed,
                            minScale: src.glowScale * scale,
                            maxScale: src.glowScale * scale,
                            color: src.glowColor,
                            warpColor: src.warpGlowColor
                        });
                    }

                    if (this.visible.symHalos && item.visible.symHalo)
                    {
                        glows.CreateItem({
                            name: item.name + "_symHalo",
                            position: vec3.subtract(spritePos, pos, vec3.scale(spritePos, dir, src.symHaloDistance)),
                            blinkRate: item.seed,
                            blinkPhase: item.seed + 1,
                            minScale: src.symHaloScale * scale,
                            maxScale: src.symHaloScale * scale,
                            color: src.haloColor,
                            warpColor: src.warpHaloColor
                        });
                    }

                    if (this.visible.halos && item.visible.halo)
                    {
                        glows.CreateItem({
                            name: item.name + "_halo",
                            position: vec3.subtract(spritePos, pos, vec3.scale(spritePos, dir, src.haloDistance)),
                            blinkRate: item.seed,
                            blinkPhase: item.seed + 1,
                            minScale: src.haloScaleX * scale,
                            maxScale: src.haloScaleY * scale,
                            color: src.haloColor,
                            warpColor: src.warpHaloColor
                        });
                    }
                }

                item._dirty = false;
            }
        }
        this._dirty = true;
    }

    /**
     * Finds a booster item that belongs to a locator by it's name
     * @param {String} locatorName
     * @returns {?EveBoosterSetItem}
     */
    FindItemByLocatorName(locatorName)
    {
        for (let i = 0; i < this.items.length; i++)
        {
            if (this.items[i].locatorName && this.items[i].locatorName === locatorName)
            {
                return this.items[i];
            }
        }
        return null;
    }

    /**
     * Updates booster items that were built from locators
     * @param {Array.<EveLocator2>} locators
     */
    UpdateItemsFromLocators(locators)
    {
        const items = Array.from(this.items);

        for (let i = 0; i < locators.length; i++)
        {
            const {name, transform, atlasIndex0, atlasIndex1} = locators[i];

            let item = this.FindItemByLocatorName(name);
            if (!item)
            {
                this.CreateItem({
                    name: name,
                    locatorName: name,
                    updateFromLocator: true,
                    atlas0: atlasIndex0,
                    atlas1: atlasIndex1,
                    transform: transform
                });
            }
            else
            {
                items.splice(items.indexOf(item), 1);

                if (item.updateFromLocator)
                {
                    mat4.copy(item.transform, transform);
                    item.atlas0 = atlasIndex0;
                    item.atlas1 = atlasIndex1;
                    item.OnValueChanged();
                }
            }
        }

        for (let i = 0; i < items.length; i++)
        {
            if (items[i].locatorName !== null)
            {
                this.RemoveItem(items[i]);
                i--;
            }
        }

        this._locatorDirty = false;

        if (this._dirty)
        {
            this.Rebuild();
        }
    }

    /**
     * Rebuilds the booster set from it's parent's locators
     */
    RebuildItemsFromLocators()
    {
        this._locatorDirty = true;
    }

    /**
     * Per frame update
     * @param {Number} dt - DeltaTime
     * @param {mat4} parentMatrix
     * @param {Number} worldSpriteScale
     */
    Update(dt, parentMatrix, worldSpriteScale)
    {
        mat4.copy(this._parentTransform, parentMatrix);

        if (this._worldSpriteScale !== worldSpriteScale)
        {
            this._dirty = true;
        }

        super.Update(dt);

        if (this.glows)
        {
            this.glows.Update(dt, worldSpriteScale);
        }
    }

    /**
     * Unloads the booster's buffers
     * @param {Boolean} [skipEvent]
     */
    Unload(skipEvent)
    {
        if (this._positions)
        {
            device.gl.deleteBuffer(this._positions);
            this._positions = null;
        }

        if (this.glows)
        {
            this.glows.Unload(skipEvent);
        }

        super.Unload(skipEvent);
    }

    /**
     * Rebuilds the boosters
     */
    Rebuild()
    {
        this.RebuildItems();
        const itemCount = this._visibleItems.length;
        this._dirty = false;
        if (!itemCount)
        {
            super.Rebuild();
            return;
        }

        const
            d = device,
            box = EveBoosterSet._box,
            data = new Float32Array(itemCount * box.length * 6 * 28),
            order = [0, 3, 1, 3, 2, 1];

        let index = 0;
        for (let i = 0; i < itemCount; ++i)
        {
            const item = this._visibleItems[i];
            for (let b = 0; b < box.length; ++b)
            {
                for (let j = 0; j < order.length; ++j)
                {
                    data[index++] = box[b][order[j]][0];
                    data[index++] = box[b][order[j]][1];
                    data[index++] = box[b][order[j]][2];
                    data[index++] = 0;
                    data[index++] = 0;
                    data.set(item.transform, index);
                    index += 16;
                    data[index++] = 0;
                    data[index++] = 1;
                    data[index++] = 1;
                    data[index++] = 1;
                    data[index++] = item.wavePhase;
                    data[index++] = item.atlas0;
                    data[index++] = item.atlas1;
                }
            }
        }

        this._positions = d.gl.createBuffer();
        d.gl.bindBuffer(d.gl.ARRAY_BUFFER, this._positions);
        d.gl.bufferData(d.gl.ARRAY_BUFFER, data, d.gl.STATIC_DRAW);
        d.gl.bindBuffer(d.gl.ARRAY_BUFFER, null);
        this._positions.count = itemCount * 12 * 3;

        if (this.glows) this.glows.Rebuild();
        super.Rebuild();
    }

    /**
     * Gets render batches
     * @param {Number} mode
     * @param {Tw2BatchAccumulator} accumulator
     * @param {Tw2PerObjectData} perObjectData
     */
    GetBatches(mode, accumulator, perObjectData)
    {
        if (!this.display || mode !== device.RM_ADDITIVE || !this._positions || !this._visibleItems.length) return;

        if (this.effect)
        {
            const batch = new EveBoosterBatch();
            mat4.transpose(this._perObjectData.vs.Get("WorldMat"), this._parentTransform);
            this._perObjectData.vs.Set("Shipdata", perObjectData.vs.Get("Shipdata"));
            this._perObjectData.ps = perObjectData.ps;
            batch.perObjectData = this._perObjectData;
            batch.boosters = this;
            batch.renderMode = device.RM_ADDITIVE;
            accumulator.Commit(batch);
        }

        if (this.glows)
        {
            this.glows.GetBoosterGlowBatches(
                mode,
                accumulator,
                perObjectData,
                this._parentTransform,
                perObjectData.vs.Get("Shipdata")[0],
                0
            );
        }
    }

    /**
     * Renders the accumulated batches
     * @param {String} technique - technique name
     * @returns {Boolean}
     */
    Render(technique)
    {
        if (!this.effect || !this.effect.IsGood() || !this._positions) return false;

        const
            d = device,
            gl = d.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, this._positions);
        for (let pass = 0; pass < this.effect.GetPassCount(technique); ++pass)
        {
            this.effect.ApplyPass(technique, pass);
            if (!this._decl.SetDeclaration(d, this.effect.GetPassInput(technique, pass), 112)) return false;
            d.ApplyShadowState();
            gl.drawArrays(gl.TRIANGLES, 0, this._positions.count);
        }
        return true;
    }

    /**
     * Creates an eve booster from a plain object
     * @param {*} [values]
     * @param {*} [options]
     * @returns {EveBoosterSet}
     */
    static from(values, options)
    {
        const item = new EveBoosterSet();
        if (values)
        {
            assignIfExists(item, values, [
                "alwaysOn", "glowColor", "glowScale", "haloColor", "haloScaleX", "haloScaleY",
                "maxVel", "symHaloScale", "trailColor", "trailSize", "warpGlowColor",
                "name", "display", "glowDistance", "haloDistance", "symHaloDistance", "warpHaloColor"
            ]);

            // Allow for ccp spelling mistakes
            if (values.warpHalpColor !== undefined)
            {
                item.warpHaloColor = values.warpHalpColor;
            }

            if (values.visible)
            {
                assignIfExists(item.visible, values.visible, ["glows", "symHalos", "halos", "trails"]);
            }

            if (values.effect)
            {
                item.effect = Tw2Effect.from(values.effect);
            }

            if (values.glows)
            {
                item.glows = EveSpriteSet.from(values.glows);
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
     * The booster set's item constructor
     * @type {EveBoosterSetItem}
     */
    static Item = EveBoosterSetItem;

    /**
     * Per object data
     * @type {*}
     */
    static perObjectData = {
        vs: [
            ["WorldMat", 16],
            ["Shipdata", 4]
        ]
    };

    /**
     * Vertex declarations
     * @type {*}
     */
    static vertexDeclarations = [
        {usage: "POSITION", usageIndex: 0, elements: 3},
        {usage: "TEXCOORD", usageIndex: 0, elements: 2},
        {usage: "TEXCOORD", usageIndex: 1, elements: 4},
        {usage: "TEXCOORD", usageIndex: 2, elements: 4},
        {usage: "TEXCOORD", usageIndex: 3, elements: 4},
        {usage: "TEXCOORD", usageIndex: 4, elements: 4},
        {usage: "TEXCOORD", usageIndex: 5, elements: 4},
        {usage: "TEXCOORD", usageIndex: 6, elements: 1},
        {usage: "TEXCOORD", usageIndex: 7, elements: 2}
    ];

    /**
     * Internal helper
     * @type {Array}
     */
    static _box = [
        [
            [-1.0, -1.0, 0.0],
            [1.0, -1.0, 0.0],
            [1.0, 1.0, 0.0],
            [-1.0, 1.0, 0.0]
        ],
        [
            [-1.0, -1.0, -1.0],
            [-1.0, 1.0, -1.0],
            [1.0, 1.0, -1.0],
            [1.0, -1.0, -1.0]
        ],
        [
            [-1.0, -1.0, 0.0],
            [-1.0, 1.0, 0.0],
            [-1.0, 1.0, -1.0],
            [-1.0, -1.0, -1.0]
        ],
        [
            [1.0, -1.0, 0.0],
            [1.0, -1.0, -1.0],
            [1.0, 1.0, -1.0],
            [1.0, 1.0, 0.0]
        ],
        [
            [-1.0, -1.0, 0.0],
            [-1.0, -1.0, -1.0],
            [1.0, -1.0, -1.0],
            [1.0, -1.0, 0.0]
        ],
        [
            [-1.0, 1.0, 0.0],
            [1.0, 1.0, 0.0],
            [1.0, 1.0, -1.0],
            [-1.0, 1.0, -1.0]
        ]
    ];

}