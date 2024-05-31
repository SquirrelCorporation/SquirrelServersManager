const lang = Object.freeze({ "fileTypes": [], "injectTo": ["source.vue", "text.html.markdown", "text.html.derivative", "text.pug"], "injectionSelector": "L:text.pug -comment -string.comment, L:text.html.derivative -comment.block, L:text.html.markdown -comment.block", "name": "vue-interpolations", "patterns": [{ "include": "source.vue#vue-interpolations" }], "scopeName": "vue.interpolations" });
var vue_interpolations = [
  lang
];

export { vue_interpolations as default };
