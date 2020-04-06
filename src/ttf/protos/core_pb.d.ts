// package: taxonomy.model.core
// file: core.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as google_protobuf_any_pb from "google-protobuf/google/protobuf/any_pb";
import * as artifact_pb from "./artifact_pb";

export class Base extends jspb.Message { 

    hasArtifact(): boolean;
    clearArtifact(): void;
    getArtifact(): artifact_pb.Artifact | undefined;
    setArtifact(value?: artifact_pb.Artifact): void;

    getTokenType(): artifact_pb.TokenType;
    setTokenType(value: artifact_pb.TokenType): void;

    getTokenUnit(): artifact_pb.TokenUnit;
    setTokenUnit(value: artifact_pb.TokenUnit): void;

    getRepresentationType(): artifact_pb.RepresentationType;
    setRepresentationType(value: artifact_pb.RepresentationType): void;

    getValueType(): artifact_pb.ValueType;
    setValueType(value: artifact_pb.ValueType): void;

    getSupply(): artifact_pb.Supply;
    setSupply(value: artifact_pb.Supply): void;

    getName(): string;
    setName(value: string): void;

    getSymbol(): string;
    setSymbol(value: string): void;

    getOwner(): string;
    setOwner(value: string): void;

    getQuantity(): number;
    setQuantity(value: number): void;

    getDecimals(): number;
    setDecimals(value: number): void;


    getTokenPropertiesMap(): jspb.Map<string, string>;
    clearTokenPropertiesMap(): void;

    getConstructorName(): string;
    setConstructorName(value: string): void;


    hasConstructor(): boolean;
    clearConstructor(): void;
    getConstructor(): google_protobuf_any_pb.Any | undefined;
    setConstructor(value?: google_protobuf_any_pb.Any): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Base.AsObject;
    static toObject(includeInstance: boolean, msg: Base): Base.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Base, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Base;
    static deserializeBinaryFromReader(message: Base, reader: jspb.BinaryReader): Base;
}

export namespace Base {
    export type AsObject = {
        artifact?: artifact_pb.Artifact.AsObject,
        tokenType: artifact_pb.TokenType,
        tokenUnit: artifact_pb.TokenUnit,
        representationType: artifact_pb.RepresentationType,
        valueType: artifact_pb.ValueType,
        supply: artifact_pb.Supply,
        name: string,
        symbol: string,
        owner: string,
        quantity: number,
        decimals: number,

        tokenPropertiesMap: Array<[string, string]>,
        constructorName: string,
        constructor?: google_protobuf_any_pb.Any.AsObject,
    }
}

export class Bases extends jspb.Message { 
    clearBaseList(): void;
    getBaseList(): Array<Base>;
    setBaseList(value: Array<Base>): void;
    addBase(value?: Base, index?: number): Base;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Bases.AsObject;
    static toObject(includeInstance: boolean, msg: Bases): Bases.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Bases, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Bases;
    static deserializeBinaryFromReader(message: Bases, reader: jspb.BinaryReader): Bases;
}

export namespace Bases {
    export type AsObject = {
        baseList: Array<Base.AsObject>,
    }
}

export class BaseReference extends jspb.Message { 

    hasReference(): boolean;
    clearReference(): void;
    getReference(): artifact_pb.ArtifactReference | undefined;
    setReference(value?: artifact_pb.ArtifactReference): void;

    getValueType(): artifact_pb.ValueType;
    setValueType(value: artifact_pb.ValueType): void;

    getSupply(): artifact_pb.Supply;
    setSupply(value: artifact_pb.Supply): void;

    getName(): string;
    setName(value: string): void;

    getSymbol(): string;
    setSymbol(value: string): void;

    getOwner(): string;
    setOwner(value: string): void;

    getQuantity(): number;
    setQuantity(value: number): void;

    getDecimals(): number;
    setDecimals(value: number): void;


    getTokenPropertiesMap(): jspb.Map<string, string>;
    clearTokenPropertiesMap(): void;

    getConstructorName(): string;
    setConstructorName(value: string): void;


    hasConstructor(): boolean;
    clearConstructor(): void;
    getConstructor(): google_protobuf_any_pb.Any | undefined;
    setConstructor(value?: google_protobuf_any_pb.Any): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BaseReference.AsObject;
    static toObject(includeInstance: boolean, msg: BaseReference): BaseReference.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BaseReference, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BaseReference;
    static deserializeBinaryFromReader(message: BaseReference, reader: jspb.BinaryReader): BaseReference;
}

export namespace BaseReference {
    export type AsObject = {
        reference?: artifact_pb.ArtifactReference.AsObject,
        valueType: artifact_pb.ValueType,
        supply: artifact_pb.Supply,
        name: string,
        symbol: string,
        owner: string,
        quantity: number,
        decimals: number,

        tokenPropertiesMap: Array<[string, string]>,
        constructorName: string,
        constructor?: google_protobuf_any_pb.Any.AsObject,
    }
}

export class Behavior extends jspb.Message { 

    hasArtifact(): boolean;
    clearArtifact(): void;
    getArtifact(): artifact_pb.Artifact | undefined;
    setArtifact(value?: artifact_pb.Artifact): void;

    getIsExternal(): boolean;
    setIsExternal(value: boolean): void;

    getConstructorType(): string;
    setConstructorType(value: string): void;


    hasConstructor(): boolean;
    clearConstructor(): void;
    getConstructor(): google_protobuf_any_pb.Any | undefined;
    setConstructor(value?: google_protobuf_any_pb.Any): void;

    clearInvocationsList(): void;
    getInvocationsList(): Array<Invocation>;
    setInvocationsList(value: Array<Invocation>): void;
    addInvocations(value?: Invocation, index?: number): Invocation;

