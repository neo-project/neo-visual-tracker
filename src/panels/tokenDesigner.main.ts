import { htmlHelpers } from "./htmlHelpers";
import { tokenDesignerEvents } from "./tokenDesignerEvents";
import { TokenDesignerTaxonomy } from "./tokenDesignerTaxonomy";
import { TokenDesignerViewState } from "./tokenDesignerViewState";

import * as ttfCore from '../ttf/protos/core_pb';

type toolboxArtifact = 
    ttfCore.Base.AsObject | 
    ttfCore.PropertySet.AsObject | 
    ttfCore.Behavior.AsObject | 
    ttfCore.BehaviorGroup.AsObject;

type artifactType = 'base' | 'propertySet' | 'behavior' | 'behaviorGroup';

declare var acquireVsCodeApi: any;

let artifactBeingDragged: toolboxArtifact | null = null;
let artifactTypeBeingDragged: artifactType | null = null;
let canvas: HTMLElement | null = null;
let canvasTokenBase: HTMLElement | null = null;
let taxonomy: TokenDesignerTaxonomy | null = null;
let viewState: TokenDesignerViewState | null = null;
let vsCodePostMessage: Function;

function addToTokenDesign() {
    if (viewState && artifactTypeBeingDragged && artifactBeingDragged) {
        switch(artifactTypeBeingDragged) {
            case 'base':
                viewState.tokenBase = artifactBeingDragged as ttfCore.Base.AsObject;
                break;
            case 'propertySet':
                break;
            case 'behavior':
                break;
            case 'behaviorGroup':
                break;
        }
        renderCanvas();
        artifactBeingDragged = null;
    }
}

function createToolElement(
    type: artifactType, 
    taxonomyArtifact: toolboxArtifact,
    draggable: boolean) {

    let iconCharacter = '❓';
    switch(type) {
        case 'base':
            iconCharacter = '🌐';
            break;
        case 'propertySet':
            iconCharacter = '🧱';
            break;
        case 'behavior':
            iconCharacter = '🎵';
            break;
        case 'behaviorGroup':
            iconCharacter = '🎶';
            break;
    }

    const icon = document.createElement('div');
    icon.innerText = iconCharacter;
    icon.className = 'icon';
    const title = document.createElement('div');
    title.innerText = taxonomyArtifact.artifact?.name || '(Unknown)';
    title.className = 'title';
    const element = document.createElement('span');
    element.className = 'toolElement';
    element.title = title.innerText;
    element.draggable = draggable;
    element.appendChild(icon);
    element.appendChild(title);
    if (draggable) {
        element.ondragstart = () => {
            artifactBeingDragged = taxonomyArtifact;
            artifactTypeBeingDragged = type;
        };
    }
    return element;
}

function handleMessage(message: any) {
    if (message.taxonomy) {
        console.log('Received taxonomy update', message.taxonomy);
        taxonomy = message.taxonomy;
        renderTaxonomy();
    }
    if (message.viewState) {
        console.log('Received viewState update', message.viewState);
        viewState = message.viewState;
        renderCanvas();
    }
}

function initializePanel() {
    vsCodePostMessage = acquireVsCodeApi().postMessage;
    window.addEventListener('message', msg => handleMessage(msg.data));
    vsCodePostMessage({ e: tokenDesignerEvents.Init });
    canvas = document.getElementById('canvas');
    canvasTokenBase = document.getElementById('canvasTokenBase');
    if (canvas) {
        canvas.ondragover = ev => {
            ev.preventDefault();
            if (canvas) {
                canvas.className = 'dragHover';
            }
        };
        canvas.ondragleave = () => {
            if (canvas) {
                canvas.className = '';
            }
        };
        canvas.ondrop = () => {
            if (canvas) {
                canvas.className = '';
            }
            addToTokenDesign();
        };
    }
}

function renderCanvas() {
    if (viewState && canvasTokenBase) {
        htmlHelpers.clearChildren(canvasTokenBase);
        if (viewState.tokenBase) {
            canvasTokenBase.appendChild(createToolElement('base', viewState.tokenBase, false));
        }
    }
}

function renderTaxonomy() {
    if (taxonomy) {
        renderToolbox('base', 'tokenBasesToolbox', taxonomy.baseTokenTypes);
        renderToolbox('propertySet', 'propertySetsToolbox', taxonomy.propertySets);
        renderToolbox('behavior', 'behaviorsToolbox', taxonomy.behaviors);
        renderToolbox('behaviorGroup', 'behaviorGroupsToolbox', taxonomy.behaviorGroups);
    }
}

function renderToolbox(
    type: artifactType, 
    elementId: string, 
    artifacts: toolboxArtifact[]) {

    const toolboxElement = document.getElementById(elementId);
    console.log('rendering toolbox', elementId, artifacts, toolboxElement);
    if (toolboxElement) {
        htmlHelpers.clearChildren(toolboxElement);
        for (const artifact of artifacts) {
            const toolElement = createToolElement(type, artifact, true);
            toolboxElement.appendChild(toolElement);
        }
    }
}

window.onload = initializePanel;