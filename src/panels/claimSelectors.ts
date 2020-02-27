// DOM query selectors for various elements in the claim.html template:

const claimSelectors = {
    ClaimableInfo: '#claimableInfo',
    ClaimButton: '#claim',
    CloseButton: '#close',
    DisplayUnavailable: '.display-unavailable',
    DisplayClaimable: '.display-claimable',
    DisplayWallet: '.display-wallet',
    DoSelfTransferCheckbox: '#doSelfTransfer',
    ErrorClaimableRetrievalFailure: '#errorClaimableRetrievalFailure',
    ErrorMessage: '#error-message',
    ErrorWalletHasNoClaimableGas: '#errorWalletHasNoClaimableGas',
    MainForm: '#data-entry-view form',
    LoadingIndicator: '.loading',
    RefreshClaimableLink: '#refreshClaimableLink',
    ResultForm: '#results-view form',
    ResultText: '.result-text',
    SearchLinkPlaceholder: '#searchLink',
    UnavailableInfo: '#unavailableInfo',
    ViewDataEntry: '#data-entry-view',
    ViewResults: '#results-view',
    WalletDropdown: '#walletDropdown',
};

export { claimSelectors };