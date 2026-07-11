/* @ds-bundle: {"format":3,"namespace":"AuxiDesignSystem_83ddc1","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Chip","sourcePath":"components/core/Chip.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"StatusPill","sourcePath":"components/core/StatusPill.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Avatar","sourcePath":"components/display/Avatar.jsx"},{"name":"ItemTile","sourcePath":"components/display/ItemTile.jsx"},{"name":"ListRow","sourcePath":"components/display/ListRow.jsx"},{"name":"ActionSheet","sourcePath":"components/feedback/ActionSheet.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Snackbar","sourcePath":"components/feedback/Snackbar.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"SegmentedControl","sourcePath":"components/forms/SegmentedControl.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"AppHeader","sourcePath":"components/navigation/AppHeader.jsx"},{"name":"SideMenu","sourcePath":"components/navigation/SideMenu.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"bc84f4f374d3","components/core/Button.jsx":"6c2b8ecded5f","components/core/Chip.jsx":"a4cf3fa83289","components/core/IconButton.jsx":"a7c8506f2851","components/core/StatusPill.jsx":"dc26f955bc59","components/core/Tag.jsx":"b2bae8c3d376","components/display/Avatar.jsx":"7b563b2962f0","components/display/ItemTile.jsx":"d505580287f0","components/display/ListRow.jsx":"c993625a0f98","components/feedback/ActionSheet.jsx":"d0f41fc223ff","components/feedback/Dialog.jsx":"8ae9732ed2ee","components/feedback/Snackbar.jsx":"23883d513647","components/feedback/Tooltip.jsx":"f4fba03b15fb","components/forms/Checkbox.jsx":"65592f28a575","components/forms/Input.jsx":"e2bcd6f96996","components/forms/Radio.jsx":"24974e4233d4","components/forms/SegmentedControl.jsx":"1c8d5b77fa42","components/forms/Switch.jsx":"677c119874f7","components/navigation/AppHeader.jsx":"ac63700dcf9a","components/navigation/SideMenu.jsx":"982a92f3ed80","ui_kits/mobile-app/Screens.jsx":"86b34f678d86"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.AuxiDesignSystem_83ddc1 = window.AuxiDesignSystem_83ddc1 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Small label pill. Tones: solid (ink/cream), soft (cream/ink),
 * tan (warm accent), outline (white + hairline). Roboto 12, full radius.
 */
function Badge({
  children,
  tone = 'solid',
  style,
  ...rest
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 13px',
    borderRadius: 'var(--radius-full, 100px)',
    fontFamily: "'Roboto', system-ui, sans-serif",
    fontSize: 12,
    lineHeight: '16px',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box'
  };
  const tones = {
    solid: {
      background: 'var(--auxi-ink, #1d1f23)',
      color: 'var(--auxi-cream, #f2efec)'
    },
    soft: {
      background: 'var(--auxi-cream, #f2efec)',
      color: 'var(--auxi-ink, #1d1f23)'
    },
    tan: {
      background: 'var(--auxi-tan, #e0d2c4)',
      color: 'var(--auxi-warm-700, #5b5550)'
    },
    outline: {
      background: 'var(--auxi-white, #fff)',
      color: 'var(--auxi-ink, #1d1f23)',
      border: '1px solid var(--auxi-line, rgba(29,31,35,0.10))'
    }
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      ...base,
      ...tones[tone],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Auxi primary action button. Ink fill, cream label, 56px tall, 16px radius.
 * Variants: primary (ink), secondary (outlined), text (low-emphasis), danger.
 */
const FONTS = {
  label: "'Roboto', system-ui, sans-serif",
  text: "'Inter', system-ui, sans-serif"
};
function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  leadingIcon = null,
  trailingIcon = null,
  onClick,
  style,
  ...rest
}) {
  const [pressed, setPressed] = React.useState(false);
  const heights = {
    md: 56,
    sm: 44
  };
  const height = heights[size] || 56;
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height,
    padding: variant === 'text' ? '0 16px' : '0 22px',
    border: 'none',
    borderRadius: variant === 'text' ? 'var(--radius-md, 16px)' : 'var(--radius-md, 16px)',
    fontFamily: variant === 'text' ? FONTS.text : FONTS.label,
    fontSize: variant === 'text' ? 14 : 16,
    lineHeight: variant === 'text' ? '20px' : '24px',
    letterSpacing: variant === 'text' ? 0 : 0.15,
    fontWeight: variant === 'text' ? 500 : 400,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    minWidth: variant === 'primary' ? 200 : variant === 'secondary' ? 160 : 0,
    boxSizing: 'border-box',
    transition: 'background-color .16s ease, color .16s ease',
    WebkitTapHighlightColor: 'transparent'
  };
  const variants = {
    primary: {
      background: pressed ? 'var(--auxi-black, #070707)' : 'var(--auxi-ink, #1d1f23)',
      color: 'var(--auxi-cream, #f2efec)'
    },
    secondary: {
      background: pressed ? 'var(--auxi-cream, #f2efec)' : 'var(--auxi-white, #fff)',
      color: 'var(--auxi-ink, #1d1f23)',
      border: '1.5px solid var(--auxi-ink, #1d1f23)'
    },
    text: {
      background: pressed ? 'var(--auxi-cream, #f2efec)' : 'transparent',
      color: 'var(--auxi-ink, #1d1f23)',
      minWidth: 0
    },
    danger: {
      background: pressed ? '#9c1f15' : 'var(--auxi-danger, #bb251a)',
      color: 'var(--auxi-white, #fff)'
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    onClick: onClick,
    onPointerDown: () => setPressed(true),
    onPointerUp: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
    style: {
      ...base,
      ...variants[variant],
      ...style
    }
  }, rest), leadingIcon, /*#__PURE__*/React.createElement("span", null, children), trailingIcon);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Selectable filter chip (wardrobe category filters). On = ink fill + cream
 * text; off = white + hairline. Inter 14, full radius.
 */
