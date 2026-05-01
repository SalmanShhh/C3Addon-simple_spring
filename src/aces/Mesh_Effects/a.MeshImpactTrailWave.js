export const config = {
  listName: "Do Mesh Effect: Impact trail wave",
  displayText: "Impact trail wave at ({0}, {1}) angle {2}, strength {3}, wavelength {4}, trail width {5}, auto mesh {6}",
  description: "Create a directional banded wave from an impact path. Ideal for slash trails, dash wake distortion, and projectile fly-by pressure waves.",
  params: [
    { id: "centerX", name: "Origin X", desc: "Horizontal origin of the trail wave in normalized sprite space.", type: "number", initialValue: "0.5" },
    { id: "centerY", name: "Origin Y", desc: "Vertical origin of the trail wave in normalized sprite space.", type: "number", initialValue: "0.5" },
    { id: "angle", name: "Angle", desc: "Direction the trail wave travels in degrees. Match to attack or dash direction.", type: "number", initialValue: "0" },
    { id: "strength", name: "Strength", desc: "Wave displacement intensity. 0.08 subtle, 0.2 dramatic, 0.35+ extreme.", type: "number", initialValue: "0.16" },
    { id: "wavelength", name: "Wavelength", desc: "Spacing between alternating bands. Smaller values create tighter stripes.", type: "number", initialValue: "0.35" },
    { id: "trailWidth", name: "Trail Width", desc: "Width of the impact corridor around the travel axis. Smaller is tighter slash line; larger is broad shock path.", type: "number", initialValue: "0.25" },
    { id: "autoMesh", name: "Auto Mesh", desc: "Yes: automatically create a 5x5 mesh grid if none exists. No: skip if no mesh grid exists.", type: "combo", initialValue: "yes", items: [{ yes: "Yes" }, { no: "No" }] },
  ],
};

export default function (centerX, centerY, angle, strength, wavelength, trailWidth, autoMesh) {
  this._meshImpactTrailWave(centerX, centerY, angle, strength, wavelength, trailWidth, autoMesh);
}
