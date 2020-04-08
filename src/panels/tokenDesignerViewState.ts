import * as ttfCore from '../ttf/protos/core_pb';

export class TokenDesignerViewState {
    tokenName = 'Unamed token';
    tokenBase: ttfCore.Base.AsObject | null = null;
    propertySets: ttfCore.PropertySet.AsObject[] = [];
    behaviors: ttfCore.Behavior.AsObject[] = [];
    behaviorGroups: ttfCore.BehaviorGroup.AsObject[] = [];
}
