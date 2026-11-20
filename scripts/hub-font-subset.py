"""Regenerate public/hub/hub-cjk*.ttf from Noto Sans SC (OFL) for every non-ASCII char in the Hub sources.
Usage: python scripts/hub-font-subset.py /path/to/NotoSansSC[wght].ttf"""
import pathlib, sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools import subset

root = pathlib.Path(__file__).resolve().parent.parent
chars = set()
for d in ("components", "lib", "app"):
    for f in (root / d).rglob("*"):
        if f.suffix in (".ts", ".tsx", ".css"):
            chars |= {c for c in f.read_text("utf-8") if ord(c) > 0x2000}
chars |= set("，。：；！？、（）《》“”…—·￥")
text = "".join(sorted(chars))
for weight, name in ((400, "hub-cjk.ttf"), (700, "hub-cjk-bold.ttf")):
    font = instantiateVariableFont(TTFont(sys.argv[1]), {"wght": weight})
    opts = subset.Options(); opts.layout_features = ["*"]; opts.name_IDs = ["*"]
    s = subset.Subsetter(opts); s.populate(text=text); s.subset(font)
    font.save(root / "public" / "hub" / name)
print(len(text), "glyphs")
