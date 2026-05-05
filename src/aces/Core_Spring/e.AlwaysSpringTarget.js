export const config = { deprecated: true, returnType: "number", description: "Deprecated. There is no direct Multi Spring replacement — always spring target is managed via 'Set always spring' and 'Set always spring target' actions.", params: [] };

export default function () { return this._getAlwaysSpringTarget(); }
