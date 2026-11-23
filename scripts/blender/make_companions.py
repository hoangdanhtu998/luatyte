#!/usr/bin/env python3
# Sinh 16 nhân vật chibi động vật cho trợ lý Sổ tay Luật Y tế.
# Chạy headless:  blender -b -P make_companions.py -- --out <thư mục>
# Output: <out>/<id>.glb, <out>/thumbs/<id>.png, <out>/states/dc-*.png, <out>/../../data/companions.json
# Phong cách: đầu to ~1:1, bo tròn, tông pastel, outline navy (khớp phác thảo PNG đã duyệt).
import bpy, math, os, sys, json, traceback
from mathutils import Vector

# ---------------- CLI ----------------
def _cli():
    a = sys.argv
    return a[a.index("--") + 1:] if "--" in a else []
ARGS = _cli()
def opt(name, default):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = opt("--out", os.path.join(os.getcwd(), "assets", "companions"))
MASCOT = opt("--mascot", "soc")   # con dùng làm mascot game/steps

# ---------------- helper chung ----------------
def srgb_to_lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def hexrgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))

def mat(hx, rough=0.9, name=None):
    mname = name or ("m" + hx.lstrip("#"))
    m = bpy.data.materials.get(mname)
    if m:
        return m
    m = bpy.data.materials.new(mname)
    m.use_nodes = True
    b = m.node_tree.nodes.get("Principled BSDF")
    r, g, bl = hexrgb(hx)
    b.inputs["Base Color"].default_value = (srgb_to_lin(r), srgb_to_lin(g), srgb_to_lin(bl), 1.0)
    b.inputs["Roughness"].default_value = rough
    return m

def sphere(loc, scale, material, rot=(0, 0, 0), seg=16, ring=10):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=ring, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    bpy.ops.object.shade_smooth()
    return o

def cone(loc, r1, r2, depth, material, rot=(0, 0, 0), scale=(1, 1, 1), verts=16):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=depth,
                                    location=loc, rotation=rot)
    o = bpy.context.active_object
    o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    bpy.ops.object.shade_smooth()
    return o

def cyl(loc, r, depth, material, rot=(0, 0, 0), scale=(1, 1, 1), verts=20):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth,
                                        location=loc, rotation=rot)
    o = bpy.context.active_object
    o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    bpy.ops.object.shade_smooth()
    return o

def join(objs, name, origin=None):
    objs = [o for o in objs if o and o.name in bpy.data.objects]
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    out = bpy.context.active_object
    out.name = name
    out.data.name = name
    if origin:
        bpy.context.scene.cursor.location = origin
        bpy.ops.object.origin_set(type="ORIGIN_CURSOR")
    return out

def clear_all():
    # chỉ xóa mesh của con trước đó; giữ camera + sun
    for o in list(bpy.data.objects):
        if o.type == "MESH":
            bpy.data.objects.remove(o, do_unlink=True)

# ---------------- mặt mặc định (mặt hướng -Y) ----------------
BODY_Z = 0.40
HEAD_Z = 0.97
NECK = (0, 0, 0.78)