function Chip({
  children,
  selected = false,
  onClick,
  leadingIcon = null,
  style,
  ...rest
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 15px',
    borderRadius: 'var(--radius-full, 100px)',
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    transition: 'background-color .16s ease, color .16s ease',
    WebkitTapHighlightColor: 'transparent',
    border: selected ? '1px solid transparent' : '1px solid var(--auxi-line, rgba(29,31,35,0.10))',
    background: selected ? 'var(--auxi-ink, #1d1f23)' : 'var(--auxi-white, #fff)',
    color: selected ? 'var(--auxi-cream, #f2efec)' : 'var(--auxi-ink, #1d1f23)'
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-pressed": selected,
    onClick: onClick,
    style: {
      ...base,
      ...style
    }
  }, rest), leadingIcon, children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Chip.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Square icon button, 48×48, 16px radius. Pass an SVG/img as children.
 * Variants: ghost (transparent, pressed→cream), floating (white pill + soft
 * shadow — used for the Home header menu/favourite buttons), dark (on ink).
 */
function IconButton({
  children,
  variant = 'ghost',
  size = 48,
  disabled = false,
  ariaLabel,
  onClick,
  style,
  ...rest
}) {
  const [pressed, setPressed] = React.useState(false);
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
    border: 'none',
    borderRadius: 'var(--radius-md, 16px)',
    background: 'transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    padding: 0,
    boxSizing: 'border-box',
    transition: 'background-color .16s ease',
    WebkitTapHighlightColor: 'transparent'
  };
  const variants = {
    ghost: {
      background: pressed ? 'var(--auxi-cream, #f2efec)' : 'transparent'
    },
    floating: {
      background: 'var(--auxi-white, #fff)',
      borderRadius: 'var(--radius-full, 100px)',
      boxShadow: 'var(--shadow-floating, 0 4px 12px rgba(29,31,35,0.12))'
    },
    dark: {
      background: pressed ? 'rgba(242,239,236,0.12)' : 'transparent'
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": ariaLabel,
    disabled: disabled,
    onClick: onClick,
    onPointerDown: () => setPressed(true),
    onPointerUp: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
    style: {
      ...base,
      ...variants[variant],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/StatusPill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Status pill with a leading dot. Tones: ok (teal/cream),
 * warn (warm700/tan), err (danger/warm100). Inter 12 medium, full radius.
 */
function StatusPill({
  children,
  tone = 'ok',
  style,
  ...rest
}) {
  const map = {
    ok: {
      color: 'var(--auxi-teal, #16a085)',
      bg: 'var(--auxi-cream, #f2efec)'
    },
    warn: {
      color: 'var(--auxi-warm-700, #5b5550)',
      bg: 'var(--auxi-tan, #e0d2c4)'
    },
    err: {
      color: 'var(--auxi-danger, #bb251a)',
      bg: 'var(--auxi-warm-100, #eee6df)'
    }
  };
  const t = map[tone] || map.ok;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 11px',
      borderRadius: 'var(--radius-full, 100px)',
      background: t.bg,
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 12,
      lineHeight: '16px',
      fontWeight: 500,
      color: t.color,
      boxSizing: 'border-box',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 3,
      background: t.color
    }
  }), children);
}
Object.assign(__ds_scope, { StatusPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatusPill.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Image-overlay tag — the small uppercase mono label that sits on outfit/item
 * tiles ("OXFORD", "DENIM"). White pill (or dark glass on photos), mono caps.
 */
function Tag({
  children,
  glass = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 8px',
      borderRadius: 20,
      background: glass ? 'rgba(18,18,18,0.75)' : 'var(--auxi-white, #fff)',
      color: glass ? 'var(--auxi-white, #fff)' : 'var(--auxi-warm-700, #5b5550)',
      fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
      fontSize: 9.5,
      lineHeight: '12px',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      boxSizing: 'border-box',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/display/Avatar.jsx
try { (() => {
/**
 * Avatar — circular monogram or image. Warm tan fill with ink initials by
 * default; pass `image` for a photo.
 */
function Avatar({
  name = '',
  image,
  size = 44,
  style
}) {
  const initials = name.split(' ').map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      borderRadius: '50%',
      overflow: 'hidden',
      background: image ? `#eee url("${image}") center/cover no-repeat` : 'var(--auxi-tan, #e0d2c4)',
      color: 'var(--auxi-warm-700, #5b5550)',
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600,
      fontSize: size * 0.38,
      flex: 'none',
      ...style
    }
  }, !image && initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/display/ItemTile.jsx
try { (() => {
/**
 * Outfit / wardrobe item tile. Photo area (warm placeholder) with an optional
 * pin badge and overlay tag, then a caption + sub-label. 14px radius card.
 */
function ItemTile({
  image,
  caption,
  sub,
  tag,
  pinned = false,
  width = 160,
  onClick,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      width,
      background: 'var(--auxi-white, #fff)',
      borderRadius: 14,
      border: '1px solid var(--auxi-line, rgba(29,31,35,0.10))',
      overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default',
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      aspectRatio: '3 / 4',
      background: image ? `var(--auxi-cream, #f2efec) url("${image}") center/cover no-repeat` : 'var(--auxi-tan, #e0d2c4)'
    }
  }, pinned && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 30,
      height: 30,
      borderRadius: 15,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(2px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M9 4h6l-1 6 3 3v2h-5v5l-1 1-1-1v-5H4v-2l3-3-1-6h3z",
    fill: "#1d1f23"
  }))), tag && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      bottom: 8,
      left: 8,
      padding: '3px 8px',
      borderRadius: 20,
      background: 'var(--auxi-white, #fff)',
      fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
      fontSize: 9.5,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: 'var(--auxi-warm-700, #5b5550)'
    }
  }, tag)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '9px 11px 11px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '20px',
      color: 'var(--auxi-ink, #1d1f23)'
    }
  }, caption), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 10,
      lineHeight: '12px',
      color: 'var(--auxi-warm-500, #9e968e)',
      marginTop: 2
    }
  }, sub)));
}
Object.assign(__ds_scope, { ItemTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/ItemTile.jsx", error: String((e && e.message) || e) }); }

// components/display/ListRow.jsx
try { (() => {
/**
 * Settings / list row. Label on the left; optional value, then a trailing
 * chevron or trash glyph. `danger` and `muted` recolor the label.
 */
function ListRow({
  label,
  value,
  trailing = 'chevron',
  danger = false,
  muted = false,
  last = false,
  onClick,
  style
}) {
  const color = danger ? 'var(--auxi-danger, #bb251a)' : muted ? 'var(--auxi-warm-500, #9e968e)' : 'var(--auxi-ink, #1d1f23)';
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '15px 18px',
      borderBottom: last ? 'none' : '1px solid var(--auxi-hairline, #eee6df)',
      cursor: onClick ? 'pointer' : 'default',
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 16,
      lineHeight: '24px',
      color
    }
  }, label), value && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 14,
      color: 'var(--auxi-warm-500, #9e968e)'
    }
  }, value), danger ? /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 7h14M10 7V5h4v2M6 7l1 13h10l1-13",
    stroke: "var(--auxi-danger, #bb251a)",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })) : trailing === 'chevron' ? /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M9 6l6 6-6 6",
    stroke: "var(--auxi-warm-500, #9e968e)",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })) : null);
}
Object.assign(__ds_scope, { ListRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/ListRow.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ActionSheet.jsx
try { (() => {
/**
 * Bottom action sheet. Surface, rounded top (18px), grab handle, then a list
 * of options (icon + label) and an optional cancel row. Casts an upward shadow.
 * options: [{ icon?, label, danger?, onPress? }]
 */
function ActionSheet({
  options = [],
  cancelLabel = 'Cancel',
  onCancel,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 320,
      background: 'var(--auxi-surface, #fcfcfd)',
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      paddingTop: 10,
      paddingBottom: 12,
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sheet, 0 -8px 40px rgba(29,38,70,0.25))',
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 4,
      borderRadius: 4,
      background: 'var(--auxi-placeholder, #d9d9d9)',
      margin: '8px auto'
    }
  }), options.map((o, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    onClick: o.onPress,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '15px 22px',
      cursor: 'pointer',
      borderTop: '1px solid var(--auxi-hairline, #eee6df)',
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 16,
      lineHeight: '24px',
      color: o.danger ? 'var(--auxi-danger, #bb251a)' : 'var(--auxi-ink, #1d1f23)'
    }
  }, o.icon, /*#__PURE__*/React.createElement("span", null, o.label))), /*#__PURE__*/React.createElement("div", {
    onClick: onCancel,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '15px 22px',
      cursor: 'pointer',
      borderTop: '1px solid var(--auxi-hairline, #eee6df)',
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 16,
      color: 'var(--auxi-warm-500, #9e968e)'
    }
  }, cancelLabel));
}
Object.assign(__ds_scope, { ActionSheet });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ActionSheet.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
/**
 * Centered confirmation dialog. Surface card, 16px radius, upward soft shadow.
 * Title (Poppins), body (Inter), and a two-action row. `tone="danger"` makes
 * the confirm button destructive.
 */
