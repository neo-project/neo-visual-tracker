import { htmlHelpers } from "./htmlHelpers";
import { invokeSelectors } from "./invokeSelectors";

const invokeRenderers = {
    render: function(viewState: any) {
        htmlHelpers.setPlaceholder(invokeSelectors.JsonFileName, htmlHelpers.text(viewState.neoExpressJsonFileName));
        htmlHelpers.setPlaceholder(invokeSelectors.JsonFilePath, htmlHelpers.text(viewState.neoExpressJsonFullPath));
    }
};

export { invokeRenderers };