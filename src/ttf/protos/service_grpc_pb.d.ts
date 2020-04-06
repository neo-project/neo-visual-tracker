// package: taxonomy
// file: service.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as service_pb from "./service_pb";
import * as taxonomy_pb from "./taxonomy_pb";
import * as core_pb from "./core_pb";
import * as artifact_pb from "./artifact_pb";

interface IServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    getFullTaxonomy: IServiceService_IGetFullTaxonomy;
    getLiteTaxonomy: IServiceService_IGetLiteTaxonomy;
    getBaseArtifact: IServiceService_IGetBaseArtifact;
    getBehaviorArtifact: IServiceService_IGetBehaviorArtifact;
    getBehaviorGroupArtifact: IServiceService_IGetBehaviorGroupArtifact;
    getPropertySetArtifact: IServiceService_IGetPropertySetArtifact;
    getTemplateFormulaArtifact: IServiceService_IGetTemplateFormulaArtifact;
    getTemplateDefinitionArtifact: IServiceService_IGetTemplateDefinitionArtifact;
    getTokenTemplate: IServiceService_IGetTokenTemplate;
    getTokenSpecification: IServiceService_IGetTokenSpecification;
    getArtifactsOfType: IServiceService_IGetArtifactsOfType;
    initializeNewArtifact: IServiceService_IInitializeNewArtifact;
    createArtifact: IServiceService_ICreateArtifact;
    updateArtifact: IServiceService_IUpdateArtifact;
    deleteArtifact: IServiceService_IDeleteArtifact;
    createTemplateDefinition: IServiceService_ICreateTemplateDefinition;
    commitLocalUpdates: IServiceService_ICommitLocalUpdates;
    pullRequest: IServiceService_IPullRequest;
    getConfig: IServiceService_IGetConfig;
}

