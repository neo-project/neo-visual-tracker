// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var taxonomy_pb = require('./taxonomy_pb.js');
var core_pb = require('./core_pb.js');
var artifact_pb = require('./artifact_pb.js');

function serialize_taxonomy_model_Taxonomy(arg) {
  if (!(arg instanceof taxonomy_pb.Taxonomy)) {
    throw new Error('Expected argument of type taxonomy.model.Taxonomy');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_Taxonomy(buffer_arg) {
  return taxonomy_pb.Taxonomy.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_TaxonomyVersion(arg) {
  if (!(arg instanceof taxonomy_pb.TaxonomyVersion)) {
    throw new Error('Expected argument of type taxonomy.model.TaxonomyVersion');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_TaxonomyVersion(buffer_arg) {
  return taxonomy_pb.TaxonomyVersion.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_artifact_ArtifactSymbol(arg) {
  if (!(arg instanceof artifact_pb.ArtifactSymbol)) {
    throw new Error('Expected argument of type taxonomy.model.artifact.ArtifactSymbol');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_artifact_ArtifactSymbol(buffer_arg) {
  return artifact_pb.ArtifactSymbol.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_artifact_CommitUpdatesRequest(arg) {
  if (!(arg instanceof artifact_pb.CommitUpdatesRequest)) {
    throw new Error('Expected argument of type taxonomy.model.artifact.CommitUpdatesRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_artifact_CommitUpdatesRequest(buffer_arg) {
  return artifact_pb.CommitUpdatesRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_artifact_CommitUpdatesResponse(arg) {
  if (!(arg instanceof artifact_pb.CommitUpdatesResponse)) {
    throw new Error('Expected argument of type taxonomy.model.artifact.CommitUpdatesResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_artifact_CommitUpdatesResponse(buffer_arg) {
  return artifact_pb.CommitUpdatesResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_artifact_ConfigurationRequest(arg) {
  if (!(arg instanceof artifact_pb.ConfigurationRequest)) {
    throw new Error('Expected argument of type taxonomy.model.artifact.ConfigurationRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_artifact_ConfigurationRequest(buffer_arg) {
  return artifact_pb.ConfigurationRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_artifact_DeleteArtifactRequest(arg) {
  if (!(arg instanceof artifact_pb.DeleteArtifactRequest)) {
    throw new Error('Expected argument of type taxonomy.model.artifact.DeleteArtifactRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_artifact_DeleteArtifactRequest(buffer_arg) {
  return artifact_pb.DeleteArtifactRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_artifact_DeleteArtifactResponse(arg) {
  if (!(arg instanceof artifact_pb.DeleteArtifactResponse)) {
    throw new Error('Expected argument of type taxonomy.model.artifact.DeleteArtifactResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_artifact_DeleteArtifactResponse(buffer_arg) {
  return artifact_pb.DeleteArtifactResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_artifact_InitializeNewArtifactRequest(arg) {
  if (!(arg instanceof artifact_pb.InitializeNewArtifactRequest)) {
    throw new Error('Expected argument of type taxonomy.model.artifact.InitializeNewArtifactRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_artifact_InitializeNewArtifactRequest(buffer_arg) {
  return artifact_pb.InitializeNewArtifactRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_artifact_InitializeNewArtifactResponse(arg) {
  if (!(arg instanceof artifact_pb.InitializeNewArtifactResponse)) {
    throw new Error('Expected argument of type taxonomy.model.artifact.InitializeNewArtifactResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_artifact_InitializeNewArtifactResponse(buffer_arg) {
  return artifact_pb.InitializeNewArtifactResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_artifact_IssuePullRequest(arg) {
  if (!(arg instanceof artifact_pb.IssuePullRequest)) {
    throw new Error('Expected argument of type taxonomy.model.artifact.IssuePullRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_artifact_IssuePullRequest(buffer_arg) {
  return artifact_pb.IssuePullRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_artifact_IssuePullResponse(arg) {
  if (!(arg instanceof artifact_pb.IssuePullResponse)) {
    throw new Error('Expected argument of type taxonomy.model.artifact.IssuePullResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_artifact_IssuePullResponse(buffer_arg) {
  return artifact_pb.IssuePullResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_artifact_NewArtifactRequest(arg) {
  if (!(arg instanceof artifact_pb.NewArtifactRequest)) {
    throw new Error('Expected argument of type taxonomy.model.artifact.NewArtifactRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_artifact_NewArtifactRequest(buffer_arg) {
  return artifact_pb.NewArtifactRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_artifact_NewArtifactResponse(arg) {
  if (!(arg instanceof artifact_pb.NewArtifactResponse)) {
    throw new Error('Expected argument of type taxonomy.model.artifact.NewArtifactResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_artifact_NewArtifactResponse(buffer_arg) {
  return artifact_pb.NewArtifactResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_artifact_NewTemplateDefinition(arg) {
  if (!(arg instanceof artifact_pb.NewTemplateDefinition)) {
    throw new Error('Expected argument of type taxonomy.model.artifact.NewTemplateDefinition');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_artifact_NewTemplateDefinition(buffer_arg) {
  return artifact_pb.NewTemplateDefinition.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_artifact_QueryOptions(arg) {
  if (!(arg instanceof artifact_pb.QueryOptions)) {
    throw new Error('Expected argument of type taxonomy.model.artifact.QueryOptions');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_artifact_QueryOptions(buffer_arg) {
  return artifact_pb.QueryOptions.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_artifact_QueryResult(arg) {
  if (!(arg instanceof artifact_pb.QueryResult)) {
    throw new Error('Expected argument of type taxonomy.model.artifact.QueryResult');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_artifact_QueryResult(buffer_arg) {
  return artifact_pb.QueryResult.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_artifact_ServiceConfiguration(arg) {
  if (!(arg instanceof artifact_pb.ServiceConfiguration)) {
    throw new Error('Expected argument of type taxonomy.model.artifact.ServiceConfiguration');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_artifact_ServiceConfiguration(buffer_arg) {
  return artifact_pb.ServiceConfiguration.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_artifact_TokenTemplateId(arg) {
  if (!(arg instanceof artifact_pb.TokenTemplateId)) {
    throw new Error('Expected argument of type taxonomy.model.artifact.TokenTemplateId');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_artifact_TokenTemplateId(buffer_arg) {
  return artifact_pb.TokenTemplateId.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_artifact_UpdateArtifactRequest(arg) {
  if (!(arg instanceof artifact_pb.UpdateArtifactRequest)) {
    throw new Error('Expected argument of type taxonomy.model.artifact.UpdateArtifactRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_artifact_UpdateArtifactRequest(buffer_arg) {
  return artifact_pb.UpdateArtifactRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_artifact_UpdateArtifactResponse(arg) {
  if (!(arg instanceof artifact_pb.UpdateArtifactResponse)) {
    throw new Error('Expected argument of type taxonomy.model.artifact.UpdateArtifactResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_artifact_UpdateArtifactResponse(buffer_arg) {
  return artifact_pb.UpdateArtifactResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_core_Base(arg) {
  if (!(arg instanceof core_pb.Base)) {
    throw new Error('Expected argument of type taxonomy.model.core.Base');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_core_Base(buffer_arg) {
  return core_pb.Base.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_core_Behavior(arg) {
  if (!(arg instanceof core_pb.Behavior)) {
    throw new Error('Expected argument of type taxonomy.model.core.Behavior');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_core_Behavior(buffer_arg) {
  return core_pb.Behavior.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_core_BehaviorGroup(arg) {
  if (!(arg instanceof core_pb.BehaviorGroup)) {
    throw new Error('Expected argument of type taxonomy.model.core.BehaviorGroup');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_core_BehaviorGroup(buffer_arg) {
  return core_pb.BehaviorGroup.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_core_PropertySet(arg) {
  if (!(arg instanceof core_pb.PropertySet)) {
    throw new Error('Expected argument of type taxonomy.model.core.PropertySet');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_core_PropertySet(buffer_arg) {
  return core_pb.PropertySet.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_core_TemplateDefinition(arg) {
  if (!(arg instanceof core_pb.TemplateDefinition)) {
    throw new Error('Expected argument of type taxonomy.model.core.TemplateDefinition');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_core_TemplateDefinition(buffer_arg) {
  return core_pb.TemplateDefinition.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_core_TemplateFormula(arg) {
  if (!(arg instanceof core_pb.TemplateFormula)) {
    throw new Error('Expected argument of type taxonomy.model.core.TemplateFormula');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_core_TemplateFormula(buffer_arg) {
  return core_pb.TemplateFormula.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_core_TokenSpecification(arg) {
  if (!(arg instanceof core_pb.TokenSpecification)) {
    throw new Error('Expected argument of type taxonomy.model.core.TokenSpecification');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_core_TokenSpecification(buffer_arg) {
  return core_pb.TokenSpecification.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_model_core_TokenTemplate(arg) {
  if (!(arg instanceof core_pb.TokenTemplate)) {
    throw new Error('Expected argument of type taxonomy.model.core.TokenTemplate');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_model_core_TokenTemplate(buffer_arg) {
  return core_pb.TokenTemplate.deserializeBinary(new Uint8Array(buffer_arg));
}


// Taxonomy Service - Create, Read, Update, Delete for the Taxonomy Object Model
var ServiceService = exports.ServiceService = {
  // Get the a complete TOM in a single request. Preferred method for applications when the TOM is local.
getFullTaxonomy: {
    path: '/taxonomy.Service/GetFullTaxonomy',
    requestStream: false,
    responseStream: false,
    requestType: taxonomy_pb.TaxonomyVersion,
    responseType: taxonomy_pb.Taxonomy,
    requestSerialize: serialize_taxonomy_model_TaxonomyVersion,
    requestDeserialize: deserialize_taxonomy_model_TaxonomyVersion,
    responseSerialize: serialize_taxonomy_model_Taxonomy,
    responseDeserialize: deserialize_taxonomy_model_Taxonomy,
  },
  // Get a partial TOM with references only to artifacts.
getLiteTaxonomy: {
    path: '/taxonomy.Service/GetLiteTaxonomy',
    requestStream: false,
    responseStream: false,
    requestType: taxonomy_pb.TaxonomyVersion,
    responseType: taxonomy_pb.Taxonomy,
    requestSerialize: serialize_taxonomy_model_TaxonomyVersion,
    requestDeserialize: deserialize_taxonomy_model_TaxonomyVersion,
    responseSerialize: serialize_taxonomy_model_Taxonomy,
    responseDeserialize: deserialize_taxonomy_model_Taxonomy,
  },
  // Get a Token Base artifact by Id.
getBaseArtifact: {
    path: '/taxonomy.Service/GetBaseArtifact',
    requestStream: false,
    responseStream: false,
    requestType: artifact_pb.ArtifactSymbol,
    responseType: core_pb.Base,
    requestSerialize: serialize_taxonomy_model_artifact_ArtifactSymbol,
    requestDeserialize: deserialize_taxonomy_model_artifact_ArtifactSymbol,
    responseSerialize: serialize_taxonomy_model_core_Base,
    responseDeserialize: deserialize_taxonomy_model_core_Base,
  },
  // Get a Behavior by Id.
getBehaviorArtifact: {
    path: '/taxonomy.Service/GetBehaviorArtifact',
    requestStream: false,
    responseStream: false,
    requestType: artifact_pb.ArtifactSymbol,
    responseType: core_pb.Behavior,
    requestSerialize: serialize_taxonomy_model_artifact_ArtifactSymbol,
    requestDeserialize: deserialize_taxonomy_model_artifact_ArtifactSymbol,
    responseSerialize: serialize_taxonomy_model_core_Behavior,
    responseDeserialize: deserialize_taxonomy_model_core_Behavior,
  },
  // Get a BehaviorGroup by Id.
getBehaviorGroupArtifact: {
    path: '/taxonomy.Service/GetBehaviorGroupArtifact',
    requestStream: false,
    responseStream: false,
    requestType: artifact_pb.ArtifactSymbol,
    responseType: core_pb.BehaviorGroup,
    requestSerialize: serialize_taxonomy_model_artifact_ArtifactSymbol,
    requestDeserialize: deserialize_taxonomy_model_artifact_ArtifactSymbol,
    responseSerialize: serialize_taxonomy_model_core_BehaviorGroup,
    responseDeserialize: deserialize_taxonomy_model_core_BehaviorGroup,
  },
  // Get a PropertySet by Id.
getPropertySetArtifact: {
    path: '/taxonomy.Service/GetPropertySetArtifact',
    requestStream: false,
    responseStream: false,
    requestType: artifact_pb.ArtifactSymbol,
    responseType: core_pb.PropertySet,
    requestSerialize: serialize_taxonomy_model_artifact_ArtifactSymbol,
    requestDeserialize: deserialize_taxonomy_model_artifact_ArtifactSymbol,
    responseSerialize: serialize_taxonomy_model_core_PropertySet,
    responseDeserialize: deserialize_taxonomy_model_core_PropertySet,
  },
  // Get a TemplateFormula by Id.
getTemplateFormulaArtifact: {
    path: '/taxonomy.Service/GetTemplateFormulaArtifact',
    requestStream: false,
    responseStream: false,
    requestType: artifact_pb.ArtifactSymbol,
    responseType: core_pb.TemplateFormula,
    requestSerialize: serialize_taxonomy_model_artifact_ArtifactSymbol,
    requestDeserialize: deserialize_taxonomy_model_artifact_ArtifactSymbol,
    responseSerialize: serialize_taxonomy_model_core_TemplateFormula,
    responseDeserialize: deserialize_taxonomy_model_core_TemplateFormula,
  },
  // Get a TemplateDefinition by Id.
getTemplateDefinitionArtifact: {
    path: '/taxonomy.Service/GetTemplateDefinitionArtifact',
    requestStream: false,
    responseStream: false,
    requestType: artifact_pb.ArtifactSymbol,
    responseType: core_pb.TemplateDefinition,
    requestSerialize: serialize_taxonomy_model_artifact_ArtifactSymbol,
    requestDeserialize: deserialize_taxonomy_model_artifact_ArtifactSymbol,
    responseSerialize: serialize_taxonomy_model_core_TemplateDefinition,
    responseDeserialize: deserialize_taxonomy_model_core_TemplateDefinition,
  },
  // Get a Token Template by TokenDefinition.Id.
getTokenTemplate: {
    path: '/taxonomy.Service/GetTokenTemplate',
    requestStream: false,
    responseStream: false,
    requestType: artifact_pb.TokenTemplateId,
    responseType: core_pb.TokenTemplate,
    requestSerialize: serialize_taxonomy_model_artifact_TokenTemplateId,
    requestDeserialize: deserialize_taxonomy_model_artifact_TokenTemplateId,
    responseSerialize: serialize_taxonomy_model_core_TokenTemplate,
    responseDeserialize: deserialize_taxonomy_model_core_TokenTemplate,
  },
  // Get a Token Specification by TokenDefinition.Id.
getTokenSpecification: {
    path: '/taxonomy.Service/GetTokenSpecification',
    requestStream: false,
    responseStream: false,
    requestType: artifact_pb.TokenTemplateId,
    responseType: core_pb.TokenSpecification,
    requestSerialize: serialize_taxonomy_model_artifact_TokenTemplateId,
    requestDeserialize: deserialize_taxonomy_model_artifact_TokenTemplateId,
    responseSerialize: serialize_taxonomy_model_core_TokenSpecification,
    responseDeserialize: deserialize_taxonomy_model_core_TokenSpecification,
  },
  // Get artifacts by type using query options.
getArtifactsOfType: {
    path: '/taxonomy.Service/GetArtifactsOfType',
    requestStream: false,
    responseStream: false,
    requestType: artifact_pb.QueryOptions,
    responseType: artifact_pb.QueryResult,
    requestSerialize: serialize_taxonomy_model_artifact_QueryOptions,
    requestDeserialize: deserialize_taxonomy_model_artifact_QueryOptions,
    responseSerialize: serialize_taxonomy_model_artifact_QueryResult,
    responseDeserialize: deserialize_taxonomy_model_artifact_QueryResult,
  },
  // Initialize a new artifact object and return it for updating. Assigns a unique identifier for the type.
initializeNewArtifact: {
    path: '/taxonomy.Service/InitializeNewArtifact',
    requestStream: false,
    responseStream: false,
    requestType: artifact_pb.InitializeNewArtifactRequest,
    responseType: artifact_pb.InitializeNewArtifactResponse,
    requestSerialize: serialize_taxonomy_model_artifact_InitializeNewArtifactRequest,
    requestDeserialize: deserialize_taxonomy_model_artifact_InitializeNewArtifactRequest,
    responseSerialize: serialize_taxonomy_model_artifact_InitializeNewArtifactResponse,
    responseDeserialize: deserialize_taxonomy_model_artifact_InitializeNewArtifactResponse,
  },
  // Submit a newly created artifact object to be saved.
createArtifact: {
    path: '/taxonomy.Service/CreateArtifact',
    requestStream: false,
    responseStream: false,
    requestType: artifact_pb.NewArtifactRequest,
    responseType: artifact_pb.NewArtifactResponse,
    requestSerialize: serialize_taxonomy_model_artifact_NewArtifactRequest,
    requestDeserialize: deserialize_taxonomy_model_artifact_NewArtifactRequest,
    responseSerialize: serialize_taxonomy_model_artifact_NewArtifactResponse,
    responseDeserialize: deserialize_taxonomy_model_artifact_NewArtifactResponse,
  },
  // Submit an updated artifact object to be saved.
updateArtifact: {
    path: '/taxonomy.Service/UpdateArtifact',
    requestStream: false,
    responseStream: false,
    requestType: artifact_pb.UpdateArtifactRequest,
    responseType: artifact_pb.UpdateArtifactResponse,
    requestSerialize: serialize_taxonomy_model_artifact_UpdateArtifactRequest,
    requestDeserialize: deserialize_taxonomy_model_artifact_UpdateArtifactRequest,
    responseSerialize: serialize_taxonomy_model_artifact_UpdateArtifactResponse,
    responseDeserialize: deserialize_taxonomy_model_artifact_UpdateArtifactResponse,
  },
  // Delete an artifact by Id.
deleteArtifact: {
    path: '/taxonomy.Service/DeleteArtifact',
    requestStream: false,
    responseStream: false,
    requestType: artifact_pb.DeleteArtifactRequest,
    responseType: artifact_pb.DeleteArtifactResponse,
    requestSerialize: serialize_taxonomy_model_artifact_DeleteArtifactRequest,
    requestDeserialize: deserialize_taxonomy_model_artifact_DeleteArtifactRequest,
    responseSerialize: serialize_taxonomy_model_artifact_DeleteArtifactResponse,
    responseDeserialize: deserialize_taxonomy_model_artifact_DeleteArtifactResponse,
  },
  // Create a TemplateDefinition from a TemplateFormula.
createTemplateDefinition: {
    path: '/taxonomy.Service/CreateTemplateDefinition',
    requestStream: false,
    responseStream: false,
    requestType: artifact_pb.NewTemplateDefinition,
    responseType: core_pb.TemplateDefinition,
    requestSerialize: serialize_taxonomy_model_artifact_NewTemplateDefinition,
    requestDeserialize: deserialize_taxonomy_model_artifact_NewTemplateDefinition,
    responseSerialize: serialize_taxonomy_model_core_TemplateDefinition,
    responseDeserialize: deserialize_taxonomy_model_core_TemplateDefinition,
  },
  // Issue a commit for updates made to the local git.
commitLocalUpdates: {
    path: '/taxonomy.Service/CommitLocalUpdates',
    requestStream: false,
    responseStream: false,
    requestType: artifact_pb.CommitUpdatesRequest,
    responseType: artifact_pb.CommitUpdatesResponse,
    requestSerialize: serialize_taxonomy_model_artifact_CommitUpdatesRequest,
    requestDeserialize: deserialize_taxonomy_model_artifact_CommitUpdatesRequest,
    responseSerialize: serialize_taxonomy_model_artifact_CommitUpdatesResponse,
    responseDeserialize: deserialize_taxonomy_model_artifact_CommitUpdatesResponse,
  },
  // Issue a pull request from the local clone to the global source.
pullRequest: {
    path: '/taxonomy.Service/PullRequest',
    requestStream: false,
    responseStream: false,
    requestType: artifact_pb.IssuePullRequest,
    responseType: artifact_pb.IssuePullResponse,
    requestSerialize: serialize_taxonomy_model_artifact_IssuePullRequest,
    requestDeserialize: deserialize_taxonomy_model_artifact_IssuePullRequest,
    responseSerialize: serialize_taxonomy_model_artifact_IssuePullResponse,
    responseDeserialize: deserialize_taxonomy_model_artifact_IssuePullResponse,
  },
  // Retrieve service configuration.
getConfig: {
    path: '/taxonomy.Service/GetConfig',
    requestStream: false,
    responseStream: false,
    requestType: artifact_pb.ConfigurationRequest,
    responseType: artifact_pb.ServiceConfiguration,
    requestSerialize: serialize_taxonomy_model_artifact_ConfigurationRequest,
    requestDeserialize: deserialize_taxonomy_model_artifact_ConfigurationRequest,
    responseSerialize: serialize_taxonomy_model_artifact_ServiceConfiguration,
    responseDeserialize: deserialize_taxonomy_model_artifact_ServiceConfiguration,
  },
};

exports.ServiceClient = grpc.makeGenericClientConstructor(ServiceService);
