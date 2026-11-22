"""Reads MediaPipe's canonical face mesh (Apache-2.0) out of face_landmarker.task and writes it as
a JS module for the region templates: texture coordinates for the 468 mesh points and the
triangle list. Usage: python -I tools/canon-mesh.py app/vendor/mediapipe/face_landmarker.task app/js/facemesh-data.js"""
import struct, sys, zipfile

task, out = sys.argv[1], sys.argv[2]
blob = zipfile.ZipFile(task).read('geometry_pipeline_metadata_landmarks.binarypb')


def varint(b, i):
    v = s = 0
    while True:
        c = b[i]
        i += 1
        v |= (c & 0x7F) << s
        s += 7
        if c < 0x80:
            return v, i


def fields(b):
    i = 0
    while i < len(b):
        key, i = varint(b, i)
        num, wt = key >> 3, key & 7
        if wt == 0:
            v, i = varint(b, i)
        elif wt == 1:
            v, i = b[i:i + 8], i + 8
        elif wt == 2:
            n, i = varint(b, i)
            v, i = b[i:i + n], i + n
        elif wt == 5:
            v, i = b[i:i + 4], i + 4
        else:
            raise ValueError(f'wire type {wt}')
        yield num, wt, v


mesh = next(v for num, wt, v in fields(blob) if num == 1)
vb, ib = [], []
for num, wt, v in fields(mesh):
    if num == 3:
        vb += struct.unpack(f'<{len(v) // 4}f', v) if wt == 2 else [struct.unpack('<f', v)[0]]
    elif num == 4:
        if wt == 2:
            j = 0
            while j < len(v):
                x, j = varint(v, j)
                ib.append(x)
        else:
            ib.append(v)
n = len(vb) // 5          # vertex layout: x, y, z, u, v
assert n == 468 and len(ib) % 3 == 0 and max(ib) < n, (n, len(ib))
uv = [(vb[k * 5 + 3], vb[k * 5 + 4]) for k in range(n)]
us, vs = [p[0] for p in uv], [p[1] for p in uv]
print('triangles', len(ib) // 3, 'u', min(us), max(us), 'v', min(vs), max(vs))
fmt = lambda x: f'{x:.4f}'.rstrip('0').rstrip('.') or '0'
with open(out, 'w', encoding='utf-8', newline='\n') as f:
    f.write('// MediaPipe canonical face mesh (Apache-2.0, see vendor/mediapipe/LICENSE.txt), read out of\n')
    f.write('// face_landmarker.task by tools/canon-mesh.py. UV: texture coordinates of the 468 mesh points\n')
    f.write('// (u to the image right on a frontal face, v down); TRIANGLES: index triples.\n')
    f.write('export const UV = new Float32Array([')
    f.write(','.join(fmt(c) for p in uv for c in p))
    f.write(']);\n')
    f.write('export const TRIANGLES = new Uint16Array([')
    f.write(','.join(str(x) for x in ib))
    f.write(']);\n')
print('wrote', out)