interface IServiceService_IGetFullTaxonomy extends grpc.MethodDefinition<taxonomy_pb.TaxonomyVersion, taxonomy_pb.Taxonomy> {
    path: string; // "/taxonomy.Service/GetFullTaxonomy"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<taxonomy_pb.TaxonomyVersion>;
    requestDeserialize: grpc.deserialize<taxonomy_pb.TaxonomyVersion>;
    responseSerialize: grpc.serialize<taxonomy_pb.Taxonomy>;
    responseDeserialize: grpc.deserialize<taxonomy_pb.Taxonomy>;
}
interface IServiceService_IGetLiteTaxonomy extends grpc.MethodDefinition<taxonomy_pb.TaxonomyVersion, taxonomy_pb.Taxonomy> {
    path: string; // "/taxonomy.Service/GetLiteTaxonomy"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<taxonomy_pb.TaxonomyVersion>;
    requestDeserialize: grpc.deserialize<taxonomy_pb.TaxonomyVersion>;
    responseSerialize: grpc.serialize<taxonomy_pb.Taxonomy>;
    responseDeserialize: grpc.deserialize<taxonomy_pb.Taxonomy>;
}
interface IServiceService_IGetBaseArtifact extends grpc.MethodDefinition<artifact_pb.ArtifactSymbol, core_pb.Base> {
    path: string; // "/taxonomy.Service/GetBaseArtifact"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<artifact_pb.ArtifactSymbol>;
    requestDeserialize: grpc.deserialize<artifact_pb.ArtifactSymbol>;
    responseSerialize: grpc.serialize<core_pb.Base>;
    responseDeserialize: grpc.deserialize<core_pb.Base>;
}
interface IServiceService_IGetBehaviorArtifact extends grpc.MethodDefinition<artifact_pb.ArtifactSymbol, core_pb.Behavior> {
    path: string; // "/taxonomy.Service/GetBehaviorArtifact"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<artifact_pb.ArtifactSymbol>;
    requestDeserialize: grpc.deserialize<artifact_pb.ArtifactSymbol>;
    responseSerialize: grpc.serialize<core_pb.Behavior>;
    responseDeserialize: grpc.deserialize<core_pb.Behavior>;
}
interface IServiceService_IGetBehaviorGroupArtifact extends grpc.MethodDefinition<artifact_pb.ArtifactSymbol, core_pb.BehaviorGroup> {
    path: string; // "/taxonomy.Service/GetBehaviorGroupArtifact"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<artifact_pb.ArtifactSymbol>;
    requestDeserialize: grpc.deserialize<artifact_pb.ArtifactSymbol>;
    responseSerialize: grpc.serialize<core_pb.BehaviorGroup>;
    responseDeserialize: grpc.deserialize<core_pb.BehaviorGroup>;
}
interface IServiceService_IGetPropertySetArtifact extends grpc.MethodDefinition<artifact_pb.ArtifactSymbol, core_pb.PropertySet> {
    path: string; // "/taxonomy.Service/GetPropertySetArtifact"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<artifact_pb.ArtifactSymbol>;
    requestDeserialize: grpc.deserialize<artifact_pb.ArtifactSymbol>;
    responseSerialize: grpc.serialize<core_pb.PropertySet>;
    responseDeserialize: grpc.deserialize<core_pb.PropertySet>;
}
interface IServiceService_IGetTemplateFormulaArtifact extends grpc.MethodDefinition<artifact_pb.ArtifactSymbol, core_pb.TemplateFormula> {
    path: string; // "/taxonomy.Service/GetTemplateFormulaArtifact"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<artifact_pb.ArtifactSymbol>;
    requestDeserialize: grpc.deserialize<artifact_pb.ArtifactSymbol>;
    responseSerialize: grpc.serialize<core_pb.TemplateFormula>;
    responseDeserialize: grpc.deserialize<core_pb.TemplateFormula>;
}
interface IServiceService_IGetTemplateDefinitionArtifact extends grpc.MethodDefinition<artifact_pb.ArtifactSymbol, core_pb.TemplateDefinition> {
    path: string; // "/taxonomy.Service/GetTemplateDefinitionArtifact"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<artifact_pb.ArtifactSymbol>;
    requestDeserialize: grpc.deserialize<artifact_pb.ArtifactSymbol>;
    responseSerialize: grpc.serialize<core_pb.TemplateDefinition>;
    responseDeserialize: grpc.deserialize<core_pb.TemplateDefinition>;
}
interface IServiceService_IGetTokenTemplate extends grpc.MethodDefinition<artifact_pb.TokenTemplateId, core_pb.TokenTemplate> {
    path: string; // "/taxonomy.Service/GetTokenTemplate"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<artifact_pb.TokenTemplateId>;
    requestDeserialize: grpc.deserialize<artifact_pb.TokenTemplateId>;
    responseSerialize: grpc.serialize<core_pb.TokenTemplate>;
    responseDeserialize: grpc.deserialize<core_pb.TokenTemplate>;
}
interface IServiceService_IGetTokenSpecification extends grpc.MethodDefinition<artifact_pb.TokenTemplateId, core_pb.TokenSpecification> {
    path: string; // "/taxonomy.Service/GetTokenSpecification"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<artifact_pb.TokenTemplateId>;
    requestDeserialize: grpc.deserialize<artifact_pb.TokenTemplateId>;
    responseSerialize: grpc.serialize<core_pb.TokenSpecification>;
    responseDeserialize: grpc.deserialize<core_pb.TokenSpecification>;
}
interface IServiceService_IGetArtifactsOfType extends grpc.MethodDefinition<artifact_pb.QueryOptions, artifact_pb.QueryResult> {
    path: string; // "/taxonomy.Service/GetArtifactsOfType"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<artifact_pb.QueryOptions>;
    requestDeserialize: grpc.deserialize<artifact_pb.QueryOptions>;
    responseSerialize: grpc.serialize<artifact_pb.QueryResult>;
    responseDeserialize: grpc.deserialize<artifact_pb.QueryResult>;
}
interface IServiceService_IInitializeNewArtifact extends grpc.MethodDefinition<artifact_pb.InitializeNewArtifactRequest, artifact_pb.InitializeNewArtifactResponse> {
    path: string; // "/taxonomy.Service/InitializeNewArtifact"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<artifact_pb.InitializeNewArtifactRequest>;
    requestDeserialize: grpc.deserialize<artifact_pb.InitializeNewArtifactRequest>;
    responseSerialize: grpc.serialize<artifact_pb.InitializeNewArtifactResponse>;
    responseDeserialize: grpc.deserialize<artifact_pb.InitializeNewArtifactResponse>;
}
interface IServiceService_ICreateArtifact extends grpc.MethodDefinition<artifact_pb.NewArtifactRequest, artifact_pb.NewArtifactResponse> {
    path: string; // "/taxonomy.Service/CreateArtifact"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<artifact_pb.NewArtifactRequest>;
    requestDeserialize: grpc.deserialize<artifact_pb.NewArtifactRequest>;
    responseSerialize: grpc.serialize<artifact_pb.NewArtifactResponse>;
    responseDeserialize: grpc.deserialize<artifact_pb.NewArtifactResponse>;
}
interface IServiceService_IUpdateArtifact extends grpc.MethodDefinition<artifact_pb.UpdateArtifactRequest, artifact_pb.UpdateArtifactResponse> {
    path: string; // "/taxonomy.Service/UpdateArtifact"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<artifact_pb.UpdateArtifactRequest>;
    requestDeserialize: grpc.deserialize<artifact_pb.UpdateArtifactRequest>;
    responseSerialize: grpc.serialize<artifact_pb.UpdateArtifactResponse>;
    responseDeserialize: grpc.deserialize<artifact_pb.UpdateArtifactResponse>;
}
interface IServiceService_IDeleteArtifact extends grpc.MethodDefinition<artifact_pb.DeleteArtifactRequest, artifact_pb.DeleteArtifactResponse> {
    path: string; // "/taxonomy.Service/DeleteArtifact"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<artifact_pb.DeleteArtifactRequest>;
    requestDeserialize: grpc.deserialize<artifact_pb.DeleteArtifactRequest>;
    responseSerialize: grpc.serialize<artifact_pb.DeleteArtifactResponse>;
    responseDeserialize: grpc.deserialize<artifact_pb.DeleteArtifactResponse>;
}
interface IServiceService_ICreateTemplateDefinition extends grpc.MethodDefinition<artifact_pb.NewTemplateDefinition, core_pb.TemplateDefinition> {
    path: string; // "/taxonomy.Service/CreateTemplateDefinition"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<artifact_pb.NewTemplateDefinition>;
    requestDeserialize: grpc.deserialize<artifact_pb.NewTemplateDefinition>;
    responseSerialize: grpc.serialize<core_pb.TemplateDefinition>;
    responseDeserialize: grpc.deserialize<core_pb.TemplateDefinition>;
}
interface IServiceService_ICommitLocalUpdates extends grpc.MethodDefinition<artifact_pb.CommitUpdatesRequest, artifact_pb.CommitUpdatesResponse> {
    path: string; // "/taxonomy.Service/CommitLocalUpdates"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<artifact_pb.CommitUpdatesRequest>;
    requestDeserialize: grpc.deserialize<artifact_pb.CommitUpdatesRequest>;
    responseSerialize: grpc.serialize<artifact_pb.CommitUpdatesResponse>;
    responseDeserialize: grpc.deserialize<artifact_pb.CommitUpdatesResponse>;
}
interface IServiceService_IPullRequest extends grpc.MethodDefinition<artifact_pb.IssuePullRequest, artifact_pb.IssuePullResponse> {
    path: string; // "/taxonomy.Service/PullRequest"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<artifact_pb.IssuePullRequest>;
    requestDeserialize: grpc.deserialize<artifact_pb.IssuePullRequest>;
    responseSerialize: grpc.serialize<artifact_pb.IssuePullResponse>;
    responseDeserialize: grpc.deserialize<artifact_pb.IssuePullResponse>;
}
interface IServiceService_IGetConfig extends grpc.MethodDefinition<artifact_pb.ConfigurationRequest, artifact_pb.ServiceConfiguration> {
    path: string; // "/taxonomy.Service/GetConfig"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<artifact_pb.ConfigurationRequest>;
    requestDeserialize: grpc.deserialize<artifact_pb.ConfigurationRequest>;
    responseSerialize: grpc.serialize<artifact_pb.ServiceConfiguration>;
    responseDeserialize: grpc.deserialize<artifact_pb.ServiceConfiguration>;
}

