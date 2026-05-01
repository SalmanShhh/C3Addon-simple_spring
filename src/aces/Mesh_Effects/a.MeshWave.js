export const config = {
  listName: "Do Mesh Effect: Wave",
  displayText: "Wave angle {0}, strength {1}, wavelength {2}, auto mesh {3}",
  description: "Push parallel bands of vertices in alternating directions, like a flag rippling in wind. Vertices move perpendicular to the wave travel direction.",
  params: [
    { id: "angle", name: "Angle", desc: "Direction the wave travels across the sprite in degrees. 0 = rightward (creates vertical bands, good for side-wind on a flag). 90 = downward (horizontal bands, good for vertical flutter).", type: "number", initialValue: "0" },
    { id: "strength", name: "Strength", desc: "Peak displacement per wave crest. 0.1 is a subtle flutter, 0.2 is a strong gust, 0.35+ is violent turbulence.", type: "number", initialValue: "0.15" },
    { id: "wavelength", name: "Wavelength", desc: "Spacing between wave crests in normalized units. 0.5 = two crests across the sprite. 0.25 = four crests (tighter waves). 1.0 = one smooth S-curve across the whole sprite.", type: "number", initialValue: "0.5" },
    { id: "autoMesh", name: "Auto Mesh", desc: "Yes: automatically create a 5×5 mesh grid if none exists (no setup required). No: skip the effect if no grid has been created yet with Create Grid.", type: "combo", initialValue: "yes", items: [{ yes: "Yes" }, { no: "No" }] },
  ],
};

export default function (angle, strength, wavelength, autoMesh) {
  this._meshWave(angle, strength, wavelength, autoMesh);
}
