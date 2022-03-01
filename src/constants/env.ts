const __dev__ = process.env.NODE_ENV === 'development';
const __prod__ = process.env.NODE_ENV === 'production';
const __test__ = process.env.NODE_ENV === 'test';

export { __dev__, __prod__, __test__ };
