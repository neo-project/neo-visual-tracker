import { htmlHelpers } from "./htmlHelpers";
import { createCheckpointSelectors } from "./createCheckpointSelectors";

const createCheckpointRenderers = {

    render: function(viewState: any) {
        
        htmlHelpers.setPlaceholder(createCheckpointSelectors.CurrentPath, htmlHelpers.text(viewState.path));

        const nameInput = document.querySelector(createCheckpointSelectors.CheckpointNameInput) as HTMLInputElement;
        nameInput.value = viewState.checkpointName;

        htmlHelpers.setPlaceholder(createCheckpointSelectors.CombinedPath, htmlHelpers.text(viewState.combinedPath));
        htmlHelpers.showHide(createCheckpointSelectors.FileDoesNotExistNotice, !viewState.fileExists);
        htmlHelpers.showHide(createCheckpointSelectors.FileExistsWarning, viewState.fileExists);

        const allowOverwrite = document.querySelector(createCheckpointSelectors.AllowOverwrite) as HTMLInputElement;
        const createButton = document.querySelector(createCheckpointSelectors.CreateButton) as HTMLButtonElement;
        const mainForm = document.querySelector(createCheckpointSelectors.MainForm) as HTMLFormElement;
        allowOverwrite.checked = viewState.allowOverwrite;
        createButton.disabled = !allowOverwrite.checked && viewState.fileExists;
        mainForm.disabled = !allowOverwrite.checked && viewState.fileExists;

        htmlHelpers.setPlaceholder(createCheckpointSelectors.ResultText, htmlHelpers.text(viewState.result));
        htmlHelpers.showHide(createCheckpointSelectors.ErrorMessage, viewState.showError);
        htmlHelpers.showHide(createCheckpointSelectors.ViewResults, viewState.showSuccess);
        htmlHelpers.showHide(createCheckpointSelectors.ViewDataEntry, !viewState.showSuccess);

        if (viewState.showSuccess) {
            (document.querySelector(createCheckpointSelectors.CloseButton) as HTMLButtonElement).focus();
        } else {
            nameInput.focus();
        }

    },

};

export { createCheckpointRenderers };