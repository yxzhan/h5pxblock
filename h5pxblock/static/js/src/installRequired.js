try {
  (function (require) {
    require.config({
      paths: {
        h5p: "https://cdn.jsdelivr.net/npm/h5p-standalone@3.7.0/dist/main.bundle",
      },
    });
  }).call(this, require || RequireJS.require);
} catch (e) {
  console.log("Unable to load h5p-standalone via requirejs");
}
