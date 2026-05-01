export const config = {
  listName: "Set always spring target",
  displayText: "Set always spring target to {0}",
  description: "Update the target for always spring mode without changing other settings. Only has an effect when always spring is enabled.",
  params: [{ id: "target", name: "Target", desc: "The new target value to spring towards.", type: "number", initialValue: "0" }],
};

export default function (target) {
  this._setAlwaysSpringTarget(target);
}
