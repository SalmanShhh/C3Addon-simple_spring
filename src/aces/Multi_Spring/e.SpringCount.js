export const config = {
  returnType: "number",
  description: "Get how many named springs currently exist on this behavior instance.",
  params: [],
};

export default function () {
  return this._getSpringCount();
}