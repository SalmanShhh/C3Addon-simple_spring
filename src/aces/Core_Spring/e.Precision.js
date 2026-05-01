export const config = { 
    returnType: "number", 
    description: "Get the current precision threshold.", 
    params: [] };

export default function () { return this._getPrecision(); }
