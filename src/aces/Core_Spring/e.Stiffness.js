export const config = { 
    returnType: "number", 
    description: "Get the current stiffness.", 
    params: [] };

export default function () { return this._getStiffness(); }
