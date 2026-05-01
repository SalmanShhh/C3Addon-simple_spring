export const config = { 
    returnType: "number", 
    description: "Get the current spring value.", 
    params: [] };

export default function () { return this._getValue(); }