    clearPropertiesList(): void;
    getPropertiesList(): Array<Property>;
    setPropertiesList(value: Array<Property>): void;
    addProperties(value?: Property, index?: number): Property;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Behavior.AsObject;
    static toObject(includeInstance: boolean, msg: Behavior): Behavior.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Behavior, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Behavior;
    static deserializeBinaryFromReader(message: Behavior, reader: jspb.BinaryReader): Behavior;
}

export namespace Behavior {
    export type AsObject = {
        artifact?: artifact_pb.Artifact.AsObject,
        isExternal: boolean,
        constructorType: string,
        constructor?: google_protobuf_any_pb.Any.AsObject,
        invocationsList: Array<Invocation.AsObject>,
        propertiesList: Array<Property.AsObject>,
    }
}

export class Behaviors extends jspb.Message { 
    clearBehaviorList(): void;
    getBehaviorList(): Array<Behavior>;
    setBehaviorList(value: Array<Behavior>): void;
    addBehavior(value?: Behavior, index?: number): Behavior;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Behaviors.AsObject;
    static toObject(includeInstance: boolean, msg: Behaviors): Behaviors.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Behaviors, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Behaviors;
    static deserializeBinaryFromReader(message: Behaviors, reader: jspb.BinaryReader): Behaviors;
}

export namespace Behaviors {
    export type AsObject = {
        behaviorList: Array<Behavior.AsObject>,
    }
}

export class BehaviorReference extends jspb.Message { 

    hasReference(): boolean;
    clearReference(): void;
    getReference(): artifact_pb.ArtifactReference | undefined;
    setReference(value?: artifact_pb.ArtifactReference): void;

    getIsExternal(): boolean;
    setIsExternal(value: boolean): void;

    getConstructorType(): string;
    setConstructorType(value: string): void;


    hasConstructor(): boolean;
    clearConstructor(): void;
    getConstructor(): google_protobuf_any_pb.Any | undefined;
    setConstructor(value?: google_protobuf_any_pb.Any): void;

    clearAppliesToList(): void;
    getAppliesToList(): Array<artifact_pb.ArtifactSymbol>;
    setAppliesToList(value: Array<artifact_pb.ArtifactSymbol>): void;
    addAppliesTo(value?: artifact_pb.ArtifactSymbol, index?: number): artifact_pb.ArtifactSymbol;

    clearInvocationsList(): void;
    getInvocationsList(): Array<Invocation>;
    setInvocationsList(value: Array<Invocation>): void;
    addInvocations(value?: Invocation, index?: number): Invocation;

    clearInfluenceBindingsList(): void;
    getInfluenceBindingsList(): Array<InfluenceBinding>;
    setInfluenceBindingsList(value: Array<InfluenceBinding>): void;
    addInfluenceBindings(value?: InfluenceBinding, index?: number): InfluenceBinding;

    clearPropertiesList(): void;
    getPropertiesList(): Array<Property>;
    setPropertiesList(value: Array<Property>): void;
    addProperties(value?: Property, index?: number): Property;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BehaviorReference.AsObject;
    static toObject(includeInstance: boolean, msg: BehaviorReference): BehaviorReference.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BehaviorReference, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BehaviorReference;
    static deserializeBinaryFromReader(message: BehaviorReference, reader: jspb.BinaryReader): BehaviorReference;
}

export namespace BehaviorReference {
    export type AsObject = {
        reference?: artifact_pb.ArtifactReference.AsObject,
        isExternal: boolean,
        constructorType: string,
        constructor?: google_protobuf_any_pb.Any.AsObject,
        appliesToList: Array<artifact_pb.ArtifactSymbol.AsObject>,
        invocationsList: Array<Invocation.AsObject>,
        influenceBindingsList: Array<InfluenceBinding.AsObject>,
        propertiesList: Array<Property.AsObject>,
    }
}

export class BehaviorGroup extends jspb.Message { 

    hasArtifact(): boolean;
    clearArtifact(): void;
    getArtifact(): artifact_pb.Artifact | undefined;
    setArtifact(value?: artifact_pb.Artifact): void;

    clearBehaviorsList(): void;
    getBehaviorsList(): Array<BehaviorReference>;
    setBehaviorsList(value: Array<BehaviorReference>): void;
    addBehaviors(value?: BehaviorReference, index?: number): BehaviorReference;


    getBehaviorArtifactsMap(): jspb.Map<string, Behavior>;
    clearBehaviorArtifactsMap(): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BehaviorGroup.AsObject;
    static toObject(includeInstance: boolean, msg: BehaviorGroup): BehaviorGroup.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BehaviorGroup, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BehaviorGroup;
    static deserializeBinaryFromReader(message: BehaviorGroup, reader: jspb.BinaryReader): BehaviorGroup;
}

export namespace BehaviorGroup {
    export type AsObject = {
        artifact?: artifact_pb.Artifact.AsObject,
        behaviorsList: Array<BehaviorReference.AsObject>,

        behaviorArtifactsMap: Array<[string, Behavior.AsObject]>,
    }
}

export class BehaviorGroups extends jspb.Message { 
    clearBehaviorGroupList(): void;
    getBehaviorGroupList(): Array<BehaviorGroup>;
    setBehaviorGroupList(value: Array<BehaviorGroup>): void;
    addBehaviorGroup(value?: BehaviorGroup, index?: number): BehaviorGroup;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BehaviorGroups.AsObject;
    static toObject(includeInstance: boolean, msg: BehaviorGroups): BehaviorGroups.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BehaviorGroups, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BehaviorGroups;
    static deserializeBinaryFromReader(message: BehaviorGroups, reader: jspb.BinaryReader): BehaviorGroups;
}

export namespace BehaviorGroups {
    export type AsObject = {
        behaviorGroupList: Array<BehaviorGroup.AsObject>,
    }
}

export class BehaviorGroupReference extends jspb.Message { 

