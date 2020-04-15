import { htmlHelpers } from "./htmlHelpers";
import { tokenDesignerEvents } from "./tokenDesignerEvents";
import { TokenDesignerTaxonomy } from "./tokenDesignerTaxonomy";

import * as ttfCore from '../ttf/protos/core_pb';

type toolboxArtifact = 
    ttfCore.Base.AsObject | 
    ttfCore.PropertySet.AsObject | 
    ttfCore.Behavior.AsObject | 
    ttfCore.BehaviorGroup.AsObject;

declare var acquireVsCodeApi: any;

class Dom {
    canvas = document.getElementById('canvas') as HTMLElement;
    canvasTokenBase = document.getElementById('canvasTokenBase') as HTMLElement;
    behaviorsArea = document.getElementById('behaviorsArea') as HTMLElement;
    formula = document.getElementById('formula') as HTMLElement;
    inspector = document.getElementById('inspector') as HTMLElement;
    inspectorDescription = document.getElementById('inspectorDescription') as HTMLElement;
    inspectorHelp = document.getElementById('inspectorHelp') as HTMLElement;
    inspectorTitle = document.getElementById('inspectorTitle') as HTMLElement;
    inspectorProperties = document.getElementById('inspectorProperties') as HTMLElement;
}

let dom: Dom;
let artifactBeingDraggedOn: toolboxArtifact | undefined = undefined;
let artifactBeingDraggedOff: toolboxArtifact | undefined = undefined;
let artifactSelected: toolboxArtifact | undefined = undefined;
let draggingInspector: DragEvent | undefined = undefined;
let taxonomy: TokenDesignerTaxonomy | undefined = undefined;
let tokenFormula: ttfCore.TemplateFormula.AsObject | undefined = undefined;
let vsCodePostMessage: Function;

