import {
  NexusPlugin,
  printedGenTyping,
  printedGenTypingImport,
} from 'nexus/dist/core';

import { plugin } from 'nexus';

/**
 * Insert import statement inside generated nexus file.
 */
const ValidationPluginImport = printedGenTypingImport({
  module: 'nexus-validation-plugin/utils',
  bindings: ['ArgsValidationConfig', 'HasTypeField'],
});

/**
 * Add `validate` property to field definitions.
 */
const fieldDefTypes = printedGenTyping({
  optional: true,
  name: 'validate',
  description:
    'Async validation function. Reject when validation fails. Resolve otherwise.',
  type: `
    NexusGenArgTypes extends HasTypeField<TypeName, FieldName>
    ? ArgsValidationConfig<NexusGenArgTypes[TypeName][FieldName]>
    : never
    `,
  imports: [ValidationPluginImport],
});

export function validationPlugin(): NexusPlugin {
  return plugin({
    name: 'ValidationPlugin',
    description: 'Validates args.',
    fieldDefTypes,
    onCreateFieldResolver: (config) => {
      // Get `validate` property from field definition.
      const validationConfig =
        config.fieldConfig.extensions?.nexus?.config?.validate;

      // If there is no `validate` property, do not validate args.
      if (!validationConfig) return;

      return async (root, args, ctx, info, next) => {
        // Run all validation functions.
        // Proceed only when all returns true.
        const validationPromise = Promise.all(
          Object.keys(validationConfig).map(async (key) => {
            if (validationConfig[key]) {
              const validationResult = await validationConfig[key](args[key]);

              if (!validationResult) throw new Error(`Invalid [${key}] arg.`);
            }
          }),
        );

        return plugin.completeValue(
          validationPromise,
          () => next(root, args, ctx, info),
          (err) => {
            if (err instanceof Error) throw err;
          },
        );
      };
    },
  });
}
