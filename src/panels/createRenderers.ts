import { htmlHelpers } from "./htmlHelpers";
import { createEvents } from "./createEvents";
import { createSelectors } from "./createSelectors";

const createRenderers = {

    render: function(viewState: any, updateViewState: Function, postMessage: Function) {
        
        
        
        htmlHelpers.setPlaceholder(createSelectors.CurrentPath, htmlHelpers.text(viewState.path));
        (document.querySelector(createSelectors.FilenameInput) as HTMLInputElement).value = viewState.filename;
        
    },

};

export { createRenderers };