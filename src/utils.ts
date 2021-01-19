/**
 * Type that can be indexed with TypeName then FieldName.
 */
export type HasTypeField<TypeName extends string, FieldName extends string> = {
  [t in TypeName]: {
    [f in FieldName]: unknown;
  };
};

/**
 * Map arg names to corresponding validator functions.
 */
export type ArgsValidationConfig<ArgsType> = {
  [ArgName in keyof ArgsType]?: (value: ArgsType[ArgName]) => Promise<boolean>;
};