export const ServiceService: IServiceService;

export interface IServiceServer {
    getFullTaxonomy: grpc.handleUnaryCall<taxonomy_pb.TaxonomyVersion, taxonomy_pb.Taxonomy>;
    getLiteTaxonomy: grpc.handleUnaryCall<taxonomy_pb.TaxonomyVersion, taxonomy_pb.Taxonomy>;
    getBaseArtifact: grpc.handleUnaryCall<artifact_pb.ArtifactSymbol, core_pb.Base>;
    getBehaviorArtifact: grpc.handleUnaryCall<artifact_pb.ArtifactSymbol, core_pb.Behavior>;
    getBehaviorGroupArtifact: grpc.handleUnaryCall<artifact_pb.ArtifactSymbol, core_pb.BehaviorGroup>;
    getPropertySetArtifact: grpc.handleUnaryCall<artifact_pb.ArtifactSymbol, core_pb.PropertySet>;
    getTemplateFormulaArtifact: grpc.handleUnaryCall<artifact_pb.ArtifactSymbol, core_pb.TemplateFormula>;
    getTemplateDefinitionArtifact: grpc.handleUnaryCall<artifact_pb.ArtifactSymbol, core_pb.TemplateDefinition>;
    getTokenTemplate: grpc.handleUnaryCall<artifact_pb.TokenTemplateId, core_pb.TokenTemplate>;
    getTokenSpecification: grpc.handleUnaryCall<artifact_pb.TokenTemplateId, core_pb.TokenSpecification>;
    getArtifactsOfType: grpc.handleUnaryCall<artifact_pb.QueryOptions, artifact_pb.QueryResult>;
    initializeNewArtifact: grpc.handleUnaryCall<artifact_pb.InitializeNewArtifactRequest, artifact_pb.InitializeNewArtifactResponse>;
    createArtifact: grpc.handleUnaryCall<artifact_pb.NewArtifactRequest, artifact_pb.NewArtifactResponse>;
    updateArtifact: grpc.handleUnaryCall<artifact_pb.UpdateArtifactRequest, artifact_pb.UpdateArtifactResponse>;
    deleteArtifact: grpc.handleUnaryCall<artifact_pb.DeleteArtifactRequest, artifact_pb.DeleteArtifactResponse>;
    createTemplateDefinition: grpc.handleUnaryCall<artifact_pb.NewTemplateDefinition, core_pb.TemplateDefinition>;
    commitLocalUpdates: grpc.handleUnaryCall<artifact_pb.CommitUpdatesRequest, artifact_pb.CommitUpdatesResponse>;
    pullRequest: grpc.handleUnaryCall<artifact_pb.IssuePullRequest, artifact_pb.IssuePullResponse>;
    getConfig: grpc.handleUnaryCall<artifact_pb.ConfigurationRequest, artifact_pb.ServiceConfiguration>;
}