function addToTokenDesign() {
    if (tokenFormula && artifactBeingDraggedOn) {
        const artifactId = artifactBeingDraggedOn.artifact?.artifactSymbol?.id;
        if (artifactId) {
            // ...
        }
        artifactBeingDraggedOn = undefined;
    }
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
    taxonomyArtifactId: string | undefined,
    isInToolbox: boolean) {

    let iconCharacter = '❓';
    let taxonomyArtifact: toolboxArtifact | undefined = undefined;
    taxonomyArtifact = taxonomy?.baseTokenTypes.find(_ => _.artifact?.artifactSymbol?.id === taxonomyArtifactId);
    if (taxonomyArtifact) {
        iconCharacter = '🌐';
    } else {
        taxonomyArtifact = taxonomy?.propertySets.find(_ => _.artifact?.artifactSymbol?.id === taxonomyArtifactId);
        if (taxonomyArtifact) {
            iconCharacter = '🧱';
        } else {
            taxonomyArtifact = taxonomy?.behaviors.find(_ => _.artifact?.artifactSymbol?.id === taxonomyArtifactId);
            if (taxonomyArtifact) {
                iconCharacter = '🎵';
            } else {
                taxonomyArtifact = taxonomy?.behaviorGroups.find(_ => _.artifact?.artifactSymbol?.id === taxonomyArtifactId);
                if (taxonomyArtifact) {
                    iconCharacter = '🎶';
                }
            }
        }
    }

    const icon = document.createElement('span');
    icon.innerText = iconCharacter;
    icon.className = 'icon';
    const title = document.createElement('div');
    title.innerText = taxonomyArtifact?.artifact?.name || '(Unknown)';
    title.className = 'title';
    const element = document.createElement('span');
    element.className = 'toolElement ' + 
        (artifactSelected?.artifact?.artifactSymbol?.id === taxonomyArtifact?.artifact?.artifactSymbol?.id ? 'selected' : '');
    element.title = title.innerText;
    element.draggable = true;
    element.appendChild(icon);
    element.appendChild(title);
    if (isInToolbox) {
        element.ondragstart = () => {
            artifactBeingDraggedOff = undefined;
            artifactBeingDraggedOn = taxonomyArtifact;
        };
    } else {
        element.ondragstart = () => {
            artifactBeingDraggedOff = taxonomyArtifact;
            artifactBeingDraggedOn = undefined;
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
    if (message.formula) {
        console.log('Received TokenFormula update', message.formula);
        tokenFormula = message.formula;
        renderCanvas();
    }
}

function initializePanel() {
    dom = new Dom();
    vsCodePostMessage = acquireVsCodeApi().postMessage;
    window.addEventListener('message', msg => handleMessage(msg.data));
    vsCodePostMessage({ e: tokenDesignerEvents.Init });
    dom.canvas.ondragover = ev => {
        ev.preventDefault();
        if (artifactBeingDraggedOn) {
            dom.canvas.className = 'dragHover';
        }
    };
    dom.canvas.ondragleave = () => {
        dom.canvas.className = '';
    };
    dom.canvas.ondrop = ev => {
        ev.preventDefault();
        dom.canvas.className = '';
        if (draggingInspector) {
            const canvasOffset = dom.canvas.getBoundingClientRect();
            dom.inspector.style.left = Math.round(ev.x - canvasOffset.x - draggingInspector.offsetX) + 'px';
            dom.inspector.style.top = Math.round(ev.y - canvasOffset.y - draggingInspector.offsetY) + 'px';
            dom.inspector.style.right = 'auto';
        }
        draggingInspector = undefined;
        addToTokenDesign();
    };
    dom.canvas.onclick = ev => {
        if (ev.target === dom.canvas) {
            artifactSelected = undefined;
            renderCanvas();
        }
    };    
    dom.inspector.ondragstart = ev => {
        draggingInspector = ev;
    };
}

function removeFromTokenDesign() {
    if (tokenFormula && artifactBeingDraggedOff) {
        vsCodePostMessage({ e: tokenDesignerEvents.Remove, id: artifactBeingDraggedOff.artifact?.artifactSymbol?.id });
        artifactBeingDraggedOff = undefined;
    }
}

function renderCanvas() {
    htmlHelpers.clearChildren(dom.canvasTokenBase);
    htmlHelpers.clearChildren(dom.behaviorsArea);
    if (tokenFormula) {
        if (tokenFormula.tokenBase?.base?.id) {
            dom.canvasTokenBase.appendChild(createToolElement(tokenFormula.tokenBase?.base?.id, false));
        } else {
            dom.canvasTokenBase.appendChild(createInvalidToolElement());
        }
        for (const propertySet of tokenFormula.propertySetsList) {
            dom.canvasTokenBase.appendChild(createToolElement(propertySet.propertySet?.id, false));
        }
        for (const behaviorGroup of tokenFormula.behaviorGroupsList) {
            dom.behaviorsArea.appendChild(createToolElement(behaviorGroup.behaviorGroup?.id, false));
        }
        for (const behavior of tokenFormula.behaviorsList) {
            dom.behaviorsArea.appendChild(createToolElement(behavior.behavior?.id, false));
        }
        dom.formula.innerHTML = tokenFormula.artifact?.artifactSymbol?.visual || '';
        dom.formula.title = tokenFormula.artifact?.artifactSymbol?.tooling || '';
    }
    renderInspector();   
}

function renderInspector() {
    dom.inspector.style.display = artifactSelected ? 'block' : 'none';
    if (artifactSelected) {
        dom.inspectorTitle.innerText = artifactSelected.artifact?.name || 'Inspector';
        dom.inspectorDescription.innerText = artifactSelected.artifact?.artifactDefinition?.businessDescription || '';
        htmlHelpers.clearChildren(dom.inspectorProperties);
        renderInspectorProperties(artifactSelected, artifactSelected.artifact?.artifactSymbol?.id || '');
    }
}

function renderInspectorProperties(artifact: any, prefix: string) {
    const propertyList = (artifact).propertiesList as ttfCore.Property.AsObject[] | undefined;
    for (const property of propertyList || []) {
        console.log(property);
        const row = document.createElement('tr');
        const th = document.createElement('th');
        th.innerText = property.name;
        const td = document.createElement('td');
        const input = document.createElement('input');
        // input.value = viewState.propertyValues[prefix + '/' + property.name] || property.templateValue;
        // input.onchange = () => {
        //     if (viewState) {
        //         viewState.propertyValues[prefix + '/' + property.name] = input.value;
        //         postViewState();
        //     }
        // };
        // input.onblur = () => {
        //     if (artifactSelected && inspectorHelp) {
        //         inspectorHelp.innerText = '';
        //     }
        // };
        // input.onfocus = () => {
        //     if (inspectorHelp) {
        //         inspectorHelp.innerText = property.valueDescription;
        //     }
        // };
        td.appendChild(input);
        row.appendChild(th);
        row.appendChild(td);
        dom.inspectorProperties.appendChild(row);
    }
    const behaviorsList = (artifact).behaviorsList as ttfCore.BehaviorReference.AsObject[] | undefined;
    for (const behavior of behaviorsList || []) {
        renderInspectorProperties(behavior,  prefix + '/' + (behavior.reference?.id || ''));
    }
}

function renderTaxonomy() {
    if (taxonomy) {
        renderToolbox('tokenBasesToolbox', taxonomy.baseTokenTypes);
        renderToolbox('propertySetsToolbox', taxonomy.propertySets);
        renderToolbox('behaviorsToolbox', taxonomy.behaviors);
        renderToolbox('behaviorGroupsToolbox', taxonomy.behaviorGroups);
    }
}

function renderToolbox(
    elementId: string, 
    artifacts: toolboxArtifact[]) {

    const toolboxElement = document.getElementById(elementId);
    console.log('rendering toolbox', elementId, artifacts, toolboxElement);
    if (toolboxElement) {
        htmlHelpers.clearChildren(toolboxElement);
        for (const artifact of artifacts) {
            const toolElement = createToolElement(artifact.artifact?.artifactSymbol?.id, true);
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