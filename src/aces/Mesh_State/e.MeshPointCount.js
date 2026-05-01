export const config = { 
    returnType: "number", 
    description: "Get total mesh point count for Repeat loop workflows.", 
    params: [] };

export default function () { return this._getMeshPointCount(); }