export interface IServiceClient {
    getFullTaxonomy(request: taxonomy_pb.TaxonomyVersion, callback: (error: grpc.ServiceError | null, response: taxonomy_pb.Taxonomy) => void): grpc.ClientUnaryCall;
    getFullTaxonomy(request: taxonomy_pb.TaxonomyVersion, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: taxonomy_pb.Taxonomy) => void): grpc.ClientUnaryCall;
    getFullTaxonomy(request: taxonomy_pb.TaxonomyVersion, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: taxonomy_pb.Taxonomy) => void): grpc.ClientUnaryCall;
    getLiteTaxonomy(request: taxonomy_pb.TaxonomyVersion, callback: (error: grpc.ServiceError | null, response: taxonomy_pb.Taxonomy) => void): grpc.ClientUnaryCall;
    getLiteTaxonomy(request: taxonomy_pb.TaxonomyVersion, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: taxonomy_pb.Taxonomy) => void): grpc.ClientUnaryCall;
    getLiteTaxonomy(request: taxonomy_pb.TaxonomyVersion, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: taxonomy_pb.Taxonomy) => void): grpc.ClientUnaryCall;
    getBaseArtifact(request: artifact_pb.ArtifactSymbol, callback: (error: grpc.ServiceError | null, response: core_pb.Base) => void): grpc.ClientUnaryCall;
    getBaseArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: core_pb.Base) => void): grpc.ClientUnaryCall;
    getBaseArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: core_pb.Base) => void): grpc.ClientUnaryCall;
    getBehaviorArtifact(request: artifact_pb.ArtifactSymbol, callback: (error: grpc.ServiceError | null, response: core_pb.Behavior) => void): grpc.ClientUnaryCall;
    getBehaviorArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: core_pb.Behavior) => void): grpc.ClientUnaryCall;
    getBehaviorArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: core_pb.Behavior) => void): grpc.ClientUnaryCall;
    getBehaviorGroupArtifact(request: artifact_pb.ArtifactSymbol, callback: (error: grpc.ServiceError | null, response: core_pb.BehaviorGroup) => void): grpc.ClientUnaryCall;
    getBehaviorGroupArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: core_pb.BehaviorGroup) => void): grpc.ClientUnaryCall;
    getBehaviorGroupArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: core_pb.BehaviorGroup) => void): grpc.ClientUnaryCall;
    getPropertySetArtifact(request: artifact_pb.ArtifactSymbol, callback: (error: grpc.ServiceError | null, response: core_pb.PropertySet) => void): grpc.ClientUnaryCall;
    getPropertySetArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: core_pb.PropertySet) => void): grpc.ClientUnaryCall;
    getPropertySetArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: core_pb.PropertySet) => void): grpc.ClientUnaryCall;
    getTemplateFormulaArtifact(request: artifact_pb.ArtifactSymbol, callback: (error: grpc.ServiceError | null, response: core_pb.TemplateFormula) => void): grpc.ClientUnaryCall;
    getTemplateFormulaArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: core_pb.TemplateFormula) => void): grpc.ClientUnaryCall;
    getTemplateFormulaArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: core_pb.TemplateFormula) => void): grpc.ClientUnaryCall;
    getTemplateDefinitionArtifact(request: artifact_pb.ArtifactSymbol, callback: (error: grpc.ServiceError | null, response: core_pb.TemplateDefinition) => void): grpc.ClientUnaryCall;
    getTemplateDefinitionArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: core_pb.TemplateDefinition) => void): grpc.ClientUnaryCall;
    getTemplateDefinitionArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: core_pb.TemplateDefinition) => void): grpc.ClientUnaryCall;
    getTokenTemplate(request: artifact_pb.TokenTemplateId, callback: (error: grpc.ServiceError | null, response: core_pb.TokenTemplate) => void): grpc.ClientUnaryCall;
    getTokenTemplate(request: artifact_pb.TokenTemplateId, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: core_pb.TokenTemplate) => void): grpc.ClientUnaryCall;
    getTokenTemplate(request: artifact_pb.TokenTemplateId, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: core_pb.TokenTemplate) => void): grpc.ClientUnaryCall;
    getTokenSpecification(request: artifact_pb.TokenTemplateId, callback: (error: grpc.ServiceError | null, response: core_pb.TokenSpecification) => void): grpc.ClientUnaryCall;
    getTokenSpecification(request: artifact_pb.TokenTemplateId, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: core_pb.TokenSpecification) => void): grpc.ClientUnaryCall;
    getTokenSpecification(request: artifact_pb.TokenTemplateId, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: core_pb.TokenSpecification) => void): grpc.ClientUnaryCall;
    getArtifactsOfType(request: artifact_pb.QueryOptions, callback: (error: grpc.ServiceError | null, response: artifact_pb.QueryResult) => void): grpc.ClientUnaryCall;
    getArtifactsOfType(request: artifact_pb.QueryOptions, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: artifact_pb.QueryResult) => void): grpc.ClientUnaryCall;
    getArtifactsOfType(request: artifact_pb.QueryOptions, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: artifact_pb.QueryResult) => void): grpc.ClientUnaryCall;
    initializeNewArtifact(request: artifact_pb.InitializeNewArtifactRequest, callback: (error: grpc.ServiceError | null, response: artifact_pb.InitializeNewArtifactResponse) => void): grpc.ClientUnaryCall;
    initializeNewArtifact(request: artifact_pb.InitializeNewArtifactRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: artifact_pb.InitializeNewArtifactResponse) => void): grpc.ClientUnaryCall;
    initializeNewArtifact(request: artifact_pb.InitializeNewArtifactRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: artifact_pb.InitializeNewArtifactResponse) => void): grpc.ClientUnaryCall;
    createArtifact(request: artifact_pb.NewArtifactRequest, callback: (error: grpc.ServiceError | null, response: artifact_pb.NewArtifactResponse) => void): grpc.ClientUnaryCall;
    createArtifact(request: artifact_pb.NewArtifactRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: artifact_pb.NewArtifactResponse) => void): grpc.ClientUnaryCall;
    createArtifact(request: artifact_pb.NewArtifactRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: artifact_pb.NewArtifactResponse) => void): grpc.ClientUnaryCall;
    updateArtifact(request: artifact_pb.UpdateArtifactRequest, callback: (error: grpc.ServiceError | null, response: artifact_pb.UpdateArtifactResponse) => void): grpc.ClientUnaryCall;
    updateArtifact(request: artifact_pb.UpdateArtifactRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: artifact_pb.UpdateArtifactResponse) => void): grpc.ClientUnaryCall;
    updateArtifact(request: artifact_pb.UpdateArtifactRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: artifact_pb.UpdateArtifactResponse) => void): grpc.ClientUnaryCall;
    deleteArtifact(request: artifact_pb.DeleteArtifactRequest, callback: (error: grpc.ServiceError | null, response: artifact_pb.DeleteArtifactResponse) => void): grpc.ClientUnaryCall;
    deleteArtifact(request: artifact_pb.DeleteArtifactRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: artifact_pb.DeleteArtifactResponse) => void): grpc.ClientUnaryCall;
    deleteArtifact(request: artifact_pb.DeleteArtifactRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: artifact_pb.DeleteArtifactResponse) => void): grpc.ClientUnaryCall;
    createTemplateDefinition(request: artifact_pb.NewTemplateDefinition, callback: (error: grpc.ServiceError | null, response: core_pb.TemplateDefinition) => void): grpc.ClientUnaryCall;
    createTemplateDefinition(request: artifact_pb.NewTemplateDefinition, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: core_pb.TemplateDefinition) => void): grpc.ClientUnaryCall;
    createTemplateDefinition(request: artifact_pb.NewTemplateDefinition, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: core_pb.TemplateDefinition) => void): grpc.ClientUnaryCall;
    commitLocalUpdates(request: artifact_pb.CommitUpdatesRequest, callback: (error: grpc.ServiceError | null, response: artifact_pb.CommitUpdatesResponse) => void): grpc.ClientUnaryCall;
    commitLocalUpdates(request: artifact_pb.CommitUpdatesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: artifact_pb.CommitUpdatesResponse) => void): grpc.ClientUnaryCall;
    commitLocalUpdates(request: artifact_pb.CommitUpdatesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: artifact_pb.CommitUpdatesResponse) => void): grpc.ClientUnaryCall;
    pullRequest(request: artifact_pb.IssuePullRequest, callback: (error: grpc.ServiceError | null, response: artifact_pb.IssuePullResponse) => void): grpc.ClientUnaryCall;
    pullRequest(request: artifact_pb.IssuePullRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: artifact_pb.IssuePullResponse) => void): grpc.ClientUnaryCall;
    pullRequest(request: artifact_pb.IssuePullRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: artifact_pb.IssuePullResponse) => void): grpc.ClientUnaryCall;
    getConfig(request: artifact_pb.ConfigurationRequest, callback: (error: grpc.ServiceError | null, response: artifact_pb.ServiceConfiguration) => void): grpc.ClientUnaryCall;
    getConfig(request: artifact_pb.ConfigurationRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: artifact_pb.ServiceConfiguration) => void): grpc.ClientUnaryCall;
    getConfig(request: artifact_pb.ConfigurationRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: artifact_pb.ServiceConfiguration) => void): grpc.ClientUnaryCall;
}

