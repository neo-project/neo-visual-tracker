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

let artifactBeingDraggedOn: toolboxArtifact | null = null;
let artifactTypeBeingDraggedOn: artifactType | null = null;
let artifactBeingDraggedOff: toolboxArtifact | null = null;
let artifactTypeBeingDraggedOff: artifactType | null = null;
let artifactSelected: toolboxArtifact | null = null;
let canvas: HTMLElement | null = null;
let canvasTokenBase: HTMLElement | null = null;
let behaviorsArea: HTMLElement | null = null;
let draggingInspector: DragEvent | null = null;
let formula: HTMLElement | null = null;
let inspector: HTMLElement | null = null;
let inspectorDescription: HTMLElement | null = null;
let inspectorHelp: HTMLElement | null = null;
let inspectorProperties: HTMLElement | null = null;
let inspectorTitle: HTMLElement | null = null;
let taxonomy: TokenDesignerTaxonomy | null = null;
let viewState: TokenDesignerViewState | null = null;
let vsCodePostMessage: Function;

function addToTokenDesign() {
    if (viewState && artifactTypeBeingDraggedOn && artifactBeingDraggedOn) {
        const artifactId = artifactBeingDraggedOn.artifact?.artifactSymbol?.id;
        if (artifactId) {
            switch(artifactTypeBeingDraggedOn) {
                case 'base':
                    viewState.tokenBase = artifactBeingDraggedOn as ttfCore.Base.AsObject;
                    break;
                case 'propertySet':
                    if (!viewState.propertySets.find(_ => _.artifact?.artifactSymbol?.id === artifactId)) {
                        viewState.propertySets.push(artifactBeingDraggedOn as ttfCore.PropertySet.AsObject);
                    }
                    break;
                case 'behavior':
                    if (!viewState.behaviors.find(_ => _.artifact?.artifactSymbol?.id === artifactId)) {
                        viewState.behaviors.push(artifactBeingDraggedOn as ttfCore.Behavior.AsObject);
                    }
                    break;
                case 'behaviorGroup':
                    if (!viewState.behaviorGroups.find(_ => _.artifact?.artifactSymbol?.id === artifactId)) {
                        viewState.behaviorGroups.push(artifactBeingDraggedOn as ttfCore.BehaviorGroup.AsObject);
                    }
                    break;
            }
            postViewState();
        }
        renderCanvas();
        artifactBeingDraggedOn = null;
        artifactTypeBeingDraggedOn = null;
    }
}
    
function canvasIsEmpty() {
    if (!viewState) {
        return true;
    }
    return (viewState.tokenBase === null) &&
        !viewState.propertySets.length &&
        !viewState.behaviors.length &&
        !viewState.behaviorGroups.length;
}

function createInvalidToolElement() {
    const iconCharacter = '❓';
    const icon = document.createElement('div');
    icon.innerText = iconCharacter;
    icon.className = 'icon';
    const title = document.createElement('div');
    title.innerText = '(Unknown)';
    title.className = 'title';
    const element = document.createElement('span');
    element.className = 'toolElement';
    element.title = title.innerText;
    element.appendChild(icon);
    element.appendChild(title);
    return element;
}

