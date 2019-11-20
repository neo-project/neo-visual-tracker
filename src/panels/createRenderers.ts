import { htmlHelpers } from "./htmlHelpers";
import { createSelectors } from "./createSelectors";

const createRenderers = {

    render: function(viewState: any) {
        
        htmlHelpers.setPlaceholder(createSelectors.CurrentPath, htmlHelpers.text(viewState.path));

        (document.querySelector(createSelectors.FilenameInput) as HTMLInputElement).value = viewState.filename;

        htmlHelpers.setPlaceholder(createSelectors.CombinedPath, htmlHelpers.text(viewState.combinedPath));
        htmlHelpers.showHide(createSelectors.FileDoesNotExistNotice, !viewState.configFileExists);
        htmlHelpers.showHide(createSelectors.FileExistsWarning, viewState.configFileExists);

        const allowOverwrite = document.querySelector(createSelectors.AllowOverwrite) as HTMLInputElement;
        const createButton = document.querySelector(createSelectors.CreateButton) as HTMLButtonElement;
        allowOverwrite.checked = viewState.allowOverwrite;
        createButton.disabled = !allowOverwrite.checked && viewState.configFileExists;

        const nodeCountPicker = document.querySelector(createSelectors.NodeCountPicker) as HTMLElement;
        htmlHelpers.removeAllClass(nodeCountPicker, 'selected');
        htmlHelpers.addClass(document.querySelector(createSelectors.NodeCountOptionPrefix + viewState.nodeCount) as HTMLElement, 'selected');
      
        htmlHelpers.setPlaceholder(createSelectors.ResultText, htmlHelpers.text(viewState.result));
        htmlHelpers.showHide(createSelectors.ErrorMessage, viewState.showError);
        htmlHelpers.showHide(createSelectors.ViewResults, viewState.showSuccess);
        htmlHelpers.showHide(createSelectors.ViewDataEntry, !viewState.showSuccess);

    },

};

export { createRenderers };