/* eslint no-unused-vars:0 */
import { meta, vec3, vec4, Tw2BaseClass } from "../../global";

/**
 * Tw2ParticleForce base class
 * @ccp N/A
 */
@meta.abstract
export class Tw2ParticleForce extends Tw2BaseClass
{

    /**
     * Applies forces
     * @param {Tw2ParticleElement} position - Position
     * @param {Tw2ParticleElement} velocity - Velocity
     * @param {Tw2ParticleElement} force    - force
     * @param {Number} [dt]                 - unused
     * @param {Number} [mass]               - unused
     */
    @meta.abstract
    ApplyForce(position, velocity, force, dt, mass)
    {

    }

    /**
     * Per frame update (Called before ApplyForce)
     * @param {number} dt - delta time
     */
    //@meta.abstract
    Update(dt)
    {

    }

    /**
     * Global and scratch variables
     * @type {*}
     */
    static global = {
        vec3_0: vec3.create(),
        vec3_1: vec3.create(),
        vec4_0: vec4.create(),
    };

}
