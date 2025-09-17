import { defineBuildConfig } from 'unbuild';
import Replace from 'unplugin-replace/rollup';

export default defineBuildConfig({
  entries: ['./src/index'],
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
              replacement: '@rxjs-collection/observables/'
            },
            {
              find: /#operators\//gi,
              replacement: '@rxjs-collection/operators/'
            }
          ]
        })
      );
    }
  }
});