    hasReference(): boolean;
    clearReference(): void;
    getReference(): artifact_pb.ArtifactReference | undefined;
    setReference(value?: artifact_pb.ArtifactReference): void;

    clearBehaviorArtifactsList(): void;
    getBehaviorArtifactsList(): Array<BehaviorReference>;
    setBehaviorArtifactsList(value: Array<BehaviorReference>): void;
    addBehaviorArtifacts(value?: BehaviorReference, index?: number): BehaviorReference;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BehaviorGroupReference.AsObject;
    static toObject(includeInstance: boolean, msg: BehaviorGroupReference): BehaviorGroupReference.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BehaviorGroupReference, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BehaviorGroupReference;
    static deserializeBinaryFromReader(message: BehaviorGroupReference, reader: jspb.BinaryReader): BehaviorGroupReference;
}

export namespace BehaviorGroupReference {
    export type AsObject = {
        reference?: artifact_pb.ArtifactReference.AsObject,
        behaviorArtifactsList: Array<BehaviorReference.AsObject>,
    }
}

export class PropertySet extends jspb.Message { 

    hasArtifact(): boolean;
    clearArtifact(): void;
    getArtifact(): artifact_pb.Artifact | undefined;
    setArtifact(value?: artifact_pb.Artifact): void;

    clearPropertiesList(): void;
    getPropertiesList(): Array<Property>;
    setPropertiesList(value: Array<Property>): void;
    addProperties(value?: Property, index?: number): Property;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PropertySet.AsObject;
    static toObject(includeInstance: boolean, msg: PropertySet): PropertySet.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PropertySet, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PropertySet;
    static deserializeBinaryFromReader(message: PropertySet, reader: jspb.BinaryReader): PropertySet;
}

export namespace PropertySet {
    export type AsObject = {
        artifact?: artifact_pb.Artifact.AsObject,
        propertiesList: Array<Property.AsObject>,
    }
}

export class PropertySets extends jspb.Message { 
    clearPropertySetList(): void;
    getPropertySetList(): Array<PropertySet>;
    setPropertySetList(value: Array<PropertySet>): void;
    addPropertySet(value?: PropertySet, index?: number): PropertySet;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PropertySets.AsObject;
    static toObject(includeInstance: boolean, msg: PropertySets): PropertySets.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PropertySets, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PropertySets;
    static deserializeBinaryFromReader(message: PropertySets, reader: jspb.BinaryReader): PropertySets;
}

export namespace PropertySets {
    export type AsObject = {
        propertySetList: Array<PropertySet.AsObject>,
    }
}

export class PropertySetReference extends jspb.Message { 

    hasReference(): boolean;
    clearReference(): void;
    getReference(): artifact_pb.ArtifactReference | undefined;
    setReference(value?: artifact_pb.ArtifactReference): void;

    clearPropertiesList(): void;
    getPropertiesList(): Array<Property>;
    setPropertiesList(value: Array<Property>): void;
    addProperties(value?: Property, index?: number): Property;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PropertySetReference.AsObject;
    static toObject(includeInstance: boolean, msg: PropertySetReference): PropertySetReference.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PropertySetReference, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PropertySetReference;
    static deserializeBinaryFromReader(message: PropertySetReference, reader: jspb.BinaryReader): PropertySetReference;
}

export namespace PropertySetReference {
    export type AsObject = {
        reference?: artifact_pb.ArtifactReference.AsObject,
        propertiesList: Array<Property.AsObject>,
    }
}

export class Property extends jspb.Message { 
    getName(): string;
    setName(value: string): void;

    getValueDescription(): string;
    setValueDescription(value: string): void;

    getTemplateValue(): string;
    setTemplateValue(value: string): void;

    clearPropertyInvocationsList(): void;
    getPropertyInvocationsList(): Array<Invocation>;
    setPropertyInvocationsList(value: Array<Invocation>): void;
    addPropertyInvocations(value?: Invocation, index?: number): Invocation;

    clearPropertiesList(): void;
    getPropertiesList(): Array<Property>;
    setPropertiesList(value: Array<Property>): void;
    addProperties(value?: Property, index?: number): Property;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Property.AsObject;
    static toObject(includeInstance: boolean, msg: Property): Property.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Property, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Property;
    static deserializeBinaryFromReader(message: Property, reader: jspb.BinaryReader): Property;
}

export namespace Property {
    export type AsObject = {
        name: string,
        valueDescription: string,
        templateValue: string,
        propertyInvocationsList: Array<Invocation.AsObject>,
        propertiesList: Array<Property.AsObject>,
    }
}

export class Invocation extends jspb.Message { 
    getId(): string;
    setId(value: string): void;

    getName(): string;
    setName(value: string): void;

    getDescription(): string;
    setDescription(value: string): void;


    hasRequest(): boolean;
    clearRequest(): void;
    getRequest(): InvocationRequest | undefined;
    setRequest(value?: InvocationRequest): void;


    hasResponse(): boolean;
    clearResponse(): void;
    getResponse(): InvocationResponse | undefined;
    setResponse(value?: InvocationResponse): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Invocation.AsObject;
    static toObject(includeInstance: boolean, msg: Invocation): Invocation.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Invocation, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Invocation;
    static deserializeBinaryFromReader(message: Invocation, reader: jspb.BinaryReader): Invocation;
}

export namespace Invocation {
    export type AsObject = {
        id: string,
        name: string,
        description: string,
        request?: InvocationRequest.AsObject,
        response?: InvocationResponse.AsObject,
    }
}

export class InvocationRequest extends jspb.Message { 
    getControlMessageName(): string;
    setControlMessageName(value: string): void;

    getDescription(): string;
    setDescription(value: string): void;

