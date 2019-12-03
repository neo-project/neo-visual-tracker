declare var acquireVsCodeApi: any;
window.onload = () => {
    (document.querySelector('#dismiss') as HTMLButtonElement).addEventListener(
        'click',
        () => acquireVsCodeApi().postMessage({}));
};