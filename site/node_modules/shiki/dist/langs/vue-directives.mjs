const lang = Object.freeze({ "fileTypes": [], "injectTo": ["source.vue", "text.html.markdown", "text.html.derivative", "text.pug"], "injectionSelector": "L:meta.tag -meta.attribute -meta.ng-binding -entity.name.tag.pug -attribute_value -source.tsx -source.js.jsx, L:meta.element -meta.attribute", "name": "vue-directives", "patterns": [{ "include": "source.vue#vue-directives" }], "scopeName": "vue.directives" });
var vue_directives = [
  lang
];

export { vue_directives as default };
