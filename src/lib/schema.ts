type SchemaDefinition<DocType> = {
  attributes?: AttributesDefinition<DocType>;
  relationships?: RelationshipsDefinition<DocType>;
}

type AttributesDefinition<DocType> = {
  [path in keyof DocType]?: AttributeDefinition<DocType[path]>;
}

type AttributeDefinition<T> = {
  type?: typeof Date;

  /** The default value for this property. */
  default?: T | (() => T);

  /** defines a custom getter for this property. */
  get?: (value: any) => T;

  /** defines a custom setter for this property. */
  set?: (value: any) => any;

  /**
   * Define a transform function for this individual schema type.
   * Only called when calling `toJSON()` or `toObject()`.
   */
  transform?: (val: T) => any;
}

type RelationshipsDefinition<DocType> = {
  // I believe I get into trouble here
  [path in keyof DocType]?: RelationshipDefinition<DocType[path]>;
}

type RelationshipDefinition<T> = {
  /** The default value for this property. */
  default?: T | (() => T);

  /** defines a custom getter for this property. */
  get?: (value: any) => T;

  /** defines a custom setter for this property. */
  set?: (value: any) => any;

  /**
   * Define a transform function for this individual schema type.
   * Only called when calling `toJSON()` or `toObject()`.
   */
  transform?: (val: T) => any;
}

type NameTransformer = "camelCase" | "snake_case" | "literal"

type SchemaOptions<DocType> = {
  serverTransform?: NameTransformer;
  clientTransform?: NameTransformer;
}

class Schema<DocType> {

  constructor(
    definition: SchemaDefinition<DocType>,
    options?: SchemaOptions<DocType>,
  ) {
    this.init(definition, options)
  }

  attributes!: AttributesDefinition<DocType>;

  relationships!: RelationshipsDefinition<DocType>;

  options?: SchemaOptions<DocType>;

  init!: (
    definition: SchemaDefinition<DocType>,
    options?: SchemaOptions<DocType>,
  ) => void;

  add!: (
    obj: SchemaDefinition<DocType>,
  ) => this;

  transformPropertyName!: (propertyName: string, sourceFormat: NameTransformer | undefined, targetFormat: NameTransformer | undefined) => string;
}

Schema.prototype.init = function (definition, options) {
  this.attributes = {};
  this.relationships = {};
  this.options = options || {};

  this.add(definition);
};

Schema.prototype.add = function (obj) {
  if (obj.attributes)
    Object.assign(this.attributes, obj.attributes)

  if (obj.relationships)
    Object.assign(this.relationships, obj.relationships)

  return this;
};

Schema.prototype.transformPropertyName = function (propertyName: string, sourceFormat: NameTransformer = "literal", targetFormat: NameTransformer = "literal") {
  if (sourceFormat==="snake_case" && targetFormat === "camelCase") {
    return propertyName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  } else if (sourceFormat === "camelCase" && targetFormat === "snake_case") {
    return propertyName.replace(/([A-Z])/g, "_$1").toLowerCase();
  } else if (targetFormat === "literal" || sourceFormat === targetFormat) {
    return propertyName;
  } else {
    console.warn(`Unsupported transformation from ${sourceFormat} to ${targetFormat}`);
  }
  return propertyName;
}


export default Schema
