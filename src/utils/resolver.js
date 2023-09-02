const { Resolver } = require("@parcel/plugin");
const { isGlobSpecifier, createGlobfileManager } = require("glob-imports");

const { getMonorepoDirpath } = require("get-monorepo-root");
const monorepoDirpath = getMonorepoDirpath(__dirname);
if (monorepoDirpath === undefined) {
  throw new Error("Could not get monorepo dirpath");
}

const { getGlobfileContents, getGlobfileMatchedFiles, getGlobfilePath } =
  createGlobfileManager({ monorepoDirpath });

module.exports = new Resolver({
  async resolve({ specifier, dependency }) {
    if (!isGlobSpecifier(specifier)) {
      return null;
    }

    const globfilePath = getGlobfilePath({
      globfileModuleSpecifier: specifier,
      importerFilepath: dependency.resolveFrom,
    });
    const globfileMatchedFiles = getGlobfileMatchedFiles({ globfilePath });
    const globfileContents = getGlobfileContents({
      globfilePath,
      // Parcel does not support absolute filepath imports
      filepathType: "relative",
    });

    return {
      invalidateOnFileChange: globfileMatchedFiles.map(
        ({ absoluteFilePath }) => absoluteFilePath
      ),
      // invalidateOnFileCreate: [{ glob: globfilePath }],
      filePath: globfilePath,
      code: globfileContents,
    };
  },
});