function Dialog({
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  onConfirm,
  onCancel,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 300,
      background: 'var(--auxi-surface, #fcfcfd)',
      borderRadius: 16,
      padding: 24,
      boxShadow: 'var(--shadow-dialog, 0 -4px 40px rgba(0,0,0,0.15))',
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 500,
      fontSize: 16,
      lineHeight: '24px',
      color: 'var(--auxi-ink, #1d1f23)',
      marginBottom: 8
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 14,
      lineHeight: '20px',
      color: 'var(--auxi-on-variant, #49454f)',
      marginBottom: 24
    }
  }, children), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onCancel,
    style: {
      flex: 1,
      height: 48,
      borderRadius: 17,
      cursor: 'pointer',
      border: '1.5px solid var(--auxi-ink, #1d1f23)',
      background: 'transparent',
      fontFamily: "'Roboto', sans-serif",
      fontSize: 15,
      color: 'var(--auxi-ink, #1d1f23)'
    }
  }, cancelLabel), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onConfirm,
    style: {
      flex: 1,
      height: 48,
      borderRadius: 16,
      cursor: 'pointer',
      border: 'none',
      background: tone === 'danger' ? 'var(--auxi-danger, #bb251a)' : 'var(--auxi-ink, #1d1f23)',
      fontFamily: "'Roboto', sans-serif",
      fontSize: 15,
      color: '#fff'
    }
  }, confirmLabel)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Snackbar.jsx