    clearInputParametersList(): void;
    getInputParametersList(): Array<InvocationParameter>;
    setInputParametersList(value: Array<InvocationParameter>): void;
    addInputParameters(value?: InvocationParameter, index?: number): InvocationParameter;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): InvocationRequest.AsObject;
    static toObject(includeInstance: boolean, msg: InvocationRequest): InvocationRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: InvocationRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): InvocationRequest;
    static deserializeBinaryFromReader(message: InvocationRequest, reader: jspb.BinaryReader): InvocationRequest;
}

export namespace InvocationRequest {
    export type AsObject = {
        controlMessageName: string,
        description: string,
        inputParametersList: Array<InvocationParameter.AsObject>,
    }
}

export class InvocationResponse extends jspb.Message { 
    getControlMessageName(): string;
    setControlMessageName(value: string): void;

    getDescription(): string;
    setDescription(value: string): void;

    clearOutputParametersList(): void;
    getOutputParametersList(): Array<InvocationParameter>;
    setOutputParametersList(value: Array<InvocationParameter>): void;
    addOutputParameters(value?: InvocationParameter, index?: number): InvocationParameter;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): InvocationResponse.AsObject;
    static toObject(includeInstance: boolean, msg: InvocationResponse): InvocationResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: InvocationResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): InvocationResponse;
    static deserializeBinaryFromReader(message: InvocationResponse, reader: jspb.BinaryReader): InvocationResponse;
}

export namespace InvocationResponse {
    export type AsObject = {
        controlMessageName: string,
        description: string,
        outputParametersList: Array<InvocationParameter.AsObject>,
    }
}

export class InvocationParameter extends jspb.Message { 
    getName(): string;
    setName(value: string): void;

    getValueDescription(): string;
    setValueDescription(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): InvocationParameter.AsObject;
    static toObject(includeInstance: boolean, msg: InvocationParameter): InvocationParameter.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: InvocationParameter, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): InvocationParameter;
    static deserializeBinaryFromReader(message: InvocationParameter, reader: jspb.BinaryReader): InvocationParameter;
}

export namespace InvocationParameter {
    export type AsObject = {
        name: string,
        valueDescription: string,
    }
}

export class TokenTemplate extends jspb.Message { 

    hasFormula(): boolean;
    clearFormula(): void;
    getFormula(): TemplateFormula | undefined;
    setFormula(value?: TemplateFormula): void;


    hasDefinition(): boolean;
    clearDefinition(): void;
    getDefinition(): TemplateDefinition | undefined;
    setDefinition(value?: TemplateDefinition): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TokenTemplate.AsObject;
    static toObject(includeInstance: boolean, msg: TokenTemplate): TokenTemplate.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TokenTemplate, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TokenTemplate;
    static deserializeBinaryFromReader(message: TokenTemplate, reader: jspb.BinaryReader): TokenTemplate;
}

export namespace TokenTemplate {
    export type AsObject = {
        formula?: TemplateFormula.AsObject,
        definition?: TemplateDefinition.AsObject,
    }
}

export class TokenTemplates extends jspb.Message { 

    getTemplateMap(): jspb.Map<string, TokenTemplate>;
    clearTemplateMap(): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TokenTemplates.AsObject;
    static toObject(includeInstance: boolean, msg: TokenTemplates): TokenTemplates.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TokenTemplates, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TokenTemplates;
    static deserializeBinaryFromReader(message: TokenTemplates, reader: jspb.BinaryReader): TokenTemplates;
}

export namespace TokenTemplates {
    export type AsObject = {

        templateMap: Array<[string, TokenTemplate.AsObject]>,
    }
}

export class TemplateFormula extends jspb.Message { 

    hasArtifact(): boolean;
    clearArtifact(): void;
    getArtifact(): artifact_pb.Artifact | undefined;
    setArtifact(value?: artifact_pb.Artifact): void;

    getTemplateType(): artifact_pb.TemplateType;
    setTemplateType(value: artifact_pb.TemplateType): void;


    hasTokenBase(): boolean;
    clearTokenBase(): void;
    getTokenBase(): TemplateBase | undefined;
    setTokenBase(value?: TemplateBase): void;

    clearBehaviorsList(): void;
    getBehaviorsList(): Array<TemplateBehavior>;
    setBehaviorsList(value: Array<TemplateBehavior>): void;
    addBehaviors(value?: TemplateBehavior, index?: number): TemplateBehavior;

    clearBehaviorGroupsList(): void;
    getBehaviorGroupsList(): Array<TemplateBehaviorGroup>;
    setBehaviorGroupsList(value: Array<TemplateBehaviorGroup>): void;
    addBehaviorGroups(value?: TemplateBehaviorGroup, index?: number): TemplateBehaviorGroup;

    clearPropertySetsList(): void;
    getPropertySetsList(): Array<TemplatePropertySet>;
    setPropertySetsList(value: Array<TemplatePropertySet>): void;
    addPropertySets(value?: TemplatePropertySet, index?: number): TemplatePropertySet;

    clearChildTokensList(): void;
    getChildTokensList(): Array<TemplateFormula>;
    setChildTokensList(value: Array<TemplateFormula>): void;
    addChildTokens(value?: TemplateFormula, index?: number): TemplateFormula;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TemplateFormula.AsObject;
    static toObject(includeInstance: boolean, msg: TemplateFormula): TemplateFormula.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TemplateFormula, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TemplateFormula;
    static deserializeBinaryFromReader(message: TemplateFormula, reader: jspb.BinaryReader): TemplateFormula;
}

export namespace TemplateFormula {
    export type AsObject = {
        artifact?: artifact_pb.Artifact.AsObject,
        templateType: artifact_pb.TemplateType,
        tokenBase?: TemplateBase.AsObject,
        behaviorsList: Array<TemplateBehavior.AsObject>,
        behaviorGroupsList: Array<TemplateBehaviorGroup.AsObject>,
        propertySetsList: Array<TemplatePropertySet.AsObject>,
        childTokensList: Array<TemplateFormula.AsObject>,
    }
}

