import { htmlHelpers } from "./htmlHelpers";
import { createSelectors } from "./createSelectors";

const createRenderers = {

    render: function(viewState: any) {
        
        htmlHelpers.setPlaceholder(createSelectors.CurrentPath, htmlHelpers.text(viewState.path));

        const filenameInput = document.querySelector(createSelectors.FilenameInput) as HTMLInputElement;
        filenameInput.value = viewState.filename;

        htmlHelpers.setPlaceholder(createSelectors.CombinedPath, htmlHelpers.text(viewState.combinedPath));
        htmlHelpers.showHide(createSelectors.FileDoesNotExistNotice, !viewState.configFileExists);
        htmlHelpers.showHide(createSelectors.FileExistsWarning, viewState.configFileExists);

        const allowOverwrite = document.querySelector(createSelectors.AllowOverwrite) as HTMLInputElement;
        const createButton = document.querySelector(createSelectors.CreateButton) as HTMLButtonElement;
        const mainForm = document.querySelector(createSelectors.MainForm) as HTMLFormElement;
        allowOverwrite.checked = viewState.allowOverwrite;
        createButton.disabled = !allowOverwrite.checked && viewState.configFileExists;
        mainForm.disabled = !allowOverwrite.checked && viewState.configFileExists;

        const nodeCountPicker = document.querySelector(createSelectors.NodeCountPicker) as HTMLElement;
        htmlHelpers.removeAllClass(nodeCountPicker, 'selected');
        htmlHelpers.addClass(document.querySelector(createSelectors.NodeCountOptionPrefix + viewState.nodeCount) as HTMLElement, 'selected');
      
        htmlHelpers.setPlaceholder(createSelectors.ResultText, htmlHelpers.text(viewState.result));
        htmlHelpers.showHide(createSelectors.ErrorMessage, viewState.showError);
        htmlHelpers.showHide(createSelectors.ViewResults, viewState.showSuccess);
        htmlHelpers.showHide(createSelectors.ViewDataEntry, !viewState.showSuccess);

        if (viewState.showSuccess) {
            (document.querySelector(createSelectors.CloseButton) as HTMLButtonElement).focus();
        } else {
            filenameInput.focus();
        }
    },

};

export { createRenderers };