try { (() => {
/**
 * M3 snackbar. tone="success" = mint surface; tone="info" = ink surface with
 * white label and an optional close affordance. Action label is optional.
 */
function Snackbar({
  children,
  tone = 'info',
  actionLabel,
  onAction,
  onClose,
  leadingIcon,
  style
}) {
  const isInfo = tone === 'info';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      minHeight: 48,
      padding: '12px 16px',
      borderRadius: 12,
      background: isInfo ? 'var(--auxi-ink, #1d1f23)' : '#4cf4d3',
      boxShadow: 'var(--shadow-card, 0 8px 16px rgba(29,31,35,0.12))',
      boxSizing: 'border-box',
      ...style
    }
  }, leadingIcon, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 14,
      lineHeight: '20px',
      color: isInfo ? '#fff' : 'var(--auxi-ink, #1d1f23)'
    }
  }, children), actionLabel && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onAction,
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      fontFamily: "'Inter', sans-serif",
      fontSize: 14,
      fontWeight: 600,
      color: isInfo ? '#7fd3ff' : 'var(--auxi-ink, #1d1f23)'
    }
  }, actionLabel), onClose && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Dismiss",
    onClick: onClose,
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      color: isInfo ? '#fff' : 'var(--auxi-ink, #1d1f23)',
      display: 'inline-flex',
      padding: 2
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 6l12 12M18 6L6 18",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }))));
}
Object.assign(__ds_scope, { Snackbar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Snackbar.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
/**
 * Plain tooltip — dark inverse-surface bubble with a small pointer. Used for
 * coachmarks / hints. `placement` controls the arrow side.
 */
function Tooltip({
  children,
  placement = 'top',
  style
}) {
  const arrow = {
    position: 'absolute',
    width: 8,
    height: 8,
    background: '#322f35',
    transform: 'rotate(45deg)'
  };
  const arrowPos = {
    top: {
      left: '50%',
      bottom: -4,
      marginLeft: -4
    },
    bottom: {
      left: '50%',
      top: -4,
      marginLeft: -4
    },
    left: {
      top: '50%',
      right: -4,
      marginTop: -4
    },
    right: {
      top: '50%',
      left: -4,
      marginTop: -4
    }
  }[placement];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-block',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      padding: '8px 12px',
      borderRadius: 8,
      background: '#322f35',
      color: '#f5eff7',
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 12,
      lineHeight: '16px',
      whiteSpace: 'nowrap'
    }
  }, children), /*#__PURE__*/React.createElement("span", {
    style: {
      ...arrow,
      ...arrowPos
    }
  }));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
/**
 * Checkbox, 18×18, 2px radius. Unchecked = 2px ink outline; checked = ink
 * fill with a white check. Renders an optional label to the right.
 */
function Checkbox({
  checked = false,
  label,
  disabled = false,
  onChange,
  id,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 9,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    role: "checkbox",
    "aria-checked": checked,
    onClick: () => !disabled && onChange && onChange(!checked),
    style: {
      position: 'relative',
      width: 18,
      height: 18,
      borderRadius: 2,
      boxSizing: 'border-box',
      border: '2px solid var(--auxi-ink, #1d1f23)',
      background: checked ? 'var(--auxi-ink, #1d1f23)' : 'transparent',
      flex: 'none',
      transition: 'background-color .14s ease'
    }
  }, checked && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 4,
      top: 3,
      width: 6,
      height: 9,
      borderRight: '2px solid #fff',
      borderBottom: '2px solid #fff',
      transform: 'rotate(45deg)'
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 14,
      lineHeight: '20px',
      color: 'var(--auxi-ink, #1d1f23)'
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Text input field with an overline label. 52px tall, 12px radius, 1.5px
 * hairline that goes ink on focus. Placeholder text is warm-gray.
 */
function Input({
  label,
  value,
  defaultValue,
  placeholder,
  type = 'text',
  disabled = false,
  leadingIcon = null,
  onChange,
  style,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      width: '100%',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
      fontSize: 12,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: 'var(--auxi-warm-500, #9e968e)',
      marginBottom: 7
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      height: 52,
      padding: '0 16px',
      borderRadius: 12,
      background: 'var(--auxi-white, #fff)',
      border: `1.5px solid ${focused ? 'var(--auxi-ink, #1d1f23)' : 'var(--auxi-line, rgba(29,31,35,0.10))'}`,
      opacity: disabled ? 0.5 : 1,
      transition: 'border-color .16s ease',
      boxSizing: 'border-box'
    }
  }, leadingIcon, /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 16,
      lineHeight: '24px',
      color: 'var(--auxi-ink, #1d1f23)',
      minWidth: 0
    }
  }, rest))));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
/**
 * Radio control, 20px ring. Off = warm-gray ring; on = near-black ring with
 * a 10px black dot. Used for single-select groups (AM/PM, style options).
 */
function Radio({
  checked = false,
  label,
  disabled = false,
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 9,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    role: "radio",
    "aria-checked": checked,
    onClick: () => !disabled && onChange && onChange(true),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 20,
      height: 20,
      borderRadius: 10,
      boxSizing: 'border-box',
      border: `2px solid ${checked ? 'var(--auxi-black, #070707)' : 'var(--auxi-warm-500, #9e968e)'}`,
      flex: 'none',
      transition: 'border-color .14s ease'
    }
  }, checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 5,
      background: 'var(--auxi-black, #070707)'
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 14,
      lineHeight: '20px',
      color: checked ? 'var(--auxi-ink, #1d1f23)' : 'var(--auxi-warm-500, #9e968e)'
    }
  }, label));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/SegmentedControl.jsx