export class ServiceClient extends grpc.Client implements IServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public getFullTaxonomy(request: taxonomy_pb.TaxonomyVersion, callback: (error: grpc.ServiceError | null, response: taxonomy_pb.Taxonomy) => void): grpc.ClientUnaryCall;
    public getFullTaxonomy(request: taxonomy_pb.TaxonomyVersion, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: taxonomy_pb.Taxonomy) => void): grpc.ClientUnaryCall;
    public getFullTaxonomy(request: taxonomy_pb.TaxonomyVersion, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: taxonomy_pb.Taxonomy) => void): grpc.ClientUnaryCall;
    public getLiteTaxonomy(request: taxonomy_pb.TaxonomyVersion, callback: (error: grpc.ServiceError | null, response: taxonomy_pb.Taxonomy) => void): grpc.ClientUnaryCall;
    public getLiteTaxonomy(request: taxonomy_pb.TaxonomyVersion, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: taxonomy_pb.Taxonomy) => void): grpc.ClientUnaryCall;
    public getLiteTaxonomy(request: taxonomy_pb.TaxonomyVersion, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: taxonomy_pb.Taxonomy) => void): grpc.ClientUnaryCall;
    public getBaseArtifact(request: artifact_pb.ArtifactSymbol, callback: (error: grpc.ServiceError | null, response: core_pb.Base) => void): grpc.ClientUnaryCall;
    public getBaseArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: core_pb.Base) => void): grpc.ClientUnaryCall;
    public getBaseArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: core_pb.Base) => void): grpc.ClientUnaryCall;
    public getBehaviorArtifact(request: artifact_pb.ArtifactSymbol, callback: (error: grpc.ServiceError | null, response: core_pb.Behavior) => void): grpc.ClientUnaryCall;
    public getBehaviorArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: core_pb.Behavior) => void): grpc.ClientUnaryCall;
    public getBehaviorArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: core_pb.Behavior) => void): grpc.ClientUnaryCall;
    public getBehaviorGroupArtifact(request: artifact_pb.ArtifactSymbol, callback: (error: grpc.ServiceError | null, response: core_pb.BehaviorGroup) => void): grpc.ClientUnaryCall;
    public getBehaviorGroupArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: core_pb.BehaviorGroup) => void): grpc.ClientUnaryCall;
    public getBehaviorGroupArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: core_pb.BehaviorGroup) => void): grpc.ClientUnaryCall;
    public getPropertySetArtifact(request: artifact_pb.ArtifactSymbol, callback: (error: grpc.ServiceError | null, response: core_pb.PropertySet) => void): grpc.ClientUnaryCall;
    public getPropertySetArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: core_pb.PropertySet) => void): grpc.ClientUnaryCall;
    public getPropertySetArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: core_pb.PropertySet) => void): grpc.ClientUnaryCall;
    public getTemplateFormulaArtifact(request: artifact_pb.ArtifactSymbol, callback: (error: grpc.ServiceError | null, response: core_pb.TemplateFormula) => void): grpc.ClientUnaryCall;
    public getTemplateFormulaArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: core_pb.TemplateFormula) => void): grpc.ClientUnaryCall;
    public getTemplateFormulaArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: core_pb.TemplateFormula) => void): grpc.ClientUnaryCall;
    public getTemplateDefinitionArtifact(request: artifact_pb.ArtifactSymbol, callback: (error: grpc.ServiceError | null, response: core_pb.TemplateDefinition) => void): grpc.ClientUnaryCall;
    public getTemplateDefinitionArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: core_pb.TemplateDefinition) => void): grpc.ClientUnaryCall;
    public getTemplateDefinitionArtifact(request: artifact_pb.ArtifactSymbol, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: core_pb.TemplateDefinition) => void): grpc.ClientUnaryCall;
    public getTokenTemplate(request: artifact_pb.TokenTemplateId, callback: (error: grpc.ServiceError | null, response: core_pb.TokenTemplate) => void): grpc.ClientUnaryCall;
    public getTokenTemplate(request: artifact_pb.TokenTemplateId, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: core_pb.TokenTemplate) => void): grpc.ClientUnaryCall;
    public getTokenTemplate(request: artifact_pb.TokenTemplateId, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: core_pb.TokenTemplate) => void): grpc.ClientUnaryCall;
    public getTokenSpecification(request: artifact_pb.TokenTemplateId, callback: (error: grpc.ServiceError | null, response: core_pb.TokenSpecification) => void): grpc.ClientUnaryCall;
    public getTokenSpecification(request: artifact_pb.TokenTemplateId, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: core_pb.TokenSpecification) => void): grpc.ClientUnaryCall;
    public getTokenSpecification(request: artifact_pb.TokenTemplateId, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: core_pb.TokenSpecification) => void): grpc.ClientUnaryCall;
    public getArtifactsOfType(request: artifact_pb.QueryOptions, callback: (error: grpc.ServiceError | null, response: artifact_pb.QueryResult) => void): grpc.ClientUnaryCall;
    public getArtifactsOfType(request: artifact_pb.QueryOptions, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: artifact_pb.QueryResult) => void): grpc.ClientUnaryCall;
    public getArtifactsOfType(request: artifact_pb.QueryOptions, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: artifact_pb.QueryResult) => void): grpc.ClientUnaryCall;
    public initializeNewArtifact(request: artifact_pb.InitializeNewArtifactRequest, callback: (error: grpc.ServiceError | null, response: artifact_pb.InitializeNewArtifactResponse) => void): grpc.ClientUnaryCall;
    public initializeNewArtifact(request: artifact_pb.InitializeNewArtifactRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: artifact_pb.InitializeNewArtifactResponse) => void): grpc.ClientUnaryCall;
    public initializeNewArtifact(request: artifact_pb.InitializeNewArtifactRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: artifact_pb.InitializeNewArtifactResponse) => void): grpc.ClientUnaryCall;
    public createArtifact(request: artifact_pb.NewArtifactRequest, callback: (error: grpc.ServiceError | null, response: artifact_pb.NewArtifactResponse) => void): grpc.ClientUnaryCall;
    public createArtifact(request: artifact_pb.NewArtifactRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: artifact_pb.NewArtifactResponse) => void): grpc.ClientUnaryCall;
    public createArtifact(request: artifact_pb.NewArtifactRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: artifact_pb.NewArtifactResponse) => void): grpc.ClientUnaryCall;
    public updateArtifact(request: artifact_pb.UpdateArtifactRequest, callback: (error: grpc.ServiceError | null, response: artifact_pb.UpdateArtifactResponse) => void): grpc.ClientUnaryCall;
    public updateArtifact(request: artifact_pb.UpdateArtifactRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: artifact_pb.UpdateArtifactResponse) => void): grpc.ClientUnaryCall;
    public updateArtifact(request: artifact_pb.UpdateArtifactRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: artifact_pb.UpdateArtifactResponse) => void): grpc.ClientUnaryCall;
    public deleteArtifact(request: artifact_pb.DeleteArtifactRequest, callback: (error: grpc.ServiceError | null, response: artifact_pb.DeleteArtifactResponse) => void): grpc.ClientUnaryCall;
    public deleteArtifact(request: artifact_pb.DeleteArtifactRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: artifact_pb.DeleteArtifactResponse) => void): grpc.ClientUnaryCall;
    public deleteArtifact(request: artifact_pb.DeleteArtifactRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: artifact_pb.DeleteArtifactResponse) => void): grpc.ClientUnaryCall;
    public createTemplateDefinition(request: artifact_pb.NewTemplateDefinition, callback: (error: grpc.ServiceError | null, response: core_pb.TemplateDefinition) => void): grpc.ClientUnaryCall;
    public createTemplateDefinition(request: artifact_pb.NewTemplateDefinition, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: core_pb.TemplateDefinition) => void): grpc.ClientUnaryCall;
    public createTemplateDefinition(request: artifact_pb.NewTemplateDefinition, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: core_pb.TemplateDefinition) => void): grpc.ClientUnaryCall;
    public commitLocalUpdates(request: artifact_pb.CommitUpdatesRequest, callback: (error: grpc.ServiceError | null, response: artifact_pb.CommitUpdatesResponse) => void): grpc.ClientUnaryCall;
    public commitLocalUpdates(request: artifact_pb.CommitUpdatesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: artifact_pb.CommitUpdatesResponse) => void): grpc.ClientUnaryCall;
    public commitLocalUpdates(request: artifact_pb.CommitUpdatesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: artifact_pb.CommitUpdatesResponse) => void): grpc.ClientUnaryCall;
    public pullRequest(request: artifact_pb.IssuePullRequest, callback: (error: grpc.ServiceError | null, response: artifact_pb.IssuePullResponse) => void): grpc.ClientUnaryCall;
    public pullRequest(request: artifact_pb.IssuePullRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: artifact_pb.IssuePullResponse) => void): grpc.ClientUnaryCall;
    public pullRequest(request: artifact_pb.IssuePullRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: artifact_pb.IssuePullResponse) => void): grpc.ClientUnaryCall;
    public getConfig(request: artifact_pb.ConfigurationRequest, callback: (error: grpc.ServiceError | null, response: artifact_pb.ServiceConfiguration) => void): grpc.ClientUnaryCall;
    public getConfig(request: artifact_pb.ConfigurationRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: artifact_pb.ServiceConfiguration) => void): grpc.ClientUnaryCall;
    public getConfig(request: artifact_pb.ConfigurationRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: artifact_pb.ServiceConfiguration) => void): grpc.ClientUnaryCall;
}
