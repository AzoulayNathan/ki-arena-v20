#!/usr/bin/env python3
"""Build JOUER_KI_ARENA_V12.html offline pack (excludes portrait/card junctions)."""
from pathlib import Path
import re, base64, json, mimetypes

root = Path(__file__).resolve().parents[1]
SKIP_PREFIXES = ("assets/portraits-", "assets/cards-")
assets = {}
for path in sorted((root / "assets").rglob("*")):
    if not path.is_file():
        continue
    rel = path.relative_to(root).as_posix()
    if any(rel.startswith(p) for p in SKIP_PREFIXES):
        continue
    if path.stat().st_size > 8_000_000:
        print("skip large", rel, path.stat().st_size)
        continue
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    assets[rel] = "data:" + mime + ";base64," + base64.b64encode(path.read_bytes()).decode()
print("assets embedded", len(assets))

files = sorted((root / "src").rglob("*.js"))
modules = []
for f in files:
    source = f.read_text(encoding="utf-8")
    name = f.relative_to(root).as_posix()

    def imp(m, f=f):
        fields = m[1]
        target = (f.parent / m[2]).resolve().relative_to(root).as_posix()
        names = re.sub(r"\s+as\s+", ":", fields)
        return "const {" + names + "}=__require(" + json.dumps(target) + ");"

    source = re.sub(r"import\s*\{([^}]+)\}\s*from\s*['\"]([^'\"]+)['\"];?", imp, source)
    exports = re.findall(r"\bexport\s+(?:const|let|(?:async\s+)?function|class)\s+(\w+)", source)
    source = re.sub(r"\bexport\s+(?=(?:const|let|(?:async\s+)?function|class)\b)", "", source)
    if re.search(r"^import\s", source, re.M):
        raise RuntimeError("Unsupported import " + name)
    modules.append(json.dumps(name) + ":function(__require){\n" + source + "\nreturn {" + ",".join(exports) + "};\n}")

pixi = (root / "vendor/pixi-8.22.0.min.js").read_text(encoding="utf-8")
js = (
    pixi
    + ";\n"
    + "globalThis.KI_EMBEDDED_ASSETS="
    + json.dumps(assets, ensure_ascii=False, separators=(",", ":"))
    + ";\n(()=>{const modules={"
    + ",\n".join(modules)
    + '};const cache={};function __require(id){if(cache[id])return cache[id];if(!modules[id])throw Error("Module absent "+id);return cache[id]=modules[id](__require);}globalThis.KI_OPEN_LEGACY=()=>{document.body.className="";__require("src/app.js");const back=document.createElement("button");back.textContent="← Revenir à Arène 10";back.style.cssText="position:fixed;bottom:12px;right:16px;z-index:99999;background:#fff9e9;color:#182832;border:1px solid #849b83;border-radius:7px;padding:12px 16px;min-height:44px;cursor:pointer";back.onclick=()=>location.reload();document.body.append(back);};__require("src/arena/ui.js");})();'
)

css = ""
for f in [
    "styles-local.css",
    "v3.css",
    "v5.css",
    "v51.css",
    "v52.css",
    "rogue-v6.css",
    "rogue-v7.css",
    "rogue-v8.css",
    "survival/survival.css",
    "adventure.css",
    "viewport.css",
    "arena/arena.css",
    "arena/impact.css",
]:
    p = root / "src" / f
    if not p.exists():
        continue
    s = p.read_text(encoding="utf-8")
    s = re.sub(r"@import\s+url\([^)]*\)\s*;", "", s, flags=re.S)

    def uri(m, p=p):
        url = m[1].strip("\"'")
        if url.startswith(("data:", "#")):
            return m[0]
        target = (p.parent / url).resolve().relative_to(root).as_posix()
        if target not in assets:
            return m[0]
        return 'url("' + assets[target] + '")'

    s = re.sub(r"url\(([^)]+)\)", uri, s)
    css += "\n" + s

html = (root / "index.html").read_text(encoding="utf-8")
html = re.sub(r'<link rel="stylesheet"[^>]+>', "", html)
html = re.sub(r'<link rel="manifest"[^>]+>', "", html)
html = html.replace('<script src="./vendor/pixi-8.22.0.min.js"></script>', "")
if "assets/icon-192.png" in assets:
    html = html.replace("./assets/icon-192.png", assets["assets/icon-192.png"])
html = html.replace("</head>", "<style>" + css + "</style></head>")
html = html.replace(
    '<script type="module" src="./src/arena/ui.js"></script>',
    "<script>" + js.replace("</script>", "<\\/script>") + "</script>",
)
if "assets/theme/hero-goku.webp" in assets:
    html = html.replace(
        'src="assets/theme/hero-goku.webp"',
        'src="' + assets["assets/theme/hero-goku.webp"] + '"',
    )
out = root / "JOUER_KI_ARENA_V12.html"
out.write_text(html, encoding="utf-8")
print(f"{out.name}: {out.stat().st_size/1048576:.2f} MiB, {len(assets)} assets, {len(files)} modules")
