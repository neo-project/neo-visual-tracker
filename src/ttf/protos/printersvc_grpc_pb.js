// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var printersvc_pb = require('./printersvc_pb.js');
var artifact_pb = require('./artifact_pb.js');

function serialize_taxonomy_ttfprinter_ArtifactToPrint(arg) {
  if (!(arg instanceof printersvc_pb.ArtifactToPrint)) {
    throw new Error('Expected argument of type taxonomy.ttfprinter.ArtifactToPrint');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_ttfprinter_ArtifactToPrint(buffer_arg) {
  return printersvc_pb.ArtifactToPrint.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_ttfprinter_PrintResult(arg) {
  if (!(arg instanceof printersvc_pb.PrintResult)) {
    throw new Error('Expected argument of type taxonomy.ttfprinter.PrintResult');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_ttfprinter_PrintResult(buffer_arg) {
  return printersvc_pb.PrintResult.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_taxonomy_ttfprinter_PrintTTFOptions(arg) {
  if (!(arg instanceof printersvc_pb.PrintTTFOptions)) {
    throw new Error('Expected argument of type taxonomy.ttfprinter.PrintTTFOptions');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_taxonomy_ttfprinter_PrintTTFOptions(buffer_arg) {
  return printersvc_pb.PrintTTFOptions.deserializeBinary(new Uint8Array(buffer_arg));
}


// Service to Print Artifacts to OpenXML format.
var PrinterServiceService = exports.PrinterServiceService = {
  // Print an artifact by Type and Id.
printTTFArtifact: {
    path: '/taxonomy.ttfprinter.PrinterService/PrintTTFArtifact',
    requestStream: false,
    responseStream: false,
    requestType: printersvc_pb.ArtifactToPrint,
    responseType: printersvc_pb.PrintResult,
    requestSerialize: serialize_taxonomy_ttfprinter_ArtifactToPrint,
    requestDeserialize: deserialize_taxonomy_ttfprinter_ArtifactToPrint,
    responseSerialize: serialize_taxonomy_ttfprinter_PrintResult,
    responseDeserialize: deserialize_taxonomy_ttfprinter_PrintResult,
  },
  // Print all artifacts in either multiple artifact files in their repective artifact folders or a single TTF Book file.
printTTF: {
    path: '/taxonomy.ttfprinter.PrinterService/PrintTTF',
    requestStream: false,
    responseStream: false,
    requestType: printersvc_pb.PrintTTFOptions,
    responseType: printersvc_pb.PrintResult,
    requestSerialize: serialize_taxonomy_ttfprinter_PrintTTFOptions,
    requestDeserialize: deserialize_taxonomy_ttfprinter_PrintTTFOptions,
    responseSerialize: serialize_taxonomy_ttfprinter_PrintResult,
    responseDeserialize: deserialize_taxonomy_ttfprinter_PrintResult,
  },
};

exports.PrinterServiceClient = grpc.makeGenericClientConstructor(PrinterServiceService);
