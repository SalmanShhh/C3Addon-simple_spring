export const config = { 
    returnType: "number", 
    description: "Get the current velocity.", 
    params: [] };

export default function () { return this._getVelocity(); }
