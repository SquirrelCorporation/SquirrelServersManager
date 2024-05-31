var _excluded = ["translations"];

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

import React, { useEffect, useState } from 'react';
import { ControlKeyIcon } from './icons/ControlKeyIcon';
import { SearchIcon } from './icons/SearchIcon';
var ACTION_KEY_DEFAULT = 'Ctrl';
var ACTION_KEY_APPLE = '⌘';

function isAppleDevice() {
  return /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
}

export var DocSearchButton = React.forwardRef(function (_ref, ref) {
  var _ref$translations = _ref.translations,
      translations = _ref$translations === void 0 ? {} : _ref$translations,
      props = _objectWithoutProperties(_ref, _excluded);

  var _translations$buttonT = translations.buttonText,
      buttonText = _translations$buttonT === void 0 ? 'Search' : _translations$buttonT,
      _translations$buttonA = translations.buttonAriaLabel,
      buttonAriaLabel = _translations$buttonA === void 0 ? 'Search' : _translations$buttonA;

  var _useState = useState(null),
      _useState2 = _slicedToArray(_useState, 2),
      key = _useState2[0],
      setKey = _useState2[1];

  useEffect(function () {
    if (typeof navigator !== 'undefined') {
      isAppleDevice() ? setKey(ACTION_KEY_APPLE) : setKey(ACTION_KEY_DEFAULT);
    }
  }, []);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: "DocSearch DocSearch-Button",
    "aria-label": buttonAriaLabel
  }, props, {
    ref: ref
  }), /*#__PURE__*/React.createElement("span", {
    className: "DocSearch-Button-Container"
  }, /*#__PURE__*/React.createElement(SearchIcon, null), /*#__PURE__*/React.createElement("span", {
    className: "DocSearch-Button-Placeholder"
  }, buttonText)), /*#__PURE__*/React.createElement("span", {
    className: "DocSearch-Button-Keys"
  }, key !== null && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(DocSearchButtonKey, {
    reactsToKey: key === ACTION_KEY_DEFAULT ? ACTION_KEY_DEFAULT : 'Meta'
  }, key === ACTION_KEY_DEFAULT ? /*#__PURE__*/React.createElement(ControlKeyIcon, null) : key), /*#__PURE__*/React.createElement(DocSearchButtonKey, {
    reactsToKey: "k"
  }, "K"))));
});

function DocSearchButtonKey(_ref2) {
  var reactsToKey = _ref2.reactsToKey,
      children = _ref2.children;

  var _useState3 = useState(false),
      _useState4 = _slicedToArray(_useState3, 2),
      isKeyDown = _useState4[0],
      setIsKeyDown = _useState4[1];

  useEffect(function () {
    if (!reactsToKey) {
      return undefined;
    }

    function handleKeyDown(e) {
      if (e.key === reactsToKey) {
        setIsKeyDown(true);
      }
    }

    function handleKeyUp(e) {
      if (e.key === reactsToKey || // keyup doesn't fire when Command is held down,
      // workaround is to mark key as also released when Command is released
      // See https://stackoverflow.com/a/73419500
      e.key === 'Meta') {
        setIsKeyDown(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return function () {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [reactsToKey]);
  return /*#__PURE__*/React.createElement("kbd", {
    className: isKeyDown ? 'DocSearch-Button-Key DocSearch-Button-Key--pressed' : 'DocSearch-Button-Key'
  }, children);
}