export class TemplateFormulas extends jspb.Message { 
    clearTemplatesList(): void;
    getTemplatesList(): Array<TemplateFormula>;
    setTemplatesList(value: Array<TemplateFormula>): void;
    addTemplates(value?: TemplateFormula, index?: number): TemplateFormula;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TemplateFormulas.AsObject;
    static toObject(includeInstance: boolean, msg: TemplateFormulas): TemplateFormulas.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TemplateFormulas, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TemplateFormulas;
    static deserializeBinaryFromReader(message: TemplateFormulas, reader: jspb.BinaryReader): TemplateFormulas;
}

export namespace TemplateFormulas {
    export type AsObject = {
        templatesList: Array<TemplateFormula.AsObject>,
    }
}

export class TemplateBase extends jspb.Message { 

    hasBase(): boolean;
    clearBase(): void;
    getBase(): artifact_pb.ArtifactSymbol | undefined;
    setBase(value?: artifact_pb.ArtifactSymbol): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TemplateBase.AsObject;
    static toObject(includeInstance: boolean, msg: TemplateBase): TemplateBase.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TemplateBase, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TemplateBase;
    static deserializeBinaryFromReader(message: TemplateBase, reader: jspb.BinaryReader): TemplateBase;
}

export namespace TemplateBase {
    export type AsObject = {
        base?: artifact_pb.ArtifactSymbol.AsObject,
    }
}

export class TemplateBehavior extends jspb.Message { 

    hasBehavior(): boolean;
    clearBehavior(): void;
    getBehavior(): artifact_pb.ArtifactSymbol | undefined;
    setBehavior(value?: artifact_pb.ArtifactSymbol): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TemplateBehavior.AsObject;
    static toObject(includeInstance: boolean, msg: TemplateBehavior): TemplateBehavior.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TemplateBehavior, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TemplateBehavior;
    static deserializeBinaryFromReader(message: TemplateBehavior, reader: jspb.BinaryReader): TemplateBehavior;
}

export namespace TemplateBehavior {
    export type AsObject = {
        behavior?: artifact_pb.ArtifactSymbol.AsObject,
    }
}

export class TemplateBehaviorGroup extends jspb.Message { 

    hasBehaviorGroup(): boolean;
    clearBehaviorGroup(): void;
    getBehaviorGroup(): artifact_pb.ArtifactSymbol | undefined;
    setBehaviorGroup(value?: artifact_pb.ArtifactSymbol): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TemplateBehaviorGroup.AsObject;
    static toObject(includeInstance: boolean, msg: TemplateBehaviorGroup): TemplateBehaviorGroup.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TemplateBehaviorGroup, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TemplateBehaviorGroup;
    static deserializeBinaryFromReader(message: TemplateBehaviorGroup, reader: jspb.BinaryReader): TemplateBehaviorGroup;
}

export namespace TemplateBehaviorGroup {
    export type AsObject = {
        behaviorGroup?: artifact_pb.ArtifactSymbol.AsObject,
    }
}

export class TemplatePropertySet extends jspb.Message { 

    hasPropertySet(): boolean;
    clearPropertySet(): void;
    getPropertySet(): artifact_pb.ArtifactSymbol | undefined;
    setPropertySet(value?: artifact_pb.ArtifactSymbol): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TemplatePropertySet.AsObject;
    static toObject(includeInstance: boolean, msg: TemplatePropertySet): TemplatePropertySet.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TemplatePropertySet, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TemplatePropertySet;
    static deserializeBinaryFromReader(message: TemplatePropertySet, reader: jspb.BinaryReader): TemplatePropertySet;
}

export namespace TemplatePropertySet {
    export type AsObject = {
        propertySet?: artifact_pb.ArtifactSymbol.AsObject,
    }
}

export class TemplateDefinition extends jspb.Message { 

    hasArtifact(): boolean;
    clearArtifact(): void;
    getArtifact(): artifact_pb.Artifact | undefined;
    setArtifact(value?: artifact_pb.Artifact): void;


    hasFormulaReference(): boolean;
    clearFormulaReference(): void;
    getFormulaReference(): artifact_pb.ArtifactReference | undefined;
    setFormulaReference(value?: artifact_pb.ArtifactReference): void;


    hasTokenBase(): boolean;
    clearTokenBase(): void;
    getTokenBase(): BaseReference | undefined;
    setTokenBase(value?: BaseReference): void;

    clearBehaviorsList(): void;
    getBehaviorsList(): Array<BehaviorReference>;
    setBehaviorsList(value: Array<BehaviorReference>): void;
    addBehaviors(value?: BehaviorReference, index?: number): BehaviorReference;

    clearBehaviorGroupsList(): void;
    getBehaviorGroupsList(): Array<BehaviorGroupReference>;
    setBehaviorGroupsList(value: Array<BehaviorGroupReference>): void;
    addBehaviorGroups(value?: BehaviorGroupReference, index?: number): BehaviorGroupReference;

    clearPropertySetsList(): void;
    getPropertySetsList(): Array<PropertySetReference>;
    setPropertySetsList(value: Array<PropertySetReference>): void;
    addPropertySets(value?: PropertySetReference, index?: number): PropertySetReference;

    clearChildTokensList(): void;
    getChildTokensList(): Array<TemplateDefinition>;
    setChildTokensList(value: Array<TemplateDefinition>): void;
    addChildTokens(value?: TemplateDefinition, index?: number): TemplateDefinition;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TemplateDefinition.AsObject;
    static toObject(includeInstance: boolean, msg: TemplateDefinition): TemplateDefinition.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TemplateDefinition, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TemplateDefinition;
    static deserializeBinaryFromReader(message: TemplateDefinition, reader: jspb.BinaryReader): TemplateDefinition;
}

