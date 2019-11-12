import { htmlHelpers } from "./htmlHelpers";
import { createEvents } from "./createEvents";
import { createSelectors } from "./createSelectors";

const createRenderers = {

    render: function(viewState: any, updateViewState: Function, postMessage: Function) {
        
        
        
        htmlHelpers.setPlaceholder(createSelectors.CurrentPath, htmlHelpers.text(viewState.path));
        
        
    },

};

export { createRenderers };