try { (() => {
/**
 * Segmented control — cream pill track, active option is a white pill with a
 * soft card shadow. Used for view toggles (Grid view / Collage view).
 */
function SegmentedControl({
  options = [],
  value,
  onChange,
  style
}) {
  const active = value ?? options[0];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      gap: 2,
      padding: 4,
      borderRadius: 100,
      background: 'var(--auxi-cream, #f2efec)',
      boxSizing: 'border-box',
      ...style
    }
  }, options.map(o => {
    const on = o === active;
    return /*#__PURE__*/React.createElement("button", {
      key: o,
      type: "button",
      role: "tab",
      "aria-selected": on,
      onClick: () => onChange && onChange(o),
      style: {
        border: 'none',
        cursor: 'pointer',
        padding: '8px 18px',
        borderRadius: 100,
        background: on ? 'var(--auxi-white, #fff)' : 'transparent',
        boxShadow: on ? 'var(--shadow-card, 0 8px 16px rgba(29,31,35,0.12))' : 'none',
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 14,
        lineHeight: '20px',
        fontWeight: 500,
        color: on ? 'var(--auxi-ink, #1d1f23)' : 'var(--auxi-on-variant, #49454f)',
        transition: 'background-color .16s ease, color .16s ease',
        WebkitTapHighlightColor: 'transparent'
      }
    }, o);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
/**
 * iOS-style toggle switch. ON track = teal (#16a085), OFF track = neutral
 * #e4e7ec, white knob. Default daily-reminder / preference toggle.
 */
function Switch({
  checked = false,
  disabled = false,
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    role: "switch",
    "aria-checked": checked,
    onClick: () => !disabled && onChange && onChange(!checked),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      width: 51,
      height: 31,
      borderRadius: 100,
      padding: 2,
      boxSizing: 'border-box',
      background: checked ? 'var(--auxi-teal, #16a085)' : '#e4e7ec',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'background-color .2s ease',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 27,
      height: 27,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
      transform: checked ? 'translateX(20px)' : 'translateX(0)',
      transition: 'transform .2s cubic-bezier(.4,.2,.2,1)'
    }
  }));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/AppHeader.jsx
try { (() => {
/**
 * Home screen header — floating menu button (left), centered weather/date
 * (sun glyph + temp + day), and a floating favourite button (right).
 */
function AppHeader({
  temp = '24°c',
  day = 'Monday',
  onMenu,
  onFavourite,
  style
}) {
  const FloatBtn = ({
    children,
    onClick,
    label
  }) => /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": label,
    onClick: onClick,
    style: {
      width: 44,
      height: 44,
      borderRadius: 22,
      border: 'none',
      cursor: 'pointer',
      background: 'var(--auxi-white, #fff)',
      boxShadow: 'var(--shadow-floating, 0 4px 12px rgba(29,31,35,0.12))',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, children);
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement(FloatBtn, {
    label: "Menu",
    onClick: onMenu
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 7h16M4 12h16M4 17h16",
    stroke: "#1d1f23",
    strokeWidth: "1.8",
    strokeLinecap: "round"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4.2",
    fill: "#f0a500"
  }), /*#__PURE__*/React.createElement("g", {
    stroke: "#f0a500",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      lineHeight: 1.1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Inter', sans-serif",
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--auxi-ink, #1d1f23)'
    }
  }, temp), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Inter', sans-serif",
      fontSize: 12,
      color: 'var(--auxi-warm-500, #9e968e)'
    }
  }, day))), /*#__PURE__*/React.createElement(FloatBtn, {
    label: "Favourites",
    onClick: onFavourite
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 21s-7.5-4.6-10-9.2C.3 8.4 1.7 4.5 5.2 4.5c2 0 3.3 1.2 3.8 2.2.5-1 1.8-2.2 3.8-2.2 3.5 0 4.9 3.9 3.2 7.3C19.5 16.4 12 21 12 21z",
    stroke: "#1d1f23",
    strokeWidth: "1.6",
    strokeLinejoin: "round"
  }))));
}
Object.assign(__ds_scope, { AppHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/AppHeader.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SideMenu.jsx
try { (() => {
const ICONS = {
  outfits: 'M4 5h7v7H4zM13 5h7v4h-7zM13 11h7v8h-7zM4 14h7v5H4z',
  wardrobe: 'M6 3h12v18H6zM12 3v18M9 8v3M15 8v3',
  favourite: 'M12 21s-7-4.3-9.3-8.5C1.2 9.6 2.5 6 5.8 6c1.9 0 3.1 1.1 3.6 2 .5-.9 1.7-2 3.6-2 3.3 0 4.6 3.6 3.1 6.5C19 16.7 12 21 12 21z',
  feedback: 'M4 5h16v11H8l-4 4z',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6',
  logout: 'M15 4H6v16h9M10 12h11M18 9l3 3-3 3'
};
function Glyph({
  name,
  color
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: ICONS[name] || ICONS.profile,
    stroke: color,
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }));
}

/**
 * Dark slide-out navigation menu (the Home hamburger drawer). Ink panel,
 * "See my outfits" header, then icon+label rows; the active row sits on a
 * warm-100 pill.
 * items: [{ icon, label }]; activeIndex selects the highlighted row.
 */
function SideMenu({
  items = [{
    icon: 'wardrobe',
    label: 'Wardrobe'
  }, {
    icon: 'favourite',
    label: 'My Favourite'
  }, {
    icon: 'feedback',
    label: 'Feedback'
  }, {
    icon: 'profile',
    label: 'Profile'
  }, {
    icon: 'logout',
    label: 'Log out'
  }],
  activeIndex = 3,
  onSelect,
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      width: 236,
      background: 'var(--auxi-ink, #1d1f23)',
      borderRadius: 18,
      padding: '22px 16px 16px',
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0 8px 22px'
    }
  }, /*#__PURE__*/React.createElement(Glyph, {
    name: "outfits",
    color: "var(--auxi-cream, #f2efec)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--auxi-cream, #f2efec)'
    }
  }, "See my outfits")), items.map((it, i) => {
    const active = i === activeIndex;
    return /*#__PURE__*/React.createElement("div", {
      key: it.label,
      onClick: () => onSelect && onSelect(i),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 12px',
        borderRadius: 11,
        cursor: 'pointer',
        background: active ? 'var(--auxi-warm-100, #eee6df)' : 'transparent'
      }
    }, /*#__PURE__*/React.createElement(Glyph, {
      name: it.icon,
      color: active ? 'var(--auxi-ink, #1d1f23)' : 'var(--auxi-cream, #f2efec)'
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 14,
        color: active ? 'var(--auxi-ink, #1d1f23)' : 'var(--auxi-cream, #f2efec)'
      }
    }, it.label));
  }));
}
Object.assign(__ds_scope, { SideMenu });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SideMenu.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile-app/Screens.jsx
try { (() => {
/* Auxi mobile app — UI kit screens. Faithful click-through recreation built
   on the design-system tokens + bundle. Exposes window.AuxiKit. */
const DS = window.AuxiDesignSystem_83ddc1;
const {
  Button,
  Chip,
  ItemTile,
  ListRow,
  Switch,
  SegmentedControl,
  Badge,
  IconButton,
  SideMenu,
  AppHeader,
  Dialog,
  Snackbar,
  Tag
} = DS;
const G = n => `../../assets/garments/${n}`;
const ICON = n => `../../assets/icons/${n}`;

/* ---------- shared chrome ---------- */
function StatusBar() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 24px 4px',
      fontFamily: "'Inter',sans-serif",
      fontSize: 14,
      fontWeight: 600,
      color: '#1d1f23'
    }
  }, /*#__PURE__*/React.createElement("span", null, "9:41"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "12",
    viewBox: "0 0 18 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "3",
    width: "3",
    height: "6",
    rx: "1",
    fill: "#1d1f23"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.5",
    y: "1.5",
    width: "3",
    height: "9",
    rx: "1",
    fill: "#1d1f23"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9",
    y: "0",
    width: "3",
    height: "12",
    rx: "1",
    fill: "#1d1f23"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "13.5",
    y: "0",
    width: "3",
    height: "12",
    rx: "1",
    fill: "#1d1f23",
    opacity: "0.3"
  })), /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "12",
    viewBox: "0 0 24 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "1",
    y: "1",
    width: "20",
    height: "10",
    rx: "3",
    stroke: "#1d1f23",
    strokeWidth: "1",
    opacity: "0.5"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2.5",
    y: "2.5",
    width: "15",
    height: "7",
    rx: "1.5",
    fill: "#1d1f23"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "22",
    y: "4",
    width: "1.5",
    height: "4",
    rx: "0.75",
    fill: "#1d1f23",
    opacity: "0.5"
  }))));
}
function HomeIndicator() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      padding: '8px 0 10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 134,
      height: 5,
      borderRadius: 3,
      background: '#1d1f23'
    }
  }));
}