def base(skin, belly=None, face=None, head=(0.43, 0.41, 0.40), body=(0.34, 0.31, 0.34),
         eye_dx=0.155, eye_z=1.03, eye_r=0.075, mouth_col="#4A342B", feet_col=None,
         blush=True, eye_y=-0.355, mouth=(0, -0.385, 0.90, 0.075, 0.035, 0.022)):
    """Sinh body + head + 2 mắt + miệng. Trả dict các nhóm đối tượng (chưa join)."""
    g = {"body": [], "head": [], "eyeL": None, "eyeR": None, "mouth": None}
    m_skin, m_face = mat(skin), (mat(face) if face else None)
    if face:
        # đốm mặt lồi ra trước -> mắt/miệng phải đẩy ra thêm mới không bị chìm
        eye_y = -0.365

    b = sphere((0, 0, BODY_Z), body, m_skin)
    g["body"].append(b)
    if belly:
        g["body"].append(sphere((0, -body[1] * 0.52, BODY_Z - 0.03),
                                (body[0] * 0.66, body[1] * 0.55, body[2] * 0.68), mat(belly)))
    fc = feet_col or skin
    for sx in (-1, 1):
        g["body"].append(sphere((sx * 0.14, -0.10, 0.10), (0.11, 0.13, 0.09), mat(fc)))

    h = sphere((0, 0, HEAD_Z), head, m_skin)
    g["head"].append(h)
    if face:
        g["head"].append(sphere((0, -head[1] * 0.60, HEAD_Z - 0.045),
                                (head[0] * 0.68, head[1] * 0.52, head[2] * 0.60), m_face))

    EYE = mat("#26262E")
    WHT = mat("#FFFFFF")
    for sx, key in ((-1, "eyeL"), (1, "eyeR")):
        e = sphere((sx * eye_dx, eye_y, eye_z), (eye_r, eye_r * 1.0, eye_r * 1.15), EYE)
        hl = sphere((sx * eye_dx + 0.02, eye_y - 0.048, eye_z + 0.030),
                    (eye_r * 0.36, eye_r * 0.36, eye_r * 0.36), WHT)
        g[key] = join([e, hl], key, origin=(sx * eye_dx, eye_y, eye_z))

    mx, my, mz, mw, md, mh = mouth
    if face:
        my = -0.445     # đưa miệng ra khỏi mặt kem (nếu không talking sẽ bị giấu trong đầu)
    g["mouth"] = sphere((mx, my, mz), (mw, md, mh), mat(mouth_col), seg=24, ring=12)
    g["mouth"].name = "Mouth"
    g["mouth"].data.name = "Mouth"

    if blush:
        BLS = mat("#F7A8A8")
        for sx in (-1, 1):
            g["head"].append(sphere((sx * (eye_dx + 0.115), -0.325, eye_z - 0.10),
                                    (0.075, 0.030, 0.048), BLS, seg=20, ring=12))
    return g

def add_ears_round(g, skin, inner=None, dx=0.26, dz=0.36, r=0.145, y=0.02):
    for sx in (-1, 1):
        g["head"].append(sphere((sx * dx, y, HEAD_Z + dz), (r, r * 0.7, r), mat(skin)))
        if inner:
            g["head"].append(sphere((sx * dx, y - r * 0.55, HEAD_Z + dz),
                                    (r * 0.55, r * 0.28, r * 0.55), mat(inner), seg=20, ring=12))

def add_ears_cone(g, skin, inner=None, dx=0.24, dz=0.34, h=0.30, r=0.13, tilt=0.22):
    for sx in (-1, 1):
        g["head"].append(cone((sx * dx, 0.02, HEAD_Z + dz), r, 0.01, h, mat(skin),
                              rot=(0, sx * tilt, 0), scale=(1, 0.6, 1)))
        if inner:
            g["head"].append(cone((sx * dx, -0.03, HEAD_Z + dz - 0.01), r * 0.55, 0.01,
                                  h * 0.7, mat(inner), rot=(0, sx * tilt, 0), scale=(1, 0.5, 1)))

def add_tail(g, skin, loc=(0, 0.32, 0.60), scale=(0.13, 0.13, 0.22), rot=(0, 0, 0), tip=None):
    t = sphere(loc, scale, mat(skin), rot=rot)
    g["body"].append(t)
    if tip:
        # đuôi trắng/đậm ở đầu
        d = Vector(scale)
        dirv = Vector((0, 0, 1))
        q = Vector(rot)
        tip_loc = Vector(loc) + Vector((0, d.y * 0.2, d.z * 0.72))
        g["body"].append(sphere(tip_loc, (scale[0] * 0.8, scale[1] * 0.8, scale[2] * 0.5), mat(tip)))

def feet_col_of(c):
    return c

# ---------------- 16 con ----------------
ANIMALS = {}

def animal(id_, name):
    def deco(fn):
        ANIMALS[id_] = (name, fn)
        return fn
    return deco

@animal("soc", "Sóc")
def _soc():
    g = base("#C9773C", belly="#F6E3CB", face="#F6E3CB")
    add_ears_round(g, "#C9773C", inner="#E8A56B", dx=0.25, dz=0.35, r=0.135)
    # đuôi bushy vắt lên bên phải
    g["body"].append(sphere((0.24, 0.26, 0.72), (0.17, 0.13, 0.30), mat("#C9773C"),
                            rot=(0, -0.35, 0)))
    g["body"].append(sphere((0.30, 0.24, 0.97), (0.13, 0.11, 0.15), mat("#F6E3CB")))
    return g

