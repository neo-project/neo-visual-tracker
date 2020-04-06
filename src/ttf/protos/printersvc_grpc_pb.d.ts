// package: taxonomy.ttfprinter
// file: printersvc.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as printersvc_pb from "./printersvc_pb";
import * as artifact_pb from "./artifact_pb";

interface IPrinterServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    printTTFArtifact: IPrinterServiceService_IPrintTTFArtifact;
    printTTF: IPrinterServiceService_IPrintTTF;
}

interface IPrinterServiceService_IPrintTTFArtifact extends grpc.MethodDefinition<printersvc_pb.ArtifactToPrint, printersvc_pb.PrintResult> {
    path: string; // "/taxonomy.ttfprinter.PrinterService/PrintTTFArtifact"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<printersvc_pb.ArtifactToPrint>;
    requestDeserialize: grpc.deserialize<printersvc_pb.ArtifactToPrint>;
    responseSerialize: grpc.serialize<printersvc_pb.PrintResult>;
    responseDeserialize: grpc.deserialize<printersvc_pb.PrintResult>;
}
interface IPrinterServiceService_IPrintTTF extends grpc.MethodDefinition<printersvc_pb.PrintTTFOptions, printersvc_pb.PrintResult> {
    path: string; // "/taxonomy.ttfprinter.PrinterService/PrintTTF"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<printersvc_pb.PrintTTFOptions>;
    requestDeserialize: grpc.deserialize<printersvc_pb.PrintTTFOptions>;
    responseSerialize: grpc.serialize<printersvc_pb.PrintResult>;
    responseDeserialize: grpc.deserialize<printersvc_pb.PrintResult>;
}

export const PrinterServiceService: IPrinterServiceService;

export interface IPrinterServiceServer {
    printTTFArtifact: grpc.handleUnaryCall<printersvc_pb.ArtifactToPrint, printersvc_pb.PrintResult>;
    printTTF: grpc.handleUnaryCall<printersvc_pb.PrintTTFOptions, printersvc_pb.PrintResult>;
}

export interface IPrinterServiceClient {
    printTTFArtifact(request: printersvc_pb.ArtifactToPrint, callback: (error: grpc.ServiceError | null, response: printersvc_pb.PrintResult) => void): grpc.ClientUnaryCall;
    printTTFArtifact(request: printersvc_pb.ArtifactToPrint, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: printersvc_pb.PrintResult) => void): grpc.ClientUnaryCall;
    printTTFArtifact(request: printersvc_pb.ArtifactToPrint, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: printersvc_pb.PrintResult) => void): grpc.ClientUnaryCall;
    printTTF(request: printersvc_pb.PrintTTFOptions, callback: (error: grpc.ServiceError | null, response: printersvc_pb.PrintResult) => void): grpc.ClientUnaryCall;
    printTTF(request: printersvc_pb.PrintTTFOptions, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: printersvc_pb.PrintResult) => void): grpc.ClientUnaryCall;
    printTTF(request: printersvc_pb.PrintTTFOptions, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: printersvc_pb.PrintResult) => void): grpc.ClientUnaryCall;
}

export class PrinterServiceClient extends grpc.Client implements IPrinterServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public printTTFArtifact(request: printersvc_pb.ArtifactToPrint, callback: (error: grpc.ServiceError | null, response: printersvc_pb.PrintResult) => void): grpc.ClientUnaryCall;
    public printTTFArtifact(request: printersvc_pb.ArtifactToPrint, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: printersvc_pb.PrintResult) => void): grpc.ClientUnaryCall;
    public printTTFArtifact(request: printersvc_pb.ArtifactToPrint, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: printersvc_pb.PrintResult) => void): grpc.ClientUnaryCall;
    public printTTF(request: printersvc_pb.PrintTTFOptions, callback: (error: grpc.ServiceError | null, response: printersvc_pb.PrintResult) => void): grpc.ClientUnaryCall;
    public printTTF(request: printersvc_pb.PrintTTFOptions, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: printersvc_pb.PrintResult) => void): grpc.ClientUnaryCall;
    public printTTF(request: printersvc_pb.PrintTTFOptions, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: printersvc_pb.PrintResult) => void): grpc.ClientUnaryCall;
}