export namespace TemplateDefinition {
    export type AsObject = {
        artifact?: artifact_pb.Artifact.AsObject,
        formulaReference?: artifact_pb.ArtifactReference.AsObject,
        tokenBase?: BaseReference.AsObject,
        behaviorsList: Array<BehaviorReference.AsObject>,
        behaviorGroupsList: Array<BehaviorGroupReference.AsObject>,
        propertySetsList: Array<PropertySetReference.AsObject>,
        childTokensList: Array<TemplateDefinition.AsObject>,
    }
}

export class TemplateDefinitions extends jspb.Message { 
    clearDefinitionsList(): void;
    getDefinitionsList(): Array<TemplateDefinition>;
    setDefinitionsList(value: Array<TemplateDefinition>): void;
    addDefinitions(value?: TemplateDefinition, index?: number): TemplateDefinition;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TemplateDefinitions.AsObject;
    static toObject(includeInstance: boolean, msg: TemplateDefinitions): TemplateDefinitions.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TemplateDefinitions, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TemplateDefinitions;
    static deserializeBinaryFromReader(message: TemplateDefinitions, reader: jspb.BinaryReader): TemplateDefinitions;
}

export namespace TemplateDefinitions {
    export type AsObject = {
        definitionsList: Array<TemplateDefinition.AsObject>,
    }
}

export class InfluenceBinding extends jspb.Message { 
    getInfluencedId(): string;
    setInfluencedId(value: string): void;

    getInfluencedInvocationId(): string;
    setInfluencedInvocationId(value: string): void;

    getInfluenceType(): InfluenceType;
    setInfluenceType(value: InfluenceType): void;


    hasInfluencingInvocation(): boolean;
    clearInfluencingInvocation(): void;
    getInfluencingInvocation(): Invocation | undefined;
    setInfluencingInvocation(value?: Invocation): void;


    hasInfluencedInvocation(): boolean;
    clearInfluencedInvocation(): void;
    getInfluencedInvocation(): Invocation | undefined;
    setInfluencedInvocation(value?: Invocation): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): InfluenceBinding.AsObject;
    static toObject(includeInstance: boolean, msg: InfluenceBinding): InfluenceBinding.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: InfluenceBinding, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): InfluenceBinding;
    static deserializeBinaryFromReader(message: InfluenceBinding, reader: jspb.BinaryReader): InfluenceBinding;
}

export namespace InfluenceBinding {
    export type AsObject = {
        influencedId: string,
        influencedInvocationId: string,
        influenceType: InfluenceType,
        influencingInvocation?: Invocation.AsObject,
        influencedInvocation?: Invocation.AsObject,
    }
}

export class TokenSpecification extends jspb.Message { 
    getSpecificationHash(): string;
    setSpecificationHash(value: string): void;


    hasArtifact(): boolean;
    clearArtifact(): void;
    getArtifact(): artifact_pb.Artifact | undefined;
    setArtifact(value?: artifact_pb.Artifact): void;


    hasDefinitionReference(): boolean;
    clearDefinitionReference(): void;
    getDefinitionReference(): artifact_pb.ArtifactReference | undefined;
    setDefinitionReference(value?: artifact_pb.ArtifactReference): void;


    hasTokenBase(): boolean;
    clearTokenBase(): void;
    getTokenBase(): Base | undefined;
    setTokenBase(value?: Base): void;

    clearBehaviorsList(): void;
    getBehaviorsList(): Array<BehaviorSpecification>;
    setBehaviorsList(value: Array<BehaviorSpecification>): void;
    addBehaviors(value?: BehaviorSpecification, index?: number): BehaviorSpecification;

    clearBehaviorGroupsList(): void;
    getBehaviorGroupsList(): Array<BehaviorGroupSpecification>;
    setBehaviorGroupsList(value: Array<BehaviorGroupSpecification>): void;
    addBehaviorGroups(value?: BehaviorGroupSpecification, index?: number): BehaviorGroupSpecification;

    clearPropertySetsList(): void;
    getPropertySetsList(): Array<PropertySetSpecification>;
    setPropertySetsList(value: Array<PropertySetSpecification>): void;
    addPropertySets(value?: PropertySetSpecification, index?: number): PropertySetSpecification;

    clearChildTokensList(): void;
    getChildTokensList(): Array<TokenSpecification>;
    setChildTokensList(value: Array<TokenSpecification>): void;
    addChildTokens(value?: TokenSpecification, index?: number): TokenSpecification;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TokenSpecification.AsObject;
    static toObject(includeInstance: boolean, msg: TokenSpecification): TokenSpecification.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TokenSpecification, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TokenSpecification;
    static deserializeBinaryFromReader(message: TokenSpecification, reader: jspb.BinaryReader): TokenSpecification;
}

export namespace TokenSpecification {
    export type AsObject = {
        specificationHash: string,
        artifact?: artifact_pb.Artifact.AsObject,
        definitionReference?: artifact_pb.ArtifactReference.AsObject,
        tokenBase?: Base.AsObject,
        behaviorsList: Array<BehaviorSpecification.AsObject>,
        behaviorGroupsList: Array<BehaviorGroupSpecification.AsObject>,
        propertySetsList: Array<PropertySetSpecification.AsObject>,
        childTokensList: Array<TokenSpecification.AsObject>,
    }
}

export class BehaviorSpecification extends jspb.Message { 

    hasArtifact(): boolean;
    clearArtifact(): void;
    getArtifact(): artifact_pb.Artifact | undefined;
    setArtifact(value?: artifact_pb.Artifact): void;

    getIsExternal(): boolean;
    setIsExternal(value: boolean): void;