@animal("cho", "Chó")
def _cho():
    g = base("#F0D9B8", belly="#FBF3E6", face="#FBF3E6", mouth_col="#3B2F28")
    # tai cụp
    for sx in (-1, 1):
        g["head"].append(sphere((sx * 0.38, 0.03, HEAD_Z + 0.14), (0.115, 0.10, 0.235),
                                mat("#B98254"), rot=(0, sx * 0.35, 0)))
    g["head"].append(sphere((0, -0.40, HEAD_Z + 0.05), (0.055, 0.045, 0.04), mat("#3B2F28"), seg=20, ring=12))
    add_tail(g, "#F0D9B8", loc=(0.10, 0.33, 0.62), scale=(0.11, 0.10, 0.15), rot=(-0.5, 0, 0.3))
    return g

@animal("gau", "Gấu")
def _gau():
    g = base("#A9744B", belly="#E9CBA6", face="#E9CBA6", mouth_col="#3B2F28")
    add_ears_round(g, "#A9744B", inner="#E9CBA6", dx=0.27, dz=0.35, r=0.15)
    g["head"].append(sphere((0, -0.415, HEAD_Z + 0.055), (0.075, 0.055, 0.05), mat("#3B2F28"), seg=20, ring=12))
    add_tail(g, "#A9744B", loc=(0, 0.33, 0.52), scale=(0.10, 0.09, 0.10))
    return g

@animal("gau-truc", "Gấu trúc")
def _gautruc():
    g = base("#FCFCFA", belly=None, face=None, mouth_col="#2B2B33", feet_col="#2B2B33")
    add_ears_round(g, "#2B2B33", dx=0.27, dz=0.35, r=0.15)
    # đốm mắt đen
    for sx in (-1, 1):
        g["head"].append(sphere((sx * 0.155, -0.335, 1.03), (0.115, 0.05, 0.145), mat("#2B2B33"),
                                rot=(0, 0, sx * 0.25), seg=24, ring=14))
    # tay/chân đen
    for sx in (-1, 1):
        g["body"].append(sphere((sx * 0.30, -0.06, 0.40), (0.095, 0.10, 0.15), mat("#2B2B33"),
                                rot=(0, 0, sx * 0.4)))
    g["head"].append(sphere((0, -0.40, HEAD_Z - 0.03), (0.065, 0.05, 0.045), mat("#2B2B33"), seg=20, ring=12))
    return g

@animal("tho", "Thỏ")
def _tho():
    g = base("#FCFCFA", belly="#FBE3EA", face="#FBE3EA", mouth_col="#E06A96")
    # tai dài
    for sx in (-1, 1):
        g["head"].append(sphere((sx * 0.17, 0.03, HEAD_Z + 0.52), (0.085, 0.07, 0.30),
                                mat("#FCFCFA"), rot=(0, sx * 0.16, 0)))
        g["head"].append(sphere((sx * 0.17, -0.025, HEAD_Z + 0.52), (0.045, 0.04, 0.22),
                                mat("#F7A8C0"), rot=(0, sx * 0.16, 0), seg=20, ring=12))
    g["head"].append(sphere((0, -0.415, HEAD_Z + 0.04), (0.05, 0.04, 0.038), mat("#F08BB0"), seg=20, ring=12))
    add_tail(g, "#FCFCFA", loc=(0, 0.34, 0.52), scale=(0.115, 0.11, 0.115))
    return g

@animal("cao", "Cáo")
def _cao():
    g = base("#E0813F", belly=None, face=None, mouth_col="#3B2F28",
             mouth=(0, -0.47, 0.84, 0.07, 0.035, 0.022))
    # má kem + mõm
    g["head"].append(sphere((0, -0.34, HEAD_Z - 0.10), (0.30, 0.14, 0.22), mat("#FBF3E6")))
    add_ears_cone(g, "#E0813F", inner="#FBF3E6", dx=0.25, dz=0.34, h=0.30, r=0.135, tilt=0.28)
    g["head"].append(sphere((0, -0.475, HEAD_Z - 0.045), (0.06, 0.045, 0.042), mat("#3B2F28"), seg=20, ring=12))
    # đuôi to chấm trắng
    g["body"].append(sphere((-0.22, 0.28, 0.62), (0.16, 0.14, 0.26), mat("#E0813F"), rot=(0, 0.4, 0)))
    g["body"].append(sphere((-0.32, 0.24, 0.84), (0.13, 0.12, 0.14), mat("#FBF3E6")))
    return g

