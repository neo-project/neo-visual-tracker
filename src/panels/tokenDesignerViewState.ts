import * as ttfCore from '../ttf/protos/core_pb';

export class TokenDesignerViewState {
    tokenName = 'Unamed token';
    tokenBase: ttfCore.Base.AsObject | null = null;
}
