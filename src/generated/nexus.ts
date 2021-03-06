/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */





declare global {
  interface NexusGenCustomOutputProperties<TypeName extends string> {
    crud: NexusPrisma<TypeName, 'crud'>
    model: NexusPrisma<TypeName, 'model'>
  }
}

declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
}

export interface NexusGenEnums {
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
}

export interface NexusGenObjects {
  Edge: { // root type
    cursor?: string | null; // String
    node?: NexusGenRootTypes['Tweet'] | null; // Tweet
  }
  PageInfo: { // root type
    endCursor?: string | null; // String
    hasNextPage?: boolean | null; // Boolean
  }
  Query: {};
  Response: { // root type
    edges?: Array<NexusGenRootTypes['Edge'] | null> | null; // [Edge]
    pageInfo?: NexusGenRootTypes['PageInfo'] | null; // PageInfo
  }
  Tweet: { // root type
    id?: number | null; // Int
    text: string; // String!
    userId: number; // Int!
  }
  User: { // root type
    email: string; // String!
    id?: number | null; // Int
    name: string; // String!
  }
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars

export interface NexusGenFieldTypes {
  Edge: { // field return type
    cursor: string | null; // String
    node: NexusGenRootTypes['Tweet'] | null; // Tweet
  }
  PageInfo: { // field return type
    endCursor: string | null; // String
    hasNextPage: boolean | null; // Boolean
  }
  Query: { // field return type
    tweets: NexusGenRootTypes['Response'] | null; // Response
  }
  Response: { // field return type
    edges: Array<NexusGenRootTypes['Edge'] | null> | null; // [Edge]
    pageInfo: NexusGenRootTypes['PageInfo'] | null; // PageInfo
  }
  Tweet: { // field return type
    id: number | null; // Int
    text: string; // String!
    user: NexusGenRootTypes['User']; // User!
    userId: number; // Int!
  }
  User: { // field return type
    email: string; // String!
    id: number | null; // Int
    name: string; // String!
  }
}

export interface NexusGenFieldTypeNames {
  Edge: { // field return type name
    cursor: 'String'
    node: 'Tweet'
  }
  PageInfo: { // field return type name
    endCursor: 'String'
    hasNextPage: 'Boolean'
  }
  Query: { // field return type name
    tweets: 'Response'
  }
  Response: { // field return type name
    edges: 'Edge'
    pageInfo: 'PageInfo'
  }
  Tweet: { // field return type name
    id: 'Int'
    text: 'String'
    user: 'User'
    userId: 'Int'
  }
  User: { // field return type name
    email: 'String'
    id: 'Int'
    name: 'String'
  }
}

export interface NexusGenArgTypes {
  Query: {
    tweets: { // args
      after?: number | null; // Int
      first?: number | null; // Int
    }
  }
}

export interface NexusGenAbstractTypeMembers {
}

export interface NexusGenTypeInterfaces {
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = never;

export type NexusGenEnumNames = never;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = never;

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: any;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}