@animal("cu", "Cú")
def _cu():
    g = base("#9B8AC4", belly="#A896D0", face=None, mouth_col="#3B2F28",
             head=(0.44, 0.42, 0.42), body=(0.36, 0.33, 0.36), eye_dx=0.165, eye_z=1.02)
    # vành mắt sáng
    for sx in (-1, 1):
        g["head"].append(sphere((sx * 0.165, -0.345, 1.02), (0.145, 0.05, 0.155), mat("#FBF3E6"), seg=24, ring=14))
    # mỏ tam giác
    g["head"].append(cone((0, -0.44, 0.945), 0.075, 0.005, 0.15, mat("#F0A83F"),
                          rot=(math.radians(-95), 0, 0), scale=(1, 1, 0.9)))
    # lông tơ trên đầu + cánh
    add_ears_cone(g, "#9B8AC4", dx=0.24, dz=0.38, h=0.17, r=0.10, tilt=0.35)
    for sx in (-1, 1):
        g["body"].append(sphere((sx * 0.33, 0.03, 0.42), (0.10, 0.13, 0.22), mat("#8474B5"),
                                rot=(0, 0, sx * 0.25)))
    # chân cam
    for sx in (-1, 1):
        g["body"].append(sphere((sx * 0.13, -0.10, 0.08), (0.10, 0.12, 0.07), mat("#F0A83F")))
    return g

@animal("vit", "Vịt")
def _vit():
    g = base("#F7D74D", belly="#FBF3E6", face=None, mouth_col="#3B2F28",
             head=(0.42, 0.40, 0.38), eye_z=1.04, eye_dx=0.16)
    # mỏ trên gắn head, mỏ dưới = Mouth (talking = há mỏ)
    g["head"].append(sphere((0, -0.42, 0.965), (0.155, 0.10, 0.055), mat("#F0913C")))
    g["mouth"] = sphere((0, -0.415, 0.925), (0.14, 0.09, 0.042), mat("#E07B2A"), seg=24, ring=12)
    # cánh
    for sx in (-1, 1):
        g["body"].append(sphere((sx * 0.33, 0.04, 0.42), (0.09, 0.13, 0.20), mat("#EDC733"),
                                rot=(0, 0, sx * 0.28)))
    # chân
    for sx in (-1, 1):
        g["body"].append(sphere((sx * 0.14, -0.12, 0.07), (0.11, 0.14, 0.06), mat("#F0913C")))
    # chỏm đầu
    g["head"].append(sphere((0.02, 0.0, HEAD_Z + 0.36), (0.05, 0.05, 0.09), mat("#EDC733"), seg=16, ring=10))
    return g

@animal("ech", "Ếch")
def _ech():
    g = base("#8ED468", belly="#E4F5CF", face=None, mouth_col="#3F7A2E",
             head=(0.45, 0.42, 0.38), body=(0.37, 0.34, 0.33), eye_z=1.10, eye_dx=0.20,
             mouth=(0, -0.40, 0.86, 0.30, 0.035, 0.03), feet_col="#7FC65A")
    # gỡ mắt base (mắt ếch nằm trên đầu)
    for k in ("eyeL", "eyeR"):
        bpy.data.objects.remove(g[k], do_unlink=True)
        g[k] = None
    for sx, key in ((-1, "eyeL"), (1, "eyeR")):
        g["head"].append(sphere((sx * 0.20, -0.14, 1.26), (0.135, 0.13, 0.135), mat("#8ED468")))
        e = sphere((sx * 0.20, -0.245, 1.29), (0.075, 0.06, 0.075), mat("#26262E"))
        hl = sphere((sx * 0.20 + 0.02, -0.30, 1.315), (0.027, 0.027, 0.027), mat("#FFFFFF"))
        g[key] = join([e, hl], key, origin=(sx * 0.20, -0.245, 1.29))
    # chân trước
    for sx in (-1, 1):
        g["body"].append(sphere((sx * 0.30, -0.14, 0.14), (0.14, 0.15, 0.10), mat("#7FC65A")))
    return g

