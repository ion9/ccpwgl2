import {resMan} from "../../global";
import {Tw2Error} from "../Tw2Error";
import {isFunction} from "../../global/util";

/**
 * Tw2Resource base class
 *
 * @property {Number} activeFrame
 * @property {Number} doNotPurge
 * @property {String} path
 * @property {Set} _notifications
 * @property {Number} _state
 * @property {Array<Error>} _errors
 */
export class Tw2Resource
{
    path = "";
    activeFrame = 0;
    doNotPurge = 0;

    _notifications = new Set();
    _state = Tw2Resource.State.NO_INIT;
    _errors = [];

    /**
     * Checks if the resource is good and keeps it alive
     * TODO: Replace with explicit calls to "IsPrepared"
     * @returns {boolean}
     */
    IsGood()
    {
        this.KeepAlive();
        return this.IsPrepared() || this.IsLoaded();
    }

    /**
     * Checks to see if the resource is loading
     * @returns {Boolean}
     */
    IsRequested()
    {
        return this._state === Tw2Resource.State.REQUESTED;
    }

    /**
     * Checks if the resource has been loaded
     * @returns {boolean}
     */
    IsLoaded()
    {
        return this._state === Tw2Resource.State.LOADED;
    }

    /**
     * Checks if the resource has been prepared
     * @returns {boolean}
     */
    IsPrepared()
    {
        return this._state === Tw2Resource.State.PREPARED;
    }

    /**
     * Checks if the resource has been unloaded
     * @returns {boolean}
     */
    IsUnloaded()
    {
        return this._state === Tw2Resource.State.UNLOADED;
    }

    /**
     * Checks to see if the resource has been purged
     * @returns {Boolean}
     */
    IsPurged()
    {
        return this._state === Tw2Resource.State.PURGED;
    }

    /**
     * Checks if the resource has errors
     * @returns {Boolean}
     */
    HasErrors()
    {
        return this._state === Tw2Resource.State.ERROR;
    }

    /**
     * Checks if the resource has completed all processing
     * @returns {Boolean}
     */
    HasCompleted()
    {
        return this.HasErrors() || this.IsPurged() || this.IsPrepared();
    }

    /**
     * Unloads the resource
     * @param {eventLog} [eventLog]
     * @returns {Boolean}
     */
    Unload(eventLog)
    {
        return false;
    }

    /**
     * Reloads the resource
     * @param {eventLog} [eventLog]
     */
    Reload(eventLog)
    {
        this.Unload({hide:true});
        if (this.IsPurged() || this.IsUnloaded())
        {
            resMan.LoadResource(this, eventLog);
        }
    }

    /**
     * Keeps the resource from being purged
     */
    KeepAlive()
    {
        this.activeFrame = resMan.activeFrame;
        if (this.IsPurged() || this.IsUnloaded())
        {
            this.Reload();
        }
    }

    /**
     * Gets the resource's errors
     * @returns {?Array<Tw2Error|Error>}
     */
    GetErrors()
    {
        return Array.from(this._errors);
    }

    /**
     * Gets the resource's last error
     * @returns {Tw2Error|Error}
     */
    GetLastError()
    {
        return this._errors[0];
    }

    /**
     * Fires on warnings
     * @param {*} [eventLog]
     */
    OnWarning(eventLog)
    {
        resMan.OnResEvent("warning", this.path, eventLog);
    }

    /**
     * Fires on debugs
     * @param {*} eventLog
     */
    OnDebug(eventLog)
    {
        resMan.OnResEvent("debug", this.path, eventLog);
    }

    /**
     * Fires on errors
     * @param {Error} err
     * @returns {Error}
     */
    OnError(err = new Tw2Error())
    {
        if (!this._errors.includes(err))
        {
            this._errors.unshift(err);
        }

        const doUnload = !this.IsUnloaded() || !this.IsPurged();
        this._SetState(Tw2Resource.State.ERROR);
        if (doUnload) this.Unload({hide: true});

        resMan.OnResEvent("error", this.path, err);
        this.UpdateNotifications(Tw2Resource.Callback.ERROR, err);
        return err;
    }

    /**
     * LoadStarted
     * @param {*} [eventLog]
     */
    OnRequested(eventLog)
    {
        const reloading = this._state !== Tw2Resource.State.NO_INIT;
        if (this._SetState(Tw2Resource.State.REQUESTED))
        {
            resMan.OnResEvent(reloading ? "reloading" : "requested", this.path, eventLog);
            this.UpdateNotifications(Tw2Resource.Callback.REQUESTED);
        }
    }

    /**
     * LoadFinished
     * @param {*} [eventLog]
     */
    OnLoaded(eventLog)
    {
        if (this._SetState(Tw2Resource.State.LOADED))
        {
            resMan.OnResEvent("loaded", this.path, eventLog);
            this.UpdateNotifications(Tw2Resource.Callback.LOADED);
        }
    }

    /**
     * PrepareFinished
     * @param {*} [eventLog]
     */
    OnPrepared(eventLog)
    {
        if (this._SetState(Tw2Resource.State.PREPARED))
        {
            resMan.OnResEvent("prepared", this.path, eventLog);
            this.UpdateNotifications(Tw2Resource.Callback.PREPARED);
        }
    }

