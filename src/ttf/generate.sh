#!/bin/bash

BASEDIR=$(dirname "$0")
cd "${BASEDIR}"/../../

PROTOC_GEN_TS_PATH="./node_modules/.bin/protoc-gen-ts"
GRPC_TOOLS_NODE_PROTOC_PLUGIN="./node_modules/.bin/grpc_tools_node_protoc_plugin"
GRPC_TOOLS_NODE_PROTOC="./node_modules/.bin/grpc_tools_node_protoc"

for f in ./src/ttf/protos; do

  # loop over all the available proto files and compile them into respective dir
  # JavaScript code generating
  ${GRPC_TOOLS_NODE_PROTOC} \
      --js_out=import_style=commonjs,binary:"${f}" \
      --grpc_out="${f}" \
      --plugin=protoc-gen-grpc="${GRPC_TOOLS_NODE_PROTOC_PLUGIN}" \
      -I "${f}" \
      "${f}"/*.proto

  ${GRPC_TOOLS_NODE_PROTOC} \
      --plugin=protoc-gen-ts="${PROTOC_GEN_TS_PATH}" \
      --ts_out="${f}" \
      -I "${f}" \
      "${f}"/*.proto

done

# TODO: This is needed to make gRPC work from within Electron (VS Code runs on Electron).
#       Consider using an npm hook to do this at the right time.
npm rebuild --target=7.1.0 --runtime=electron --dist-url=https://atom.io/download/electron

# TODO: This is a hack to get the generated code into the out folder for the VS Code extension.
#       Should update the main tsconfig to make the right thing happen.
mkdir -p out/ttf/protos
cp src/ttf/protos/* out/ttf/protos/