@animal("khi", "Khỉ")
def _khi():
    g = base("#A9744B", belly="#E9CBA6", face=None, mouth_col="#3B2F28",
             mouth=(0, -0.40, 0.845, 0.075, 0.035, 0.022))
    # mặt kem mỏng để mắt không bị chìm
    g["head"].append(sphere((0, -0.28, HEAD_Z - 0.03), (0.31, 0.10, 0.30), mat("#E9CBA6")))
    # tai ngoài
    for sx in (-1, 1):
        g["head"].append(sphere((sx * 0.43, 0.02, HEAD_Z + 0.02), (0.115, 0.09, 0.125), mat("#A9744B")))
        g["head"].append(sphere((sx * 0.45, -0.05, HEAD_Z + 0.02), (0.06, 0.05, 0.065), mat("#E9CBA6"), seg=20, ring=12))
    g["head"].append(sphere((0, -0.435, HEAD_Z - 0.04), (0.05, 0.04, 0.035), mat("#3B2F28"), seg=20, ring=12))
    # đuôi cuốn
    g["body"].append(sphere((0.26, 0.30, 0.56), (0.10, 0.10, 0.14), mat("#A9744B"), rot=(-0.6, 0, -0.5)))
    g["body"].append(sphere((0.36, 0.26, 0.66), (0.08, 0.08, 0.10), mat("#A9744B")))
    return g

@animal("cuu", "Cừu")
def _cuu():
    g = base("#E9CBA6", belly=None, face=None, mouth_col="#3B2F28", feet_col="#D9B58F")
    # len cuộn: cụm tròn quanh đầu + người
    W = mat("#FCFCFA")
    wool_head = [(0, 0.05, HEAD_Z + 0.30, 0.30), (-0.28, 0.03, HEAD_Z + 0.18, 0.22),
                 (0.28, 0.03, HEAD_Z + 0.18, 0.22), (-0.16, 0.05, HEAD_Z + 0.36, 0.20),
                 (0.16, 0.05, HEAD_Z + 0.36, 0.20), (0, 0.08, HEAD_Z + 0.42, 0.18)]
    for x, y, z, r in wool_head:
        g["head"].append(sphere((x, y, z), (r, r * 0.85, r), W, seg=24, ring=14))
    # thân len
    for x, z, r in [(-0.26, 0.55, 0.20), (0.26, 0.55, 0.20), (0, 0.66, 0.24), (-0.14, 0.20, 0.19), (0.14, 0.20, 0.19)]:
        g["body"].append(sphere((x, 0.14, z), (r, r * 0.9, r), W, seg=24, ring=14))
    # tai rũ
    for sx in (-1, 1):
        g["head"].append(sphere((sx * 0.36, -0.02, HEAD_Z + 0.12), (0.11, 0.07, 0.075),
                                mat("#E9CBA6"), rot=(0, 0, sx * 0.5)))
    g["head"].append(sphere((0, -0.42, HEAD_Z - 0.03), (0.05, 0.04, 0.036), mat("#3B2F28"), seg=20, ring=12))
    return g

@animal("heo", "Heo")
def _heo():
    g = base("#F7B6C4", belly="#FDE4EB", face=None, mouth_col="#3B2F28", feet_col="#F49FB6")
    # mũi to
    g["head"].append(cyl((0, -0.435, HEAD_Z - 0.01), 0.135, 0.075, mat("#F08BB0"),
                         rot=(math.radians(90), 0, 0)))
    for sx in (-1, 1):
        g["head"].append(sphere((sx * 0.055, -0.475, HEAD_Z - 0.01), (0.026, 0.02, 0.034),
                                mat("#3B2F28"), seg=16, ring=10))
    # miệng = mũi dưới? giữ mouth mặc định nhưng giấu trong mũi: thay bằng mép miệng dưới mũi
    g["mouth"] = sphere((0, -0.42, HEAD_Z - 0.17), (0.075, 0.03, 0.02), mat("#3B2F28"), seg=20, ring=12)
    # tai cụp tam giác
    for sx in (-1, 1):
        g["head"].append(cone((sx * 0.25, -0.02, HEAD_Z + 0.33), 0.14, 0.02, 0.22, mat("#F7B6C4"),
                              rot=(0.25, sx * 0.3, 0), scale=(1, 0.55, 1)))
    # đuôi xoắn (2 bi)
    g["body"].append(sphere((0.16, 0.33, 0.55), (0.075, 0.07, 0.085), mat("#F49FB6")))
    g["body"].append(sphere((0.24, 0.35, 0.62), (0.06, 0.055, 0.065), mat("#F49FB6")))
    return g