function createToolElement(
    type: artifactType, 
    taxonomyArtifact: toolboxArtifact,
    isInToolbox: boolean) {

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

    const icon = document.createElement('span');
    icon.innerText = iconCharacter;
    icon.className = 'icon';
    const title = document.createElement('div');
    title.innerText = taxonomyArtifact.artifact?.name || '(Unknown)';
    title.className = 'title';
    const element = document.createElement('span');
    element.className = 'toolElement ' + 
        (artifactSelected?.artifact?.artifactSymbol?.id === taxonomyArtifact.artifact?.artifactSymbol?.id ? 'selected' : '');
    element.title = title.innerText;
    element.draggable = true;
    element.appendChild(icon);
    element.appendChild(title);
    if (isInToolbox) {
        element.ondragstart = () => {
            artifactBeingDraggedOff = null;
            artifactTypeBeingDraggedOff = null;
            artifactBeingDraggedOn = taxonomyArtifact;
            artifactTypeBeingDraggedOn = type;
        };
    } else {
        element.ondragstart = () => {
            artifactBeingDraggedOff = taxonomyArtifact;
            artifactTypeBeingDraggedOff = type;
            artifactBeingDraggedOn = null;
            artifactTypeBeingDraggedOn = null;
        };
        element.onclick = ev => {
            artifactSelected = taxonomyArtifact;
            renderCanvas();
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
    behaviorsArea = document.getElementById('behaviorsArea');
    formula = document.getElementById('formula');
    inspector = document.getElementById('inspector');
    inspectorDescription = document.getElementById('inspectorDescription');
    inspectorHelp = document.getElementById('inspectorHelp');
    inspectorTitle = document.getElementById('inspectorTitle');
    inspectorProperties = document.getElementById('inspectorProperties');
    if (canvas) {
        canvas.ondragover = ev => {
            ev.preventDefault();
            if (canvas && artifactTypeBeingDraggedOn) {
                canvas.className = 'dragHover';
            }
        };
        canvas.ondragleave = () => {
            if (canvas) {
                canvas.className = '';
            }
        };
        canvas.ondrop = ev => {
            ev.preventDefault();
            if (canvas) {
                canvas.className = '';
            }
            if (canvas && inspector && draggingInspector) {
                const canvasOffset = canvas.getBoundingClientRect();
                inspector.style.left = Math.round(ev.x - canvasOffset.x - draggingInspector.offsetX) + 'px';
                inspector.style.top = Math.round(ev.y - canvasOffset.y - draggingInspector.offsetY) + 'px';
                inspector.style.right = 'auto';
            }
            draggingInspector = null;
            addToTokenDesign();
        };
        canvas.onclick = ev => {
            if (ev.target === canvas) {
                artifactSelected = null;
                renderCanvas();
            }
        };
    }
    if (inspector) {
        inspector.ondragstart = ev => {
            draggingInspector = ev;
        };
    }
}

function postViewState() {
    vsCodePostMessage({ e: tokenDesignerEvents.Update, viewState });
    console.log('->', viewState);
}

function removeFromTokenDesign() {
    if (viewState && artifactTypeBeingDraggedOff && artifactBeingDraggedOff) {
        if (artifactTypeBeingDraggedOff === 'base') {
            viewState.tokenBase = null;
        } else {
            const artifactId = artifactBeingDraggedOff.artifact?.artifactSymbol?.id;
            viewState.propertySets = viewState.propertySets.filter(_ => _.artifact?.artifactSymbol?.id !== artifactId);
            viewState.behaviorGroups = viewState.behaviorGroups.filter(_ => _.artifact?.artifactSymbol?.id !== artifactId);
            viewState.behaviors = viewState.behaviors.filter(_ => _.artifact?.artifactSymbol?.id !== artifactId);
        }
        postViewState();
        renderCanvas();
        artifactBeingDraggedOff = null;
        artifactTypeBeingDraggedOff = null;
    }
}

function renderCanvas() {
    if (viewState && canvasTokenBase && behaviorsArea && formula && inspector) {
        htmlHelpers.clearChildren(canvasTokenBase);
        htmlHelpers.clearChildren(behaviorsArea);
        if (viewState.tokenBase) {
            canvasTokenBase.appendChild(createToolElement('base', viewState.tokenBase, false));
        } else if (!canvasIsEmpty()) {
            canvasTokenBase.appendChild(createInvalidToolElement());
        }
        for (const propertySet of viewState.propertySets) {
            canvasTokenBase.appendChild(createToolElement('propertySet', propertySet, false));
        }
        for (const behaviorGroup of viewState.behaviorGroups) {
            behaviorsArea.appendChild(createToolElement('behaviorGroup', behaviorGroup, false));
        }
        for (const behavior of viewState.behaviors) {
            behaviorsArea.appendChild(createToolElement('behavior', behavior, false));
        }
        formula.innerHTML = viewState.formulaHtml;
        formula.title = viewState.formulaTooling;
        renderInspector();   
    }
}

function renderInspector() {
    if (inspector && inspectorTitle && inspectorProperties && inspectorDescription) {
        inspector.style.display = artifactSelected ? 'block' : 'none';
        if (artifactSelected) {
            inspectorTitle.innerText = artifactSelected.artifact?.name || 'Inspector';
            inspectorDescription.innerText = artifactSelected.artifact?.artifactDefinition?.businessDescription || '';
            htmlHelpers.clearChildren(inspectorProperties);
            renderInspectorProperties(artifactSelected, artifactSelected.artifact?.artifactSymbol?.id || '');
        }
    }
}

function renderInspectorProperties(artifact: any, prefix: string) {
    if (inspectorProperties && viewState) {
        const propertyList = (artifact).propertiesList as ttfCore.Property.AsObject[] | undefined;
        for (const property of propertyList || []) {
            console.log(property);
            const row = document.createElement('tr');
            const th = document.createElement('th');
            th.innerText = property.name;
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.value = viewState.propertyValues[prefix + '/' + property.name] || property.templateValue;
            input.onchange = () => {
                if (viewState) {
                    viewState.propertyValues[prefix + '/' + property.name] = input.value;
                    postViewState();
                }
            };
            input.onblur = () => {
                if (artifactSelected && inspectorHelp) {
                    inspectorHelp.innerText = '';
                }
            };
            input.onfocus = () => {
                if (inspectorHelp) {
                    inspectorHelp.innerText = property.valueDescription;
                }
            };
            td.appendChild(input);
            row.appendChild(th);
            row.appendChild(td);
            inspectorProperties.appendChild(row);
        }
        const behaviorsList = (artifact).behaviorsList as ttfCore.BehaviorReference.AsObject[] | undefined;
        for (const behavior of behaviorsList || []) {
            renderInspectorProperties(behavior,  prefix + '/' + (behavior.reference?.id || ''));
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
        toolboxElement.ondragover = ev => {
            ev.preventDefault();
            if (artifactBeingDraggedOff) {
                toolboxElement.className = 'toolbox dragHover';
            }
        };
        toolboxElement.ondragleave = ev => {
            toolboxElement.className = 'toolbox';
        };
        toolboxElement.ondrop = ev => {
            ev.preventDefault();
            toolboxElement.className = 'toolbox';
            removeFromTokenDesign();
        };
    }
}

window.onload = initializePanel;