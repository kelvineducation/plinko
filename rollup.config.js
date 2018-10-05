export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'esm',
    sourcemap: true
  },
  watch: {
    include: 'src/**'
  }
};