@animal("canh-cung-tuc", "Chim cánh cụt")
def _penguin():
    g = base("#3A4356", belly=None, face=None, mouth_col="#2A3140",
             head=(0.42, 0.40, 0.39), body=(0.37, 0.34, 0.37), feet_col="#F0913C")
    # bụng trắng + mặt trắng
    g["body"].append(sphere((0, -0.17, 0.38), (0.26, 0.20, 0.30), mat("#FBF3E6")))
    g["head"].append(sphere((0, -0.315, HEAD_Z - 0.01), (0.30, 0.14, 0.29), mat("#FBF3E6")))
    # mỏ
    g["head"].append(cone((0, -0.475, 0.955), 0.07, 0.005, 0.14, mat("#F0913C"),
                          rot=(math.radians(-95), 0, 0)))
    # cánh
    for sx in (-1, 1):
        g["body"].append(sphere((sx * 0.35, 0.03, 0.44), (0.085, 0.13, 0.24), mat("#3A4356"),
                                rot=(0, 0, sx * 0.3)))
    # chân
    for sx in (-1, 1):
        g["body"].append(sphere((sx * 0.14, -0.14, 0.07), (0.115, 0.15, 0.06), mat("#F0913C")))
    # miệng dưới mỏ (để talking = há mỏ)
    g["mouth"] = sphere((0, -0.44, 0.905), (0.06, 0.05, 0.03), mat("#D97B2A"), seg=20, ring=12)
    return g

@animal("chuot-hamster", "Chuột hamster")
def _hamster():
    g = base("#F2C48F", belly="#FBF3E6", face="#FBF3E6", mouth_col="#3B2F28", feet_col="#E8B37C")
    add_ears_round(g, "#F2C48F", inner="#F7A8C0", dx=0.24, dz=0.36, r=0.125)
    # má phúng
    for sx in (-1, 1):
        g["head"].append(sphere((sx * 0.27, -0.30, HEAD_Z - 0.10), (0.16, 0.12, 0.14), mat("#FBF3E6")))
    g["head"].append(sphere((0, -0.44, HEAD_Z - 0.055), (0.045, 0.035, 0.032), mat("#E06A96"), seg=20, ring=12))
    return g

@animal("huou", "Hươu")
def _huou():
    g = base("#D9A66B", belly="#F6E3CB", face="#F6E3CB", mouth_col="#3B2F28")
    # sừng non
    for sx in (-1, 1):
        g["head"].append(cone((sx * 0.16, 0.04, HEAD_Z + 0.40), 0.055, 0.012, 0.24, mat("#8A5F3A"),
                              rot=(0, sx * 0.25, 0)))
        g["head"].append(cone((sx * 0.22, 0.04, HEAD_Z + 0.44), 0.035, 0.008, 0.14, mat("#8A5F3A"),
                              rot=(0, sx * 0.7, 0)))
    # tai ngang
    for sx in (-1, 1):
        g["head"].append(sphere((sx * 0.40, 0.02, HEAD_Z + 0.12), (0.13, 0.07, 0.085),
                                mat("#D9A66B"), rot=(0, 0, sx * 0.45)))
    # đốm trắng
    for x, z in [(-0.16, 0.52), (0.14, 0.44), (0.02, 0.58), (0.22, 0.30)]:
        g["body"].append(sphere((x, -0.20, z), (0.05, 0.03, 0.05), mat("#FBF3E6"), seg=16, ring=10))
    g["head"].append(sphere((0, -0.44, HEAD_Z + 0.02), (0.06, 0.045, 0.04), mat("#3B2F28"), seg=20, ring=12))
    return g