/* ---------- Welcome ---------- */
function Welcome({
  go
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#fcfcfd'
    }
  }, /*#__PURE__*/React.createElement(StatusBar, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      padding: '4px 24px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Inter',sans-serif",
      fontSize: 14,
      color: '#1d1f23'
    }
  }, "English \u25BE")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 28px'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/brand/macgie.svg",
    height: "92",
    alt: "Macgie"
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "'Fraunces',serif",
      fontWeight: 500,
      fontSize: 38,
      lineHeight: 1.15,
      color: '#14110f',
      textAlign: 'center',
      margin: '26px 0 0'
    }
  }, "Welcome to Macgie"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "'Inter',sans-serif",
      fontSize: 14,
      color: '#49454f',
      textAlign: 'center',
      marginTop: 14
    }
  }, "Get dressed with more clarity, less pressure.")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 24px 8px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    onClick: () => go('home'),
    trailingIcon: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24"
    }, /*#__PURE__*/React.createElement("path", {
      fill: "#4285F4",
      d: "M21 12.2c0-.6 0-1.2-.1-1.8H12v3.5h5.1a4.4 4.4 0 0 1-1.9 2.9v2.4h3a9 9 0 0 0 2.8-7z"
    }), /*#__PURE__*/React.createElement("path", {
      fill: "#34A853",
      d: "M12 21c2.4 0 4.5-.8 6-2.2l-3-2.4c-.8.6-1.9.9-3 .9-2.3 0-4.3-1.6-5-3.7H4v2.4A9 9 0 0 0 12 21z"
    }), /*#__PURE__*/React.createElement("path", {
      fill: "#FBBC05",
      d: "M7 13.6a5.4 5.4 0 0 1 0-3.4V7.8H4a9 9 0 0 0 0 8.2l3-2.4z"
    }), /*#__PURE__*/React.createElement("path", {
      fill: "#EA4335",
      d: "M12 6.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 4 7.8l3 2.4c.7-2.1 2.7-3.6 5-3.6z"
    }))
  }, "Continue with Google"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: 'var(--auxi-line)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Inter',sans-serif",
      fontSize: 13,
      color: '#9e968e'
    }
  }, "or"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: 'var(--auxi-line)'
    }
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    onClick: () => go('home'),
    trailingIcon: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "5",
      width: "18",
      height: "14",
      rx: "2",
      stroke: "#1d1f23",
      strokeWidth: "1.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M4 7l8 6 8-6",
      stroke: "#1d1f23",
      strokeWidth: "1.5"
    }))
  }, "Continue with Email"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "'Inter',sans-serif",
      fontSize: 12,
      color: '#49454f',
      textAlign: 'center',
      lineHeight: 1.5
    }
  }, "By continuing, you agree to our ", /*#__PURE__*/React.createElement("u", null, "Terms of Service"), " and ", /*#__PURE__*/React.createElement("u", null, "Privacy Policy"), ".")), /*#__PURE__*/React.createElement(HomeIndicator, null));
}

