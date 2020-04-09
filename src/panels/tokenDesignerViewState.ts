import * as ttfCore from '../ttf/protos/core_pb';

export class TokenDesignerViewState {
    formulaHtml = '';
    formulaTooling = '';
    tokenName = 'Unnamed token';
    tokenBase: ttfCore.Base.AsObject | null = null;
    propertySets: ttfCore.PropertySet.AsObject[] = [];
    behaviors: ttfCore.Behavior.AsObject[] = [];
    behaviorGroups: ttfCore.BehaviorGroup.AsObject[] = [];
}