@animal("rua", "Rùa")
def _rua():
    g = base("#8ED468", belly=None, face=None, mouth_col="#3F7A2E",
             head=(0.36, 0.36, 0.34), body=(0.36, 0.34, 0.30), eye_dx=0.14, eye_z=0.99,
             eye_y=-0.30, mouth=(0, -0.34, 0.90, 0.07, 0.03, 0.02), feet_col="#7FC65A")
    # vỏ dome sau lưng — rộng hơn người để nhìn rõ từ trước/ba phần tư
    g["body"].append(sphere((0, 0.13, 0.52), (0.50, 0.40, 0.36), mat("#7FC65A")))
    g["body"].append(sphere((0, 0.13, 0.46), (0.52, 0.42, 0.30), mat("#5FA844")))   # vành vỏ sẫm
    # hoa văn vỏ nhô lên đỉnh
    for x, y, z in [(0, -0.10, 0.84), (-0.26, 0.02, 0.78), (0.26, 0.02, 0.78),
                    (0, 0.24, 0.82), (-0.16, 0.30, 0.74), (0.16, 0.30, 0.74)]:
        g["body"].append(sphere((x, y, z), (0.13, 0.12, 0.09), mat("#4E9438"), seg=18, ring=10))
    # 4 chân rùa
    for sx in (-1, 1):
        g["body"].append(sphere((sx * 0.30, -0.16, 0.13), (0.13, 0.15, 0.09), mat("#7FC65A"),
                                rot=(0, 0, sx * 0.4)))
    return g

# ---------------- dựng + export ----------------
def build_one(id_, name, fn):
    g = fn()
    parts = []
    parts.append(join(g["body"], "Body"))
    head = join(g["head"], "Head", origin=NECK)
    parts.append(head)
    # mắt + miệng là CON của Head -> nghiêng đầu (thinking) thì mặt đi theo
    for p in (g["eyeL"], g["eyeR"]):
        p.parent = head
        p.matrix_parent_inverse = head.matrix_world.inverted()
        parts.append(p)
    mouth = g["mouth"]
    # dọn "mồ côi": con gán lại g["mouth"] (Heo/Vịt/Cánh cụt) bỏ rơi object Mouth cũ của base()
    orphan = bpy.data.objects.get("Mouth")
    if orphan is not None and orphan != mouth:
        bpy.data.objects.remove(orphan, do_unlink=True)
    mouth.name = "Mouth"
    mouth.data.name = "Mouth"
    mouth.parent = head
    mouth.matrix_parent_inverse = head.matrix_world.inverted()
    parts.append(mouth)
    for p in parts:
        p.select_set(True)
    return parts

def export_glb(parts, path):
    bpy.ops.object.select_all(action="DESELECT")
    for p in parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    try:
        bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", use_selection=True,
                                  export_apply=True, export_cameras=False, export_lights=False,
                                  export_animations=False, export_materials="EXPORT")
    except TypeError:
        bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", use_selection=True)

# ---------------- camera + render ----------------
def setup_scene():
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = 48
    sc.cycles.use_denoising = True
    sc.render.resolution_x = 512
    sc.render.resolution_y = 512
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.render.film_transparent = True
    sc.view_settings.view_transform = "Standard"
    # world trắng nhẹ
    w = bpy.data.worlds.get("W") or bpy.data.worlds.new("W")
    sc.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes.get("Background")
    bg.inputs[0].default_value = (1, 1, 1, 1)
    bg.inputs[1].default_value = 1.0
    # nắng mềm
    if "Sun" not in bpy.data.objects:
        bpy.ops.object.light_add(type="SUN", location=(2, -3, 4))
        sun = bpy.context.active_object
        sun.name = "Sun"
        sun.data.energy = 1.6
        sun.rotation_euler = (math.radians(50), 0, math.radians(-35))
    # camera
    if "Cam" not in bpy.data.objects:
        bpy.ops.object.camera_add(location=(1.7, -4.2, 1.55))
        cam = bpy.context.active_object
        cam.name = "Cam"
    cam = bpy.data.objects["Cam"]
    cam.data.type = "ORTHO"
    sc.camera = cam          # bắt buộc: nếu không render bằng camera mặc định của Blender
    return sc, cam

def aim(cam, loc, target, ortho):
    cam.location = loc
    d = Vector(target) - Vector(loc)
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    cam.data.ortho_scale = ortho

def render(path, cam):
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)