/* ---------- Home (recommendation) ---------- */
function Home({
  go,
  openMenu,
  toast,
  setToast
}) {
  const [view, setView] = React.useState('Collage view');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement(StatusBar, null), /*#__PURE__*/React.createElement(AppHeader, {
    temp: "24\xB0c",
    day: "Monday",
    onMenu: openMenu,
    onFavourite: () => go('wardrobe')
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 16px 0',
      display: 'flex',
      gap: 8,
      alignItems: 'stretch'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: 'var(--auxi-warm-100)',
      borderRadius: 12,
      padding: '12px 14px',
      fontFamily: "'Inter',sans-serif",
      fontSize: 14,
      lineHeight: 1.35,
      color: '#1d1f23'
    }
  }, "Clean weekday: crisp oxford with tailored trousers."), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 46,
      background: 'var(--auxi-tan)',
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10.5c-.7.7-1 1.2-1 2H9c0-.8-.3-1.3-1-2A6 6 0 0 1 12 3z",
    stroke: "#5b5550",
    strokeWidth: "1.5",
    strokeLinejoin: "round"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: 'relative',
      margin: '14px 16px',
      borderRadius: 16,
      background: 'var(--auxi-cream)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: G('cami-white.png'),
    style: {
      position: 'absolute',
      width: '46%',
      top: '6%',
      left: '8%',
      filter: 'drop-shadow(0 6px 14px rgba(0,0,0,.08))'
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: G('jacket-tweed.png'),
    style: {
      position: 'absolute',
      width: '48%',
      top: '2%',
      right: '5%',
      filter: 'drop-shadow(0 6px 14px rgba(0,0,0,.08))'
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: G('trousers-black.png'),
    style: {
      position: 'absolute',
      width: '42%',
      bottom: '2%',
      left: '14%',
      filter: 'drop-shadow(0 6px 14px rgba(0,0,0,.08))'
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: G('loafers-black.png'),
    style: {
      position: 'absolute',
      width: '34%',
      bottom: '4%',
      right: '8%',
      filter: 'drop-shadow(0 6px 14px rgba(0,0,0,.08))'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 12,
      left: 12
    }
  }, /*#__PURE__*/React.createElement(Tag, null, "Oxford"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '0 18px',
      fontFamily: "'Inter',sans-serif",
      fontSize: 13,
      color: '#1d1f23'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500
    }
  }, "Remix"), /*#__PURE__*/React.createElement("img", {
    src: ICON('remix.svg'),
    width: "16",
    height: "16"
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: 'center',
      fontFamily: "'Inter',sans-serif",
      fontSize: 12,
      color: '#9e968e',
      margin: '8px 0 6px'
    }
  }, "AI-generated \u2014 may be inaccurate \xB7 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--auxi-ai)'
    }
  }, "Report")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    onClick: () => setToast(true),
    trailingIcon: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M12 21s-7.5-4.6-10-9.2C.3 8.4 1.7 4.5 5.2 4.5c2 0 3.3 1.2 3.8 2.2.5-1 1.8-2.2 3.8-2.2 3.5 0 4.9 3.9 3.2 7.3C19.5 16.4 12 21 12 21z",
      stroke: "#1d1f23",
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }))
  }, "Wear this")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      padding: '12px 0 6px'
    }
  }, /*#__PURE__*/React.createElement(SegmentedControl, {
    options: ['Grid view', 'Collage view'],
    value: view,
    onChange: setView
  })), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 78,
      zIndex: 1200
    }
  }, /*#__PURE__*/React.createElement(Snackbar, {
    tone: "success",
    style: {
      width: '100%'
    },
    onClose: () => setToast(false)
  }, "Saved to your favourites")), /*#__PURE__*/React.createElement(HomeIndicator, null));
}

/* ---------- Wardrobe ---------- */
const WARDROBE = [{
  img: 'cami-white.png',
  cap: 'White cami',
  tag: 'Top'
}, {
  img: 'tee-grey.png',
  cap: 'Grey tee',
  tag: 'Top'
}, {
  img: 'cardigan-beige.png',
  cap: 'Beige cardigan',
  tag: 'Top'
}, {
  img: 'jeans-blue.png',
  cap: 'Straight jeans',
  tag: 'Denim'
}, {
  img: 'trousers-black.png',
  cap: 'Wide trousers',
  tag: 'Bottom'
}, {
  img: 'jacket-tweed.png',
  cap: 'Tweed jacket',
  tag: 'Outer'
}, {
  img: 'hoodie-black.png',
  cap: 'Black hoodie',
  tag: 'Top'
}, {
  img: 'dress-floral.png',
  cap: 'Floral dress',
  tag: 'Dress'
}, {
  img: 'sneakers-white.png',
  cap: 'White sneakers',
  tag: 'Shoes'
}];
function Wardrobe({
  go,
  openMenu
}) {
  const [cat, setCat] = React.useState('All');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement(StatusBar, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '8px 20px 6px'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    ariaLabel: "Menu",
    onClick: openMenu
  }, /*#__PURE__*/React.createElement("img", {
    src: ICON('menu.svg'),
    width: "22",
    height: "22"
  })), /*#__PURE__*/React.createElement("h2", {
    className: "auxi-h2",
    style: {
      margin: 0,
      flex: 1
    }
  }, "Wardrobe"), /*#__PURE__*/React.createElement(IconButton, {
    ariaLabel: "Sort"
  }, /*#__PURE__*/React.createElement("img", {
    src: ICON('sort.svg'),
    width: "22",
    height: "22"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      padding: '6px 20px 12px'
    }
  }, ['All', 'Top', 'Bottoms', 'One-Piece', 'Shoes', 'Ac'].map(c => /*#__PURE__*/React.createElement("div", {
    key: c,
    style: {
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement(Chip, {
    selected: cat === c,
    onClick: () => setCat(c)
  }, c)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '0 12px 12px',
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 4,
      alignContent: 'start'
    }
  }, WARDROBE.map((it, i) => /*#__PURE__*/React.createElement(ItemTile, {
    key: i,
    width: "100%",
    image: G(it.img),
    caption: it.cap,
    tag: it.tag,
    onClick: () => go('detail', it),
    style: {
      borderRadius: 12
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 20,
      bottom: 34,
      zIndex: 100
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => go('detail', WARDROBE[5]),
    style: {
      width: 56,
      height: 56,
      borderRadius: 28,
      border: 'none',
      cursor: 'pointer',
      background: 'var(--auxi-ink)',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M5 12h14",
    stroke: "#f2efec",
    strokeWidth: "2",
    strokeLinecap: "round"
  })))), /*#__PURE__*/React.createElement(HomeIndicator, null));
}

/* ---------- Item detail ---------- */
function ItemDetail({
  go,
  item
}) {
  const it = item || WARDROBE[5];
  const [fav, setFav] = React.useState(true);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement(StatusBar, null), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      margin: '6px 16px 0',
      borderRadius: 18,
      background: 'var(--auxi-cream)',
      overflow: 'hidden',
      aspectRatio: '1 / 1'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: G(it.img),
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'contain'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => go('wardrobe'),
    style: {
      position: 'absolute',
      top: 12,
      left: 12,
      width: 40,
      height: 40,
      borderRadius: 20,
      border: 'none',
      cursor: 'pointer',
      background: 'rgba(255,255,255,.85)',
      boxShadow: 'var(--shadow-floating)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M15 6l-6 6 6 6",
    stroke: "#1d1f23",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setFav(f => !f),
    style: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 40,
      height: 40,
      borderRadius: 20,
      border: 'none',
      cursor: 'pointer',
      background: fav ? '#eedcdd' : 'rgba(255,255,255,.85)',
      boxShadow: 'var(--shadow-floating)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: fav ? '#bb251a' : 'none'
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 21s-7.5-4.6-10-9.2C.3 8.4 1.7 4.5 5.2 4.5c2 0 3.3 1.2 3.8 2.2.5-1 1.8-2.2 3.8-2.2 3.5 0 4.9 3.9 3.2 7.3C19.5 16.4 12 21 12 21z",
    stroke: "#bb251a",
    strokeWidth: "1.6",
    strokeLinejoin: "round"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 24px 0',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "'Poppins',sans-serif",
      fontWeight: 600,
      fontSize: 24,
      color: '#1d1f23',
      margin: 0
    }
  }, it.cap), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "soft"
  }, it.tag), /*#__PURE__*/React.createElement(Badge, {
    tone: "tan"
  }, "Worn 6\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(DetailRow, {
    label: "Category",
    value: it.tag
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: "Color",
    value: "Neutral",
    dot: true
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: "Fabric",
    value: "Cotton blend"
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: "Last worn",
    value: "3 days ago",
    last: true
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 8px',
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    style: {
      flex: 1,
      minWidth: 0
    },
    leadingIcon: /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M5 7h14M10 7V5h4v2M6 7l1 13h10l1-13",
      stroke: "#bb251a",
      strokeWidth: "1.6",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#bb251a'
    }
  }, "Less used")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    style: {
      flex: 1.6,
      minWidth: 0
    },
    trailingIcon: /*#__PURE__*/React.createElement("img", {
      src: ICON('sparkle.svg'),
      width: "18",
      height: "18"
    })
  }, "See this on me")), /*#__PURE__*/React.createElement(HomeIndicator, null));
}
function DetailRow({
  label,
  value,
  dot,
  last
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '13px 0',
      borderBottom: last ? 'none' : '1px solid var(--auxi-hairline)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Inter',sans-serif",
      fontSize: 14,
      color: '#9e968e'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: "'Inter',sans-serif",
      fontSize: 15,
      color: '#1d1f23'
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      borderRadius: 6,
      background: '#d8cfc4',
      border: '1px solid #536173'
    }
  }), value));
}

