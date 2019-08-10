import {resMan} from "../../global";
import {Tw2Resource} from "./Tw2Resource";
import {Tw2ObjectReader} from "../reader/Tw2ObjectReader";
import {Tw2BlackReader} from "../reader/Tw2BlackReader";
import {ErrResourceExtensionUnregistered} from "../Tw2Error";

/**
 * Tw2LoadingObject
 *
 * @property {?String} _view                - object's .red file xml contents
 * @property {Number} _inPrepare            - the amount of child objects to prepare
 * @property {Array.<Object>} _objects      - the child objects to prepare
 * @property {Tw2ObjectReader} _constructor - A function for constructing child objects
 * @inheritDoc {Tw2Resource}
 * @class
 */
export class Tw2LoadingObject extends Tw2Resource
{

    path = "";
    _view = null;
    _inPrepare = null;
    _objects = [];
    _constructor = null;


    /**
     * Adds a child object
     * @param {Function} onResolved
     * @param {Function} onRejected
     * @returns {Object}
     */
    AddObject(onResolved, onRejected)
    {
        if (this.HasErrors())
        {
            if (onRejected)
            {
                onRejected(this.GetLastError());
            }
        }
        else
        {
            this._objects.push({onResolved, onRejected});
        }
    }

    /**
     * Prepare
     * @param response
     */
    Prepare(response)
    {
        const dot = this.path.lastIndexOf(".");
        if (dot === -1) return null;
        const ext = this.path.substr(dot + 1);

        if (this._inPrepare === null)
        {
            this._view = response;

            switch (ext)
            {
                case "red":
                    this._constructor = new Tw2ObjectReader(response);
                    break;

                case "black":
                    this._constructor = new Tw2BlackReader(response);
                    break;

                default:
                    throw new ErrResourceExtensionUnregistered({extension: ext});
            }

            this._inPrepare = 0;
            // Test construction once for errors??
            this._constructor.Construct();
        }

        while (this._inPrepare < this._objects.length)
        {
            const object = this._objects[this._inPrepare];

            try
            {
                object.onResolved(this._constructor.Construct());
            }
            catch (err)
            {
                if (object.onRejected)
                {
                    object.onRejected(err);
                    object.onRejected = null; // Only fire once
                }

                this.OnWarning({err, message: "Error preparing child object"});
            }

            this._inPrepare++;
        }

        this.OnPrepared();
    }

    /**
     * Fires on errors
     * @param {Error} err
     * @returns {Error}
     */
    OnError(err)
    {
        super.OnError(err);
        for (let i = 0; i < this._objects.length; i++)
        {
            const object = this._objects[i];
            if (object.onRejected)
            {
                object.onRejected(err);
            }
        }
        resMan.motherLode.Remove(this.path);
        this._objects = [];
        return err;
    }

    /**
     * Fires when prepared
     * @param log
     */
    OnPrepared(log)
    {
        resMan.motherLode.Remove(this.path);
        this._objects = [];
        super.OnPrepared(log);
    }

}

/**
 * HTTP request response type
 * @type {String}
 */
Tw2LoadingObject.prototype.requestResponseType = "arraybuffer";