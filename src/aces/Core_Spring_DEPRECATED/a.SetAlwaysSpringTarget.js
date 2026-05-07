export const config = {
  isDeprecated: true,
  listName: "Set always spring target",
  displayText: "(DEPRECATED) Set always spring target to {0}",
  description: "Deprecated. Use 'Constant: Set spring' in the Multi Spring category instead.",
  params: [{ id: "target", name: "Target", desc: "The new target value to spring towards.", type: "number", initialValue: "0" }],
};

export default function (target) {
  this._setAlwaysSpringTarget(target);
}
