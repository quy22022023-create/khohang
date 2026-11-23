import { hydrateIcons } from "./components/icons.js";
import { createConfirmation } from "./components/confirmation.js";
import { createAppContext } from "./core/app-context.js";
import { createRepositoryBrowser } from "./features/repository-browser.js";
import { createConnectionFeature } from "./features/connection.js";
import { createUploadFeature } from "./features/uploads.js";
import { initFolderFeature } from "./features/folders.js";
import { createDeleteFeature } from "./features/delete-file.js";
import { createBatchDeleteFeature } from "./features/delete-batch.js";

hydrateIcons();
const app = createAppContext();
const confirm = createConfirmation();
let connection, uploads, deletion, batchDeletion;
const browser = createRepositoryBrowser(app, {
  confirm,
  onConnect: () => connection.openConnect(),
  onDelete: (file) =>
    file.type === "dir"
      ? batchDeletion.removeItems([file])
      : deletion.removeFile(file),
  onQueueReset: () => uploads.renderQueue(),
});
uploads = createUploadFeature(app, { browser, confirm });
connection = createConnectionFeature(app, browser);
deletion = createDeleteFeature(app, { browser, confirm });
batchDeletion = createBatchDeleteFeature(app, { browser, confirm });
initFolderFeature(app, browser);

for (const button of document.querySelectorAll("[data-close]"))
  button.onclick = () => document.getElementById(button.dataset.close).close();
window.addEventListener("beforeunload", (event) => {
  if (app.state.busy) {
    event.preventDefault();
    event.returnValue = "";
  }
});
app.updateControls();
connection.restoreConnection();
