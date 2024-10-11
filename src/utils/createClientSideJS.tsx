import { template } from "./template";

export type ClientJS = {
  importStatement: string;
  publicPath: string;
  tempDir: string;
  clients: string[];
};

export async function createClientSideJS<T extends {}>({
  importStatement,
  publicPath,
  clients,
  tempDir,
}: ClientJS): Promise<string> {
  // extract the source file from the import statement
  const sourceFile = importStatement.split(" from ").pop();
  console.log("[reactPlugin] sourceFile", sourceFile);

  // generate the client side js file
  const generated = template(`import App from ${sourceFile};`);

  // generate a hash to uniquely identify the file
  const fileHash = Bun.hash(generated);

  // create a temp file path
  const tempEntryFile = `${tempDir}/client-${fileHash}.tsx`;
  const clientJSFile = `client-${fileHash}.js`;

  console.log("[reactPlugin] tempEntryFile", tempEntryFile);

  // check if the client side js file already exists
  const existingFile = clients.find((client) =>
    client.includes(clientJSFile)
  );

  // return the client side js file if it already exists
  if (existingFile) {
    console.log(
      "[reactPlugin] client side js file already exists",
      existingFile
    );
    return existingFile;
  }

  // write the generated source to a temp file
  await Bun.write(tempEntryFile, generated);

  // build the client side js file
  const build = await Bun.build({
    entrypoints: [tempEntryFile],
    naming: clientJSFile,
    outdir: publicPath,
    minify: true,
  });

  if (!build.success) {
    console.error("[reactPlugin] build failed", build.outputs);
    throw new Error("Build failed");
  }

  const clientSideJS = build.outputs[0].path;

  if (!clientSideJS) throw new Error("Client side JS file not found");

  // add the client side js file to the clients array
  clients.push(clientSideJS);

  return clientSideJS;
}
