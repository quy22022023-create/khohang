import { $, element } from "./dom.js";

export function createConfirmation() {
  const dialog = $("confirm-dialog");
  let resolvePending = null;

  function settle(value) {
    const resolve = resolvePending;
    resolvePending = null;
    dialog.close();
    resolve?.(value);
  }

  $("confirm-yes").onclick = () => settle(true);
  $("confirm-cancel").onclick = $("confirm-close").onclick = () =>
    settle(false);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    settle(false);
  });
  // Closing by another route must also release the awaiting operation.
  dialog.addEventListener("close", () => {
    if (dialog.open) return;
    const resolve = resolvePending;
    resolvePending = null;
    resolve?.(false);
  });

  return function confirmAction({
    title,
    description,
    items = [],
    note = "",
    yes = "Xác nhận",
    danger = false,
  }) {
    if (resolvePending) throw new Error("Một thao tác khác đang chờ xác nhận.");
    $("confirm-title").textContent = title;
    $("confirm-description").textContent = description;
    $("confirm-note").textContent = note;
    $("confirm-items").replaceChildren(
      ...items.map((item) => element("li", null, item)),
    );
    $("confirm-yes").textContent = yes;
    $("confirm-yes").className = `button ${danger ? "danger" : "primary"}`;
    return new Promise((resolve) => {
      resolvePending = resolve;
      dialog.showModal();
      $("confirm-cancel").focus();
    });
  };
}