    getConstructorType(): string;
    setConstructorType(value: string): void;


    hasConstructor(): boolean;
    clearConstructor(): void;
    getConstructor(): google_protobuf_any_pb.Any | undefined;
    setConstructor(value?: google_protobuf_any_pb.Any): void;

    clearInvocationsList(): void;
    getInvocationsList(): Array<InvocationBinding>;
    setInvocationsList(value: Array<InvocationBinding>): void;
    addInvocations(value?: InvocationBinding, index?: number): InvocationBinding;

    clearPropertiesList(): void;
    getPropertiesList(): Array<Property>;
    setPropertiesList(value: Array<Property>): void;
    addProperties(value?: Property, index?: number): Property;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BehaviorSpecification.AsObject;
    static toObject(includeInstance: boolean, msg: BehaviorSpecification): BehaviorSpecification.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BehaviorSpecification, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BehaviorSpecification;
    static deserializeBinaryFromReader(message: BehaviorSpecification, reader: jspb.BinaryReader): BehaviorSpecification;
}

export namespace BehaviorSpecification {
    export type AsObject = {
        artifact?: artifact_pb.Artifact.AsObject,
        isExternal: boolean,
        constructorType: string,
        constructor?: google_protobuf_any_pb.Any.AsObject,
        invocationsList: Array<InvocationBinding.AsObject>,
        propertiesList: Array<Property.AsObject>,
    }
}

export class PropertySetSpecification extends jspb.Message { 

    hasArtifact(): boolean;
    clearArtifact(): void;
    getArtifact(): artifact_pb.Artifact | undefined;
    setArtifact(value?: artifact_pb.Artifact): void;

    clearPropertiesList(): void;
    getPropertiesList(): Array<PropertySpecification>;
    setPropertiesList(value: Array<PropertySpecification>): void;
    addProperties(value?: PropertySpecification, index?: number): PropertySpecification;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PropertySetSpecification.AsObject;
    static toObject(includeInstance: boolean, msg: PropertySetSpecification): PropertySetSpecification.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PropertySetSpecification, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PropertySetSpecification;
    static deserializeBinaryFromReader(message: PropertySetSpecification, reader: jspb.BinaryReader): PropertySetSpecification;
}

export namespace PropertySetSpecification {
    export type AsObject = {
        artifact?: artifact_pb.Artifact.AsObject,
        propertiesList: Array<PropertySpecification.AsObject>,
    }
}

export class PropertySpecification extends jspb.Message { 
    getName(): string;
    setName(value: string): void;

    getValueDescription(): string;
    setValueDescription(value: string): void;

    getTemplateValue(): string;
    setTemplateValue(value: string): void;

    clearPropertyInvocationsList(): void;
    getPropertyInvocationsList(): Array<InvocationBinding>;
    setPropertyInvocationsList(value: Array<InvocationBinding>): void;
    addPropertyInvocations(value?: InvocationBinding, index?: number): InvocationBinding;

    clearPropertiesList(): void;
    getPropertiesList(): Array<PropertySpecification>;
    setPropertiesList(value: Array<PropertySpecification>): void;
    addProperties(value?: PropertySpecification, index?: number): PropertySpecification;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PropertySpecification.AsObject;
    static toObject(includeInstance: boolean, msg: PropertySpecification): PropertySpecification.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PropertySpecification, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PropertySpecification;
    static deserializeBinaryFromReader(message: PropertySpecification, reader: jspb.BinaryReader): PropertySpecification;
}

export namespace PropertySpecification {
    export type AsObject = {
        name: string,
        valueDescription: string,
        templateValue: string,
        propertyInvocationsList: Array<InvocationBinding.AsObject>,
        propertiesList: Array<PropertySpecification.AsObject>,
    }
}

export class BehaviorGroupSpecification extends jspb.Message { 

    hasArtifact(): boolean;
    clearArtifact(): void;
    getArtifact(): artifact_pb.Artifact | undefined;
    setArtifact(value?: artifact_pb.Artifact): void;

    clearBehaviorsList(): void;
    getBehaviorsList(): Array<artifact_pb.ArtifactSymbol>;
    setBehaviorsList(value: Array<artifact_pb.ArtifactSymbol>): void;
    addBehaviors(value?: artifact_pb.ArtifactSymbol, index?: number): artifact_pb.ArtifactSymbol;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BehaviorGroupSpecification.AsObject;
    static toObject(includeInstance: boolean, msg: BehaviorGroupSpecification): BehaviorGroupSpecification.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BehaviorGroupSpecification, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BehaviorGroupSpecification;
    static deserializeBinaryFromReader(message: BehaviorGroupSpecification, reader: jspb.BinaryReader): BehaviorGroupSpecification;
}

export namespace BehaviorGroupSpecification {
    export type AsObject = {
        artifact?: artifact_pb.Artifact.AsObject,
        behaviorsList: Array<artifact_pb.ArtifactSymbol.AsObject>,
    }
}

export class InvocationBinding extends jspb.Message { 

    hasInfluence(): boolean;
    clearInfluence(): void;
    getInfluence(): InvocationBinding.Influence | undefined;
    setInfluence(value?: InvocationBinding.Influence): void;


    hasInvocationStep(): boolean;
    clearInvocationStep(): void;
    getInvocationStep(): InvocationBinding.InvocationStep | undefined;
    setInvocationStep(value?: InvocationBinding.InvocationStep): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): InvocationBinding.AsObject;
    static toObject(includeInstance: boolean, msg: InvocationBinding): InvocationBinding.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: InvocationBinding, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): InvocationBinding;
    static deserializeBinaryFromReader(message: InvocationBinding, reader: jspb.BinaryReader): InvocationBinding;
}

export namespace InvocationBinding {
    export type AsObject = {
        influence?: InvocationBinding.Influence.AsObject,
        invocationStep?: InvocationBinding.InvocationStep.AsObject,
    }


