import { trackerEvents } from "./trackerEvents";

const htmlHelpers = {

    clearChildren: function(element: Element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },

    hideAll: function(selector: string) {
        const elements = document.querySelectorAll(selector);
        for (let i = 0; i < elements.length; i++) {
            (elements[i] as any).style.display = 'none';
        }
    },

    newCopyLink: function(text: string, postMessage: any) { 
        return this.newEventLink('Copy', trackerEvents.Copy, text, postMessage);
    },

    newEventLink: function(text: string, event: string, context: any | undefined, postMessage: any) {
        const link = document.createElement('a');
        link.href = '#';
        link.appendChild(document.createTextNode(text));
        this.setOnClickEvent(link, event, context, postMessage);
        return link;
    },

    newTableHead: function(...cells: Node[]) {
        return this.newTableRowHelper('th', cells);
    },

    newTableRow: function(...cells: Node[]) {
        return this.newTableRowHelper('td', cells);
    },

    newTableRowHelper: function(cellType: string, cells: Node[]) {
        const row = document.createElement('tr');
        for (let i = 0; i < cells.length; i++) {
            const cell = document.createElement(cellType);
            cell.appendChild(cells[i]);
            row.appendChild(cell);
        }
        return row;
    },

    number: function(n: number) {
        // avoid rounding small values to 0:
        return n.toLocaleString(undefined, { maximumFractionDigits: 20 });
    },

    setEnabled: function(selector: string, isEnabled: boolean) {
        const element = document.querySelector(selector);
        if (element) {
            (element as any).disabled = !isEnabled;
        }
    },

    setInnerPlaceholder: function(element: ParentNode, selector: string, value: Node) {
        const placeHolderElement = element.querySelector(selector);
        if (placeHolderElement) {
            this.clearChildren(placeHolderElement);
            placeHolderElement.appendChild(value);
        }
    },

    setOnClickEvent: function(element: string | Element, event: string, context: any | undefined, postMessage : any) {
        const clickable = (typeof element === 'string') ? document.querySelector(element) : element;
        if (clickable) {
            clickable.addEventListener('click', () => postMessage({ e: event, c: context }));
        }
    },

    setPlaceholder: function(selector: string, value: Node) {
        this.setInnerPlaceholder(document, selector, value);
    },

    showHide: function(selector: string, show: boolean) {
        const element: any = document.querySelector(selector);
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    },

    text: function(content: string) {
        return document.createTextNode(content);
    },
    
    time: function(unixTimestamp: number) {
        return (new Date(unixTimestamp * 1000)).toLocaleString();
    },
};

export { htmlHelpers };