/* ---------- Settings ---------- */
function Settings({
  go,
  openMenu
}) {
  const [remind, setRemind] = React.useState(true);
  const [period, setPeriod] = React.useState('AM');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement(StatusBar, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '8px 20px 10px'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    ariaLabel: "Menu",
    onClick: openMenu
  }, /*#__PURE__*/React.createElement("img", {
    src: ICON('menu.svg'),
    width: "22",
    height: "22"
  })), /*#__PURE__*/React.createElement("h2", {
    className: "auxi-h2",
    style: {
      margin: 0
    }
  }, "Settings")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '0 8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--auxi-cream)',
      borderRadius: 16,
      margin: '4px 12px 16px',
      padding: '18px 18px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Inter',sans-serif",
      fontSize: 15,
      color: '#1d1f23'
    }
  }, "Daily reminder"), /*#__PURE__*/React.createElement(Switch, {
    checked: remind,
    onChange: setRemind
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 16,
      marginTop: 14,
      opacity: remind ? 1 : 0.4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Poppins',sans-serif",
      fontWeight: 700,
      fontSize: 40,
      letterSpacing: '-0.02em',
      color: '#1d1f23'
    }
  }, "07 : 30"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      paddingBottom: 6
    }
  }, ['AM', 'PM'].map(p => /*#__PURE__*/React.createElement("label", {
    key: p,
    onClick: () => setPeriod(p),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      borderRadius: 9,
      border: `2px solid ${period === p ? '#070707' : '#9e968e'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, period === p && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: 5,
      background: '#070707'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Inter',sans-serif",
      fontSize: 14,
      color: period === p ? '#1d1f23' : '#9e968e'
    }
  }, p)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 12px'
    }
  }, /*#__PURE__*/React.createElement(ListRow, {
    label: "Style Direction",
    value: "Calm, Effortless"
  }), /*#__PURE__*/React.createElement(ListRow, {
    label: "Privacy"
  }), /*#__PURE__*/React.createElement(ListRow, {
    label: "Your photos"
  }), /*#__PURE__*/React.createElement(ListRow, {
    label: "Delete Data",
    danger: true
  }), /*#__PURE__*/React.createElement(ListRow, {
    label: "Version 1.0.3",
    muted: true,
    trailing: "none",
    last: true
  }))), /*#__PURE__*/React.createElement(HomeIndicator, null));
}
window.AuxiKit = {
  Welcome,
  Home,
  Wardrobe,
  ItemDetail,
  Settings,
  SideMenu
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile-app/Screens.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.StatusPill = __ds_scope.StatusPill;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.ItemTile = __ds_scope.ItemTile;

__ds_ns.ListRow = __ds_scope.ListRow;

__ds_ns.ActionSheet = __ds_scope.ActionSheet;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Snackbar = __ds_scope.Snackbar;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.AppHeader = __ds_scope.AppHeader;

__ds_ns.SideMenu = __ds_scope.SideMenu;

})();
