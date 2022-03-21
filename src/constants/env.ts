enum NodeEnvironment {
  development = 'development',
  production = 'production',
  test = 'test',
}

const __dev__ = process.env.NODE_ENV === NodeEnvironment.development;
const __prod__ = process.env.NODE_ENV === NodeEnvironment.production;
const __test__ = process.env.NODE_ENV === NodeEnvironment.test;

export { NodeEnvironment, __dev__, __prod__, __test__ };