    /**
     * Fires when the resource has been unloads
     * @param {*} [eventLog]
     */
    OnUnloaded(eventLog)
    {
        if (this._SetState(Tw2Resource.State.UNLOADED))
        {
            resMan.OnResEvent("unloaded", this.path, eventLog);
            this.UpdateNotifications(Tw2Resource.Callback.UNLOADED);
        }
    }

    /**
     * Fires when the resource is purged
     * @param eventLog
     */
    OnPurged(eventLog)
    {
        this._SetState(Tw2Resource.State.PURGED);
        resMan.OnResEvent("purged", this.path, eventLog);
        this.UpdateNotifications(Tw2Resource.Callback.PURGED);
    }

    /**
     * Sets state
     * @param state
     * @returns {boolean}
     */
    _SetState(state)
    {
        if (this._state !== Tw2Resource.State.ERROR)
        {
            this._state = state;
            return true;
        }
        return false;
    }

    /**
     * Wraps callbacks as a notification
     * - The notification is removed as soon as the resource is prepared or errored
     * @param {Function} [onResolved] - Callback fired when prepared or purged
     * @param {Function} [onRejected] - Callback fired when errored
     * @param {Function} [onProgress] - Callback fires on any progress
     */
    RegisterCallbacks(onResolved, onRejected, onProgress)
    {
        this.KeepAlive();
        if (!onResolved && !onRejected) return;

        /**
         * Handles resource events
         * @param {Tw2Resource} res
         * @returns {Boolean}
         */
        const handler = function(res)
        {
            if (res.HasCompleted())
            {
                const err = res.GetLastError();
                if (err)
                {
                    if (onRejected) onRejected(err);
                }
                else
                {
                    if (onResolved) onResolved(res);
                }
                return true;
            }

            if (onProgress)
            {
                onProgress(res);
            }

            return false;
        };

        this.RegisterNotification(handler);
    }

    /**
     * Checks if a notification is registered
     * @param {*} notification
     * @returns {boolean}
     */
    HasNotification(notification)
    {
        return this._notifications.has(notification);
    }

    /**
     * Registers a notification
     * @param {*} notification
     */
    RegisterNotification(notification)
    {
        if (this.HasNotification(notification)) return;

        let funcName, argument;
        switch (this._state)
        {
            case Tw2Resource.State.ERROR:
                funcName = Tw2Resource.Callback.ERROR;
                argument = this.GetLastError();
                break;

            case Tw2Resource.State.REQUESTED:
                funcName = Tw2Resource.Callback.REQUESTED;
                break;

            case Tw2Resource.State.LOADED:
                funcName = Tw2Resource.Callback.LOADED;
                break;

            case Tw2Resource.State.PREPARED:
                funcName = Tw2Resource.Callback.PREPARED;
                break;

            case Tw2Resource.State.UNLOADED:
                funcName = Tw2Resource.Callback.UNLOADED;
                break;

            case Tw2Resource.State.PURGED:
                funcName = Tw2Resource.Callback.PURGED;
                break;
        }

        // Don't add notification if it returns true
        if (isFunction(notification))
        {
            if (notification(this, argument)) return;
        }
        else if (funcName && funcName in notification)
        {
            if (notification[funcName](this, argument)) return;
        }

        this._notifications.add(notification);
    }

    /**
     * Deregisters a notification
     * @param {*} notification
     */
    UnregisterNotification(notification)
    {
        this._notifications.delete(notification);
    }

    /**
     * Updates a notification
     * @param {String} funcName - The function name to call
     * @param {*} [argument]    - An optional argument
     */
    UpdateNotifications(funcName, argument, log)
    {
        resMan.OnResEvent(funcName, this.path, log);

        this._notifications.forEach(notification =>
        {
            let remove = false;

            if (isFunction(notification))
            {
                remove = notification(this, argument);
            }
            else if (funcName && funcName in notification)
            {
                remove = notification[funcName](this, argument);
            }

            if (remove)
            {
                this.UnregisterNotification(notification);
            }
        });
    }

    /**
     * Clears all notifications
     */
    ClearNotifications()
    {
        this._notifications.clear();
    }

    /**
     * Identifies that this object is a resource
     * @type {boolean}
     * @private
     */
    static __isResource = true;

    /**
     * Resource states
     * @type {*}
     */
    static State = {
        ERROR: -3,
        PURGED: -2,
        UNLOADED: -1,
        NO_INIT: 0,
        REQUESTED: 1,
        LOADED: 2,
        PREPARED: 3
    };

    /**
     * Notification callback names
     * @type {*}
     */
    static Callback = {
        ERROR: "OnResError",
        PURGED: "OnResPurged",
        UNLOADED: "OnResUnloaded",
        REQUESTED: "OnResRequested",
        LOADED: "OnResLoaded",
        PREPARED: "OnResPrepared"
    };

}

/**
 * An optional function for when the resource handles it's own loading
 * -  If the method returns false then the resource manager will handle the http request
 * @type {?Function}
 * @returns {Boolean}
 */
Tw2Resource.prototype.DoCustomLoad = null;

/**
 * HTTP request response type
 * @type {null}
 */
Tw2Resource.prototype.requestResponseType = null;