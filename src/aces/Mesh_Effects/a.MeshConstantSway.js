export const config = {
  listName: "Mesh: Start constant sway",
  displayText: "Start constant sway angle {0}, strength {1}, wavelength {2}, speed {3}, auto mesh {4}",
  description: "Start continuous sinusoidal sway. The mesh keeps swaying automatically each tick until Stop Constant Sway is called. Great for grass, plants, cloth, or flags.",
  params: [
    { id: "angle", name: "Angle", desc: "Direction the wave travels in degrees. 0 = rightward (vertical swaying bands, ideal for grass). 90 = downward (horizontal bands, useful for hanging cloth).", type: "number", initialValue: "180" },
    { id: "strength", name: "Strength", desc: "Peak displacement per sway crest. 0.05 is very subtle rustle, 0.1 is natural breeze, 0.2+ is strong wind.", type: "number", initialValue: "0.08" },
    { id: "wavelength", name: "Wavelength", desc: "Spacing between sway peaks in normalized units. 0.5 gives two peaks across the sprite; 1.0 gives one broad S-curve.", type: "number", initialValue: "1.5" },
    { id: "speed", name: "Speed", desc: "Oscillation speed in cycles per second. 0.5 is slow/lazy, 1.0 is natural breeze, 2.0+ is stormy flutter.", type: "number", initialValue: "1" },
    { id: "autoMesh", name: "Auto Mesh", desc: "Yes: automatically create a mesh if none exists. No: skip if no mesh exists.", type: "combo", initialValue: "yes", items: [{ yes: "Yes" }, { no: "No" }] },
  ],
};

export default function (angle, strength, wavelength, speed, autoMesh) {
  this._startMeshSway(angle, strength, wavelength, speed, autoMesh);
}