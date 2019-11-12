import { htmlHelpers } from "./htmlHelpers";
import { createEvents } from "./createEvents";
import { createSelectors } from "./createSelectors";

const createRenderers = {

    render: function(viewState: any, updateViewState: Function, postMessage: Function) {
        
        htmlHelpers.setPlaceholder(createSelectors.CurrentPath, htmlHelpers.text(viewState.path));

        (document.querySelector(createSelectors.FilenameInput) as HTMLInputElement).value = viewState.filename;

        htmlHelpers.showHide(createSelectors.FileExistsWarning, viewState.configFileExists);

        htmlHelpers.setPlaceholder(createSelectors.CombinedPath, htmlHelpers.text(viewState.combinedPath));

        const allowOverwrite = document.querySelector(createSelectors.AllowOverwrite) as HTMLInputElement;
        allowOverwrite.checked = viewState.allowOverwrite;

        const nodeCountPicker = document.querySelector(createSelectors.NodeCountPicker) as HTMLElement;
        htmlHelpers.removeAllClass(nodeCountPicker, 'selected');
        htmlHelpers.addClass(document.querySelector(createSelectors.NodeCountOptionPrefix + viewState.nodeCount) as HTMLElement, 'selected');
        
    },

};

export { createRenderers };