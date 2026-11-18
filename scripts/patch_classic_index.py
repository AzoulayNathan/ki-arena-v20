from pathlib import Path
p = Path(__file__).resolve().parents[1] / "classic" / "index.html"
t = p.read_text(encoding="utf-8")
banner = (
    '<style id="classic-banner">.v23-classic-banner{position:sticky;top:0;z-index:9999;'
    "display:flex;gap:.75rem;align-items:center;justify-content:space-between;"
    "padding:.55rem 1rem;background:#142018;color:#f4f0ea;font:600 .85rem/1.3 Georgia,serif;"
    "border-bottom:1px solid rgba(255,255,255,.12)}.v23-classic-banner a{color:#f7923e;text-decoration:none}"
    '</style><div class="v23-classic-banner" role="banner">'
    "<span>Version précédente (V22)</span>"
    '<a href="../">Nouvelle version V12</a></div>'
)
sw = (
    '<script>if("serviceWorker"in navigator)'
    'navigator.serviceWorker.register("./sw.js",{scope:"./"}).catch(()=>{});</script>'
)
if "v23-classic-banner" not in t:
    t = t.replace("<body>", "<body>" + banner, 1)
if "serviceWorker.register" not in t:
    t = t.replace("</body>", sw + "</body>", 1)
p.write_text(t, encoding="utf-8")
print("ok", "banner" if "v23-classic-banner" in t else "no-banner", "sw" if "serviceWorker" in t else "no-sw")
