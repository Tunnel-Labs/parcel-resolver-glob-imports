const { Resolver } = require('@parcel/plugin');
const {
	getGlobfileContents,
	getGlobfileMatchedFiles,
	getGlobfilePath,
	isGlobSpecifier
} = require('glob-imports');

module.exports = new Resolver({
	async resolve({ specifier, dependency }) {
		if (!isGlobSpecifier(specifier)) {
			return null;
		}

		const globfilePath = getGlobfilePath({
			globfileModuleSpecifier: specifier,
			importerFilePath: dependency.resolveFrom
		});
		const globfileMatchedFiles = getGlobfileMatchedFiles({ globfilePath });
		const globfileContents = getGlobfileContents({
			globfilePath,
			// Parcel does not support absolute filepath imports
			filepathType: 'relative'
		});

		return {
			invalidateOnFileChange: globfileMatchedFiles.map(
				({ absoluteFilePath }) => absoluteFilePath
			),
			// invalidateOnFileCreate: [{ glob: globfilePath }],
			filePath: globfilePath,
			code: globfileContents
		};
	}
});
