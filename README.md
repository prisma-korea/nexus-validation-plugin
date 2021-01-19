# Nexus Validation Plugin

`nexus-validation-plugin` is a [Nexus](https://github.com/graphql-nexus/nexus) plugin for argument validation.

Before executing a field resolver, `nexus-validation-plugin` will look for the `validation` config object.
If `validation` object exists, the plugin will run each validation function and the `resolve` function only gets called when all validation passes.
If any one of the validation function fails, field resolution throws an error stating which argument is invalid.

## Installation
```
npm install nexus-validation-plugin
```

## Example
```ts
import { mutationField, nonNull, stringArg } from 'nexus';
import { validationPlugin } from 'nexus-validation-plugin';

const signInEmail = mutationField('signInEmail', {
  type: nonNull('User'),

  args: {
    email: nonNull(stringArg()),
    password: nonNull(stringArg()),
  },

  validation: {
    email: async (value) => /.*@.*/.test(value), // Should contain @.
    password: async (value) => value !== '', // Should not be empty.
  },

  resolve: async (parent, args, ctx) => {
    // Resolver only runs after successful validation.
    // ...
  }
});

const schema = makeSchema({
  [signInEmail],
  plugins: [validationPlugin()],
});
```