# ---------------- trạng thái mascot (game/steps) ----------------
def pose_state(parts, state):
    by = {p.name: p for p in parts}
    head, eyes, mouth = by["Head"], [by["eyeL"], by["eyeR"]], by["Mouth"]
    root = by["Body"]
    # reset
    head.rotation_euler = (0, 0, 0)
    root.rotation_euler = (0, 0, 0)
    if "bl" not in root:
        root["bl"] = [round(v, 5) for v in root.location]   # origin Body ở z=0.40, không được reset về 0
    bl = root["bl"]
    root.location = (bl[0], bl[1], bl[2])
    for e in eyes:
        e.scale = (1, 1, 1)
        if "bz" not in e:
            e["bz"] = e.location.z
        e.location.z = e["bz"]          # tránh dồn offset qua các state
    mouth.scale = (1, 1, 1)
    if state == "chao":            # chào: nghiêng đầu + há miệng
        head.rotation_euler = (0, 0.22, 0)
        mouth.scale = (1, 1, 2.6)
    elif state == "vui":           # vui: mắt híp + cười to
        head.rotation_euler = (0, -0.14, 0)
        for e in eyes:
            e.scale = (1, 1, 0.32)
        mouth.scale = (1, 1, 3.0)
    elif state == "suy-nghi":      # suy nghĩ: nghiêng đầu, nhìn lên, mím
        head.rotation_euler = (0, 0.20, 0)
        for e in eyes:
            e.location.z += 0.02
    elif state == "nhe-nhang":     # nhẹ nhàng: nghiêng nhẹ, mắt nửa híp
        head.rotation_euler = (0, -0.16, 0)
        for e in eyes:
            e.scale = (1, 1, 0.55)
        mouth.scale = (1, 1, 1.5)
    elif state == "tai-vo-o":      # nhảy tới ô băm: nghiêng người + há miệng
        root.rotation_euler = (math.radians(-14), 0, 0.12)
        root.location = (bl[0], bl[1], bl[2] + 0.10)
        mouth.scale = (1, 1, 2.6)

def render_states(parts, outdir, cam):
    os.makedirs(outdir, exist_ok=True)
    sc = bpy.context.scene
    w, h = sc.render.resolution_x, sc.render.resolution_y
    sc.render.resolution_x = 512
    sc.render.resolution_y = 512
    states = ["chao", "vui", "suy-nghi", "nhe-nhang", "tai-vo-o"]
    aim(cam, (0, -4.3, 1.15), (0, 0, 0.78), 2.0)
    for s in states:
        pose_state(parts, s)
        render(os.path.join(outdir, "dc-%s.png" % s), cam)
    # icon đầu-cận
    pose_state(parts, "idle-reset")
    aim(cam, (0.4, -3.2, 1.1), (0, 0, 1.0), 1.35)
    sc.render.resolution_x = 128
    sc.render.resolution_y = 128
    render(os.path.join(outdir, "dc-icon.png"), cam)
    sc.render.resolution_x = w
    sc.render.resolution_y = h

# ---------------- main ----------------
def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)   # bỏ cube/light/camera mặc định
    sc, cam = setup_scene()
    sc.render.resolution_x = 256                      # thumb picker: 256 là đủ
    sc.render.resolution_y = 256
    os.makedirs(OUT, exist_ok=True)
    thumbs = os.path.join(OUT, "thumbs")
    os.makedirs(thumbs, exist_ok=True)
    manifest = []
    for id_, (name, fn) in ANIMALS.items():
        print("== build", id_, name)
        clear_all()
        parts = build_one(id_, name, fn)
        export_glb(parts, os.path.join(OUT, id_ + ".glb"))
        # thumbnail 3/4
        aim(cam, (1.7, -4.2, 1.55), (0, 0, 0.78), 2.15)
        render(os.path.join(thumbs, id_ + ".png"), cam)
        if id_ == MASCOT:
            render_states(parts, OUT, cam)
        manifest.append({"id": id_, "name": name,
                         "glb": id_ + ".glb", "thumb": "thumbs/" + id_ + ".png"})
    # manifest data/companions.json (2 cấp trên OUT = assets/companions -> gốc trang)
    mpath = os.path.join(OUT, "..", "..", "data", "companions.json")
    os.makedirs(os.path.dirname(mpath), exist_ok=True)
    with open(mpath, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print("DONE", len(manifest), "animals ->", OUT)

if __name__ == "__main__":
    try:
        main()
    except Exception:
        traceback.print_exc()
        sys.exit(1)
