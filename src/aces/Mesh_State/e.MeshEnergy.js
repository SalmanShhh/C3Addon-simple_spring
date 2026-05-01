export const config = { 
    returnType: "number", 
    description: "Total kinetic + displacement energy across all mesh points. Returns 0 when the mesh is fully at rest. Use this to check whether the mesh is still animating e.g. trigger a sound or effect only while energy > 0.01.", 
    params: [] };

export default function () { return this._getMeshEnergy(); }
