// Names of events expected by the code running in neoTrackerPanel.ts:

const trackerEvents = {
    Init: 'init',
    PreviousBlocksPage: 'previousBlocks',
    NextBlocksPage: 'nextBlocks',
    FirstBlocksPage: 'firstBlocks',
    LastBlocksPage: 'lastBlocks',
    ShowBlock: 'showBlock',
    CloseBlock: 'closeBlock',
    ShowTransaction: 'showTransaction',
    CloseTransaction: 'closeTransaction',
    ShowAddress: 'showAddress',
    CloseAddress: 'closeAddress',
    ChangeHideEmpty: 'changeHideEmpty',
    Copy: 'copy',
    Search: 'search',
};

export { trackerEvents };