import { defineBuildConfig } from 'unbuild';
import Replace from 'unplugin-replace/rollup';

export default defineBuildConfig({
  entries: ['./src/index'],
  externals: ['rxjs', 'minimatch', 'ascii-table3', 'chalk', 'debug', 'util', 'fast-equals'],
  declaration: true,
  rollup: {
    emitCJS: true
  },
  clean: true,
  hooks: {
    'rollup:options'(ctx, options) {
      options.plugins.push(
        Replace({
          values: [
            {
              find: /#observables\//gi,
              replacement: '../../observables/src/'
            },
            {
              find: /#operators\//gi,
              replacement: '../../operators/src/'
            }
          ]
        })
      );
    }
  }
});
