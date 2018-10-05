export default {
  input: 'test/main.js',
  output: {
    file: 'dist/test.js',
    format: 'cjs',
    sourcemap: true
  },
  watch: {
    include: [
      'src/**',
      'test/**'
    ]
  },
  external: ['jsdom', 'tape']
};