    export class Influence extends jspb.Message { 
        getInfluenceType(): InfluenceType;
        setInfluenceType(value: InfluenceType): void;

        getInfluencingId(): string;
        setInfluencingId(value: string): void;

        getInfluencingInvocationId(): string;
        setInfluencingInvocationId(value: string): void;

        getInfluencedId(): string;
        setInfluencedId(value: string): void;

        getInfluencedInvocationId(): string;
        setInfluencedInvocationId(value: string): void;


        serializeBinary(): Uint8Array;
        toObject(includeInstance?: boolean): Influence.AsObject;
        static toObject(includeInstance: boolean, msg: Influence): Influence.AsObject;
        static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
        static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
        static serializeBinaryToWriter(message: Influence, writer: jspb.BinaryWriter): void;
        static deserializeBinary(bytes: Uint8Array): Influence;
        static deserializeBinaryFromReader(message: Influence, reader: jspb.BinaryReader): Influence;
    }

    export namespace Influence {
        export type AsObject = {
            influenceType: InfluenceType,
            influencingId: string,
            influencingInvocationId: string,
            influencedId: string,
            influencedInvocationId: string,
        }
    }

    export class InvocationStep extends jspb.Message { 

        hasInvocation(): boolean;
        clearInvocation(): void;
        getInvocation(): Invocation | undefined;
        setInvocation(value?: Invocation): void;


        hasNextInvocation(): boolean;
        clearNextInvocation(): void;
        getNextInvocation(): InvocationBinding.InvocationStep | undefined;
        setNextInvocation(value?: InvocationBinding.InvocationStep): void;


        serializeBinary(): Uint8Array;
        toObject(includeInstance?: boolean): InvocationStep.AsObject;
        static toObject(includeInstance: boolean, msg: InvocationStep): InvocationStep.AsObject;
        static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
        static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
        static serializeBinaryToWriter(message: InvocationStep, writer: jspb.BinaryWriter): void;
        static deserializeBinary(bytes: Uint8Array): InvocationStep;
        static deserializeBinaryFromReader(message: InvocationStep, reader: jspb.BinaryReader): InvocationStep;
    }

    export namespace InvocationStep {
        export type AsObject = {
            invocation?: Invocation.AsObject,
            nextInvocation?: InvocationBinding.InvocationStep.AsObject,
        }
    }

}

export class TokenBase extends jspb.Message { 

    hasBase(): boolean;
    clearBase(): void;
    getBase(): Base | undefined;
    setBase(value?: Base): void;


    hasValues(): boolean;
    clearValues(): void;
    getValues(): BaseReference | undefined;
    setValues(value?: BaseReference): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TokenBase.AsObject;
    static toObject(includeInstance: boolean, msg: TokenBase): TokenBase.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TokenBase, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TokenBase;
    static deserializeBinaryFromReader(message: TokenBase, reader: jspb.BinaryReader): TokenBase;
}

export namespace TokenBase {
    export type AsObject = {
        base?: Base.AsObject,
        values?: BaseReference.AsObject,
    }
}

export class TokenBehavior extends jspb.Message { 

    hasBehavior(): boolean;
    clearBehavior(): void;
    getBehavior(): Behavior | undefined;
    setBehavior(value?: Behavior): void;


    hasValues(): boolean;
    clearValues(): void;
    getValues(): BehaviorReference | undefined;
    setValues(value?: BehaviorReference): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TokenBehavior.AsObject;
    static toObject(includeInstance: boolean, msg: TokenBehavior): TokenBehavior.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TokenBehavior, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TokenBehavior;
    static deserializeBinaryFromReader(message: TokenBehavior, reader: jspb.BinaryReader): TokenBehavior;
}

export namespace TokenBehavior {
    export type AsObject = {
        behavior?: Behavior.AsObject,
        values?: BehaviorReference.AsObject,
    }
}

export class TokenBehaviorGroup extends jspb.Message { 

    hasBehavior(): boolean;
    clearBehavior(): void;
    getBehavior(): BehaviorGroup | undefined;
    setBehavior(value?: BehaviorGroup): void;


    hasValues(): boolean;
    clearValues(): void;
    getValues(): BehaviorGroupReference | undefined;
    setValues(value?: BehaviorGroupReference): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TokenBehaviorGroup.AsObject;
    static toObject(includeInstance: boolean, msg: TokenBehaviorGroup): TokenBehaviorGroup.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TokenBehaviorGroup, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TokenBehaviorGroup;
    static deserializeBinaryFromReader(message: TokenBehaviorGroup, reader: jspb.BinaryReader): TokenBehaviorGroup;
}

export namespace TokenBehaviorGroup {
    export type AsObject = {
        behavior?: BehaviorGroup.AsObject,
        values?: BehaviorGroupReference.AsObject,
    }
}

export class TokenPropertySet extends jspb.Message { 

    hasPropertySet(): boolean;
    clearPropertySet(): void;
    getPropertySet(): PropertySet | undefined;
    setPropertySet(value?: PropertySet): void;


    hasValues(): boolean;
    clearValues(): void;
    getValues(): PropertySetReference | undefined;
    setValues(value?: PropertySetReference): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TokenPropertySet.AsObject;
    static toObject(includeInstance: boolean, msg: TokenPropertySet): TokenPropertySet.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TokenPropertySet, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TokenPropertySet;
    static deserializeBinaryFromReader(message: TokenPropertySet, reader: jspb.BinaryReader): TokenPropertySet;
}

export namespace TokenPropertySet {
    export type AsObject = {
        propertySet?: PropertySet.AsObject,
        values?: PropertySetReference.AsObject,
    }
}

export enum InfluenceType {
    INTERCEPT = 0,
    OVERRIDE = 1,
}
