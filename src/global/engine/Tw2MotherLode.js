/**
 * Manages loaded resources
 *
 * @property {Object} _loadedObjects            - loaded resources
 * @property {{string:Array<eventLog>}} _errors - Not implemented yet
 * @class
 */
export class Tw2MotherLode
{
    constructor()
    {
        this._loadedObjects = {};
        this._errors = {};
    }

    /**
     * Adds an error log for a given path
     * @param {String} path
     * @param {Tw2Error|Error} err
     * @returns {Tw2Error|Error} err
     */
    AddError(path, err)
    {
        this._errors[path] = this._errors[path] || [];

        if (!this._errors[path].includes(err))
        {
            err.data = err.data || {};
            err.data.path = err.data.path || path;
            this._errors[path].push(err);
        }

        return err;
    }

    /**
     * Gets a path's error logs
     * @param {String} path
     * @returns {?Array<Tw2Error|Error>}
     */
    GetErrors(path)
    {
        return path && path in this._errors ? Object.assign([], this._errors[path]) : [];
    }

    /**
     * Gets the last error for a path
     * @param path
     * @returns {Tw2Error|Error|undefined}
     */
    GetLastError(path)
    {
        return path && path in this._errors ? this._errors[path].slice(-1)[0] : undefined;
    }

    /**
     * Checks if a path has any errors
     * @param {String} path
     * @returns {*|Boolean}
     */
    HasErrors(path)
    {
        return (path && path in this._errors);
    }

    /**
     * Finds a loaded object by it's file path
     * @param {String} path
     * @returns {Tw2LoadingObject|Tw2Resource}
     */
    Find(path)
    {
        if (path in this._loadedObjects)
        {
            return this._loadedObjects[path];
        }
        return null;
    }

    /**
     * Adds a loaded object
     * @param {String} path
     * @param {Tw2LoadingObject|Tw2Resource} obj
     */
    Add(path, obj)
    {
        this._loadedObjects[path] = obj;
    }

    /**
     * Removes a loaded object by it's file path
     * @param {String} path
     */
    Remove(path)
    {
        delete this._loadedObjects[path];
    }

    /**
     * Clears the loaded object object
     */
    Clear()
    {
        this._loadedObjects = {};
    }

    /**
     * Unloads all loaded objects and then clears the loadedObject object
     */
    UnloadAndClear()
    {
        for (const path in this._loadedObjects)
        {
            if (this._loadedObjects.hasOwnProperty(path))
            {
                this._loadedObjects[path].Unload();
            }
        }
        this._loadedObjects = {};
    }

    /**
     * Purges inactive loaded objects (resources that have been loaded but are not being actively used)
     * - Loaded objects can flagged with `doNotPurge` to ensure they are never removed
     * - Resource auto purging can be managed in `ccpwgl` or `ccpwgl_int.resMan` - {@link Tw2ResMan}
     *     ccpwgl.setResourceUnloadPolicy()
     *     ccpwgl_int.resMan.autoPurgeResources=true
     *     ccpwgl_int.resMan.purgeTime=30
     * @param {Number} curFrame - the current frame count
     * @param {Number} frameLimit - how many frames the object can stay alive for before being purged
     * @param {Number} frameDistance - how long the resource has been alive for
     */
    PurgeInactive(curFrame, frameLimit, frameDistance)
    {
        for (const path in this._loadedObjects)
        {
            if (this._loadedObjects.hasOwnProperty(path))
            {
                const res = this._loadedObjects[path];
                if (res.doNotPurge) continue;

                // Already purged
                if (res.IsPurged())
                {
                    this.Remove(path);
                    continue;
                }

                let reason;

                // Has errors
                if (res.HasErrors())
                {
                    reason = "error";
                }
                // Waiting for purge
                else if (res.IsUnloaded())
                {
                    reason = "unloaded";
                }
                // inactive
                else if (res.IsGood() && (curFrame - res.activeFrame) % frameLimit >= frameDistance && res.Unload())
                {
                    reason = "inactivity";
                }

                if (reason)
                {
                    res.OnPurged({message: `Purged (${reason})`});
                    this.Remove(path);
                }
            }
        }
    }
}