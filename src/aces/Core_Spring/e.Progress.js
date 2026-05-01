export const config = { 
    returnType: "number", 
    description: "Get the animation progress from 0 (at start) to 1 (at target).", 
    params: [] };

export default function () { return this._getProgress(); }
