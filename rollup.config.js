export default [{
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'esm',
    sourcemap: true
  },
  watch: {
    include: 'src/**'
  }
}, {
  input: 'test/index.js',
  output: {
    file: 'dist/test/index.js',
    format: 'cjs',
    sourcemap: true
  },
  watch: {
    include: [
      'src/**',
      'test/**'
    ]
  }
}, {
  input: 'test/iframe.js',
  output: {
    file: 'dist/test/iframe.js',
    format: 'cjs',
    sourcemap: true
  },
  watch: {
    include: [
      'src/**',
      'test/**'
    ]
  }
}];

