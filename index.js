import { _ as __awaiter } from './_tslib.js'
import { writeFileSync, readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const distPath = fileURLToPath(new URL('.', import.meta.url).href)
function adapter(options) {
	return {
		name: '@basjkorbee/sveltekit-adapter-firebase',
		adapt: function (builder) {
			return __awaiter(this, void 0, void 0, function* () {
				if (
					(options === null || options === void 0 ? void 0 : options.version) === 'v1' &&
					(options === null || options === void 0 ? void 0 : options.functionOptions)
				) {
					throw new Error('Function options can only be used with v2 functions')
				}
				const { outDir, version, functionOptions, functionName, nodeVersion } = Object.assign(
					Object.assign(
						{
							outDir: 'build',
							version: 'v2',
							functionName: 'handler',
							nodeVersion: '18',
						},
						options
					),
					{
						functionOptions:
							(options === null || options === void 0 ? void 0 : options.version) === 'v1'
								? null
								: Object.assign(
										{
											concurrency: 500,
										},
										options === null || options === void 0 ? void 0 : options.functionOptions
								  ),
					}
				)
				// empty out existing build directories
				builder.rimraf(outDir)
				builder.log.minor(`Publishing to "${outDir}"`)
				builder.log.minor('Copying assets...')
				const publishDir = `${outDir}${builder.config.kit.paths.base}`
				builder.writeClient(publishDir)
				builder.writePrerendered(publishDir)
				builder.log.info('Generating cloud function for Firebase...')
				yield generateCloudFunction({
					builder,
					outDir,
					version,
					functionName,
					functionOptions,
				})
				builder.log.info('Generating production package.json for Firebase...')
				generateProductionPackageJson({
					outDir,
					nodeVersion,
				})
				if (options.autoInstallDeps) {
          console.log('Installing dependencies in functions directory. This might take a while...')
					spawnSync('npm', ['install'], {
						cwd: outDir,
						stdio: 'inherit',
						shell: true,
					})
				} else console.log('Skipping installation of dependencies in functions directory.')
			})
		},
	}
}
function generateCloudFunction({ builder, outDir, version, functionName, functionOptions }) {
	return __awaiter(this, void 0, void 0, function* () {
		builder.mkdirp(join(outDir, '.firebase', 'function'))
		builder.writeServer(join(outDir, '.firebase', 'server'))
		const replace = {
			'0SERVER': './../server/index.js', // digit prefix prevents CJS build from using this as a variable name, which would also get replaced
		}

		builder.copy(join(`${distPath}`, 'function.js'), join(outDir, '.firebase', 'function', 'function.js'), {
			replace,
		})
		builder.copy(join(`${distPath}`, '_tslib.js'), join(outDir, '.firebase', 'function', '_tslib.js'))
		builder.log.minor('Generating cloud function...')
		const manifest = builder.generateManifest({
			relativePath: '../server',
		})
		const initImport = `import { init } from './function.js';`
		const firebaseImport = `import { onRequest } from 'firebase-functions/${version}/https';`
		const functionOptionsParam = functionOptions
			? `${JSON.stringify({ ...functionOptions, cors: functionOptions.cors.toString() })}, `
			: ''
		const functionConst = `export const ${functionName} = onRequest(${functionOptionsParam}init(${manifest}));`
		const entrypointFile = `${initImport}\n${firebaseImport}\n\n${functionConst}\n`
		writeFileSync(join(outDir, '.firebase', 'function', 'entrypoint.js'), entrypointFile)
	})
}
function generateProductionPackageJson({ outDir, nodeVersion }) {
	const packageJsonString = readFileSync('package.json')
	const packageJson = JSON.parse(packageJsonString.toString())
	const firebaseConfig = {
		dependencies: Object.assign(
			Object.assign({}, packageJson === null || packageJson === void 0 ? void 0 : packageJson.dependencies),
			{
				'firebase-functions': '^4.4.1',
				devalue: '^4.3.2',
				'set-cookie-parser': '^2.6.0',
			}
		),
		main: '.firebase/function/entrypoint.js',
		engines: {
			node: nodeVersion,
		},
		type: 'module',
	}
	const updatedPackageJson = Object.assign(Object.assign({}, packageJson), firebaseConfig)
	//Firebase doesn't handle overlapping dev and prod dependencies well, so we delete devDeps as they are not needed anyway
	delete updatedPackageJson.devDependencies
	writeFileSync(join(outDir, 'package.json'), JSON.stringify(updatedPackageJson, null, 2))
}

export { adapter as default }
