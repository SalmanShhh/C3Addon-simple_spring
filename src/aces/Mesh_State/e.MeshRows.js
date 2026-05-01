export const config = { 
    returnType: "number", 
    description: "Get current mesh row count.", 
    params: [] };

export default function () { return this._getMeshRows(); }
