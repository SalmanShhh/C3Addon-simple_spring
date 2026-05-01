export const config = { 
    returnType: "number", 
    description: "Get current mesh column count.", 
    params: [] };

export default function () { return this._getMeshCols(); }
