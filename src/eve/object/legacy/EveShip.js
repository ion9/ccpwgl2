import {EveSpaceObject} from "./EveSpaceObject";

/**
 * EveShip
 *
 * @property {Array.<EveBoosterSet>} boosters
 * @property {Array.<EveTurretSet>} turretSets
 * @property {number} boosterGain
 * @class
 */
export class EveShip extends EveSpaceObject
{

    boosters = null;
    turretSets = [];
    boosterGain = 1;


    /**
     * Initializes the Eve Ship
     */
    Initialize()
    {
        super.Initialize();
        if (this.boosters)
        {
            this.RebuildBoosterSet();
        }
    }

    /**
     * Gets object resources
     * @param {Array} [out=[]] - Optional receiving array
     * @returns {Array.<Tw2Resource>} [out]
     */
    GetResources(out = [])
    {
        super.GetResources(out);

        for (let i = 0; i < this.turretSets.length; i++)
        {
            this.turretSets[i].GetResources(out);
        }

        if (this.boosters)
        {
            this.boosters.GetResources(out);
        }

        return out;
    }

    /**
     * Rebuilds the ship's booster set
     */
    RebuildBoosterSet()
    {
        if (this.boosters)
        {
            this.boosters.UpdateItemsFromLocators(this.FindLocatorsByPrefix("locator_booster"));
        }
    }

    /**
     * Rebuilds turret sets
     */
    RebuildTurretPositions()
    {
        for (let i = 0; i < this.turretSets.length; i++)
        {
            this.RebuildTurretSet(i);
        }
    }

    /**
     * Rebuilds a turret set
     * @param {number} index
     */
    RebuildTurretSet(index)
    {
        if (this.turretSets[index] === undefined) return;

        const
            turretSet = this.turretSets[index],
            prefix = turretSet.locatorName,
            count = this.GetLocatorCount(prefix),
            locators = [];

        for (let j = 0; j < count; ++j)
        {
            const
                name = prefix + String.fromCharCode("a".charCodeAt(0) + j),
                locator = this.FindLocatorByName(name);

            if (locator)
            {
                locator.FindBone(this.animation);
                locators.push(locator);
            }
        }

        turretSet.UpdateItemsFromLocators(locators);
    }

    /**
     * Updates view dependant data
     */
    UpdateViewDependentData()
    {
        super.UpdateViewDependentData();

        for (let i = 0; i < this.turretSets.length; ++i)
        {
            this.turretSets[i].UpdateViewDependentData();
        }
    }

    /**
     * Per frame update
     * @param {number} dt - deltaTime
     */
    Update(dt)
    {
        super.Update(dt);

        if (this.boosters)
        {
            if (this.boosters._locatorDirty)
            {
                this.RebuildBoosterSet();
            }

            this.boosters.Update(dt, this.transform);
        }

        for (let i = 0; i < this.turretSets.length; ++i)
        {
            if (this.turretSets[i]._locatorDirty)
            {
                this.RebuildTurretSet(i);
            }

            this.turretSets[i].Update(dt, this.transform);
        }
    }

    /**
     * Gets render batches
     * @param {number} mode
     * @param {Tw2BatchAccumulator} accumulator
     */
    GetBatches(mode, accumulator)
    {
        if (this.display)
        {
            super.GetBatches(mode, accumulator);

            this._perObjectData.vs.Get("Shipdata")[0] = this.boosterGain;
            this._perObjectData.ps.Get("Shipdata")[0] = this.boosterGain;

            if (this.boosters && this.visible.boosters)
            {
                this.boosters.GetBatches(mode, accumulator, this._perObjectData);
            }

            if (this.visible.turretSets)
            {
                if (this.lod > 1)
                {
                    for (let i = 0; i < this.turretSets.length; ++i)
                    {
                        this.turretSets[i].GetBatches(mode, accumulator, this._perObjectData, this.visible.firingEffects);
                    }
                }
                else if (this.visible.firingEffects)
                {
                    for (let i = 0; i < this.turretSets.length; ++i)
                    {
                        if (this.turretSets[i].firingEffect)
                        {
                            this.turretSets[i].firingEffect.GetBatches(mode, accumulator, this._perObjectData);
                        }
                    }
                }
            }
        }
    }

}