# Lumina

A makeup and retouching app that runs entirely in the phone's browser. It finds the face and body with
on-device models, turns the landmarks into soft region masks, and runs every effect as a GPU shader.
Photos never leave the phone. **[Try it live](https://danielcollison.dev/lumina/)**.

## How it works

1. **Find the face and body.** MediaPipe runs on the device in WebAssembly: 478 face landmarks with
   depth, a 33-point pose, and segmentation of the person, hair and skin.
2. **Turn landmarks into regions.** Templates drawn once on MediaPipe's canonical face mesh are warped
   onto each face through its 468 points, giving soft masks for skin, lips, eyes, irises, brows,
   creases, hollows and contour zones.
3. **Render on the GPU.** Every tool writes into four WebGL2 passes: retouch (skin, face and body), hair
   (a strand-level matte, then colour and care), composite (makeup and background), and a final pass for
   warps, crop and lens, relight, effects, colour grade and text.

Nothing is produced by a generative image model. Every template, curve, texture and colour table is
drawn or computed by Lumina's own code, and skin smoothing uses a classic bilateral filter.

## Tools

In the editor, the photo fills the screen. At the bottom, tabs
pick one of seven groups (Retouch, Face, Body, Makeup, Scene, Colour, Edit), and the row above them
shows that group's tools; a dot on a tab means one of its tools is in use.
Tapping a tool swaps that row for the tool's own options: colour swatches, icons, or thumbnails of
your own photo with each filter, look or light. Under them is a bar with ✗ (discard), the tool's
tabs and ✓ (done). Sliders and option chips float over the bottom of the photo, so the photo stays
the same size whichever tool is open. Tools with an automatic area also have a brush to add to it
or take away from it. On a computer the rows scroll sideways with the mouse wheel or by dragging
with the mouse; nothing extra is drawn for it.

| Tool | What it does |
| --- | --- |
| Auto | One tap: clears spots, brightens the whites and irises, lifts dark circles, whitens teeth, fills hollows with a little light, slims a little. It never smooths skin. |
| Smooth | Brush-only: skin is smoothed only where you paint it (Brush / Erase). Depth puts light and shadow back; Stubble keeps beard texture. "Whole face" is an opt-in fill. |
| Blemish | Tap a spot to heal it, or let Find spots do it. Find spots leaves moles and freckles alone (tap one to heal it), and its repairs only ever lighten. |
| Eraser | Paint over a stray hair, mark or small object; it is replaced with texture from around it. |
| Stamp | Clone stamp: tap the area to copy from, then paint where the copy should go. Feather softens the brush's edge. |
| Wrinkles | Forehead, crow's feet, smile lines and under-eye lines, or a brush. The shadow inside a crease is lifted toward the skin around it, so texture stays. |
| Concealer | Dark spots, light spots, eye bags and tear troughs evened by dodge and burn, Acne (Find spots), and a brush. |
| Matte | Takes shine down on the face automatically or where you paint (Erase keeps an area as it is): only bright detail standing out in three bands of detail is turned down, so pores stay. Hair oil takes greasy shine off the hair. |
| Texture | Paints fine pore grain back over skin, or over everything you smoothed. |
| Details | Sharpens face, body and background by their own amounts, or where you paint. |
| Eyes | Whites (red veins taken out, never darkened detail), Iris (brighter and crisper), Dark circles, Red-eye, Iris size; Colour changes the eyes' colour. Closed eyes are left alone. |
| Teeth | Whiten, Stains, Align (moves the teeth's edge onto a smooth curve). A brush adds teeth the automatic area missed; Erase takes gums or lips out. |
| Skin | Tone (Fair to Deep, a palette, or any colour you pick) over face and body skin; Redness; Glow Up: Tan, Sun-kissed, Glass skin. |
| Fillers | Fills hollows at the forehead, temples, cheeks and eye sockets with light, and plumps the lips. |
| Age | One Age slider from younger to older, as in Snapchat's Time Machine and Photoshop's Facial Age; Younger and Older set it to −70 and +70. Each sign of age comes in at its own point along it, in the order research describes: fine lines and shadows round the eyes first; then fading brows, duller skin, sagging, thinner and paler lips and grey hair; the nose and crepey skin last. The Look tab lists every part the slider is changing, each with its value ring, and any of them can be changed there; the Skin, Face and Hair tabs hold all 18 parts, and a change stays when the slider moves: Wrinkles, Dark circles, Eye bags, Dull skin, Blotches, Spots, Texture; Volume, Brows, Sagging, Lips, Eyes, Teeth, Proportions, Nose; Grey hair, Temples first (grey starts at the temples and front hairline), Hairline. Hair also sets the shade grey hair turns: Silver, White, Steel or Ivory. Older deepens the face's own creases and draws thin new ones, darkens the folds and hollows, fades the brows and lips (less contrast between the features and the skin looks older), yellows the teeth, lengthens the nose, lets the face sag, and turns the hair white strand by strand: white hair keeps its strands but loses most of the contrast across the head, as real white hair does, part-grey hair is a fine mix of white and dark strands along the hair, and the white takes the photo's own light. Younger lifts crease shadows, evens tone, fills hollows, lifts the face, gives it younger proportions and deepens the lips and brows. Nothing is generated and skin is never smoothed. |
| Sculpt | Face sliders in seven tabs, 50 controls. Head: size, turn, up/down. Face: width, slim, length, size, forehead, hairline, temples, cheekbones, midface, philtrum, lift, lower face, top (a higher crown). Jaw: chin, chin width, jaw angle, jawline, length, shape (the V-line). Eyes: size, height, width, distance, tilt, position, inner and outer corner, tail. Nose: size, width, length, bridge, tip, root (the top of the nose narrowed). Lips: size, width, upper, lower, position, smile, Cupid's bow. Brows: distance, lift, arch, tilt, length, thickness. Left, Right or Both sides; with several people, every face or one. Each control leaves the neighbouring features alone (the chin moves, the lips stay); turning or nodding the head carries the hair with it, and the face never folds or tears at its outline. Freeze bg keeps the background still. |
| Reshape | Push (Light or Heavy): drag to nudge a jaw, waist, arm or hair. Resize: tap or brush to enlarge or shrink. Restore: brush the original shape back. Protect: paint anything that must not move (Invert lets only the painted areas move); it holds against every warp. Freeze bg keeps the background still. |
| Body | Presets (Slender, Hourglass, Muscular, Curvy), then Slim (the whole figure), waist, hips, legs, arms, shoulders, square shoulders, belly slim (pushed back toward the spine in a side view) and belly smooth (rolls on its outline drawn in), leg ratio (longer legs and a shorter torso at the same height), neck, head size, posture and head tilt from the body's landmarks. Arms and hands keep their shape: an arm by the waist or a hand on a hip moves with the body instead of being squeezed or stretched. Head tilt turns the head and hair as one piece. Freeze bg keeps the background still. Stretch lengthens a band of the picture (Legs places it from hips to ankles); Tone defines muscles. |
| Freeze bg (Sculpt, Reshape, Body, Hair) | The subject moves and the background stays. The background behind the subject is rebuilt once (smoothly at once, then from patches of the background itself, with the photo's own fine detail), so nothing of the old outline is left behind. |
| Makeup | Parts: Lips (12 shades; matte, satin, gloss, shimmer, highlight, pearl, metallic, gradient, diamond; the lip area is fitted to the lips' own edge, and a darker lipstick underneath is lifted toward the new shade first), Eyeshadow (10, with shimmer), Eyeliner (natural, classic, wing, smoky), Lashes (natural, volume, dramatic), Brows, Blush, Contour (shading styles Natural, Soft, Defined, Chiselled and Glow, a Jawline shadow, and plain contour and highlight; a turned face gets more contour on its far side), Freckles, Eye colour. Looks in Natural, Day, Night and Festive, plus up to 10 saved looks of your own. Fine-tune: drag a part's dot to move its makeup. |
| Hair | Auto finds the hair (or paint it; what Erase takes out stays out). The edge is matted strand by strand: colour, care and grey hair change only the hair's share of each edge pixel, so nothing glows on the background or tints the forehead and ears, and no dark rim is left. Colour: 17 shades (12 natural, 5 fashion) with Amount and Depth. Each is a ramp measured from natural hair, from a deep, warm shadow to a pale highlight, laid along the hair's own light, so dyed hair keeps its strands, depth and shine. Care: Shine, Smooth (calms frizz along the strands, leaves curls alone), Texture (brings the strands out), Enrich (a thicker look: fills the parting where scalp shows, deepens the colour) and Oil control, all working with the light the hair already has rather than adding white. Shape: Volume and Hairline. Style: Glossy, Sleek, Silky, Fluffy, Defined, Rich, Soft and Bouncy, each a mix of Care and Volume. |
| Relight | Presets: Studio 1–3, Sidelight, Backlight, Flash, DeGlare, Neon, Technicolor, Custom (drag the light), and scene lights Sunlit, Beach Day, Indigo, Soft Box, Rays, Water, Peel Film. Fine-tune Brightness, Hue, Softness. Light wraps softly round the face's and body's 3D form, the background darkens or takes the light's colour, and the eyes get a catchlight. |
| Background | Blur, with round, hexagon, triangle, heart or star bokeh and a Highlights control; black and white; swap for a colour, gradient or your own photo. The cut-out follows hair strand by strand, and only the background's share of each edge pixel changes, so there is no sharp rim or halo. Adjust: Edge (shrink or grow), Soften, Shadow (left, below, right), Blend (matches the subject to the new background), Brightness. Fix edges brushes, or Tap object to keep a held thing sharp (or blur it with the background). People: add up to five people cut out of other photos, then move, resize or flip them. |
| Presets | One tap sets a filter, a little retouching and the background (Natural, Clean, Aesthetic, Stylized; 18 in all), with Look and Background sliders. None of them smooths skin. |
| Filters | 85 colour filters in twelve groups: Portrait, Light, Dreamy, Retro, Film, Cinema, Aesthetic, Warm, Cool, Mood, B&W (with sepia and selenium toning) and Colour pop. Light, Dreamy and Retro lay drawn layers over their grade: light leaks, streaks, colour washes, a lens flare, film burn, VHS tape, stars and a holographic sheen, kept off faces. The film stocks and cinema grades (Soft 400, Vivid 100, Chrome 64, Tungsten 800, Teal & orange, Bleach bypass and others) are colour tables with per-hue changes. Protect skin keeps skin close to its own colour under colour filters. Save filters you like to Saved. Effects: Glow, Soft focus, Light leak, Halation, Dust, Prism (colour fringes outside a sharp spot you drag). |
| Glitter | Brush glitter onto any area (or over the whole photo) in nine colours, including holographic, with Intensity and Flake size. Sparkle puts star glints on the photo's own highlights: Star, Six, Eight, Twinkle or Glow, with Size, Quantity, Angle and colour. |
| Adjust | Full set plus Auto. Light: Brightness, Light, Contrast, Highlights, Shadows, Ambience. Colour: Saturation, Vibrance, Temperature, Tint. Detail: Clarity, Sharpen, Denoise, Dehaze, Fade, Grain, Vignette. |
| Crop | Free or nine ratios, rotate, flip, straighten, vertical and horizontal perspective, and lens correction (barrel or pincushion). |
| Text | Nine templates, seven fonts, five styles (plain, outline, shadow, label, neon), nine colours, size, angle and letter spacing; drag to place. |

Two hold-to-compare buttons: one shows the original photo, the other shows the photo with only
the current tool's work removed. ✗ can itself be undone. Undo/redo, pinch to zoom, save at full size.

Not included: generative tools (face fixing, AI art, headshots, generated hairstyles). They need
image-generation models running on a server, so they cannot run on a phone; adding them would need
one. Where a commercial app runs a network on the phone that Lumina doesn't have (teeth alignment,
dodge-and-burn concealing, wrinkle and mole detection), Lumina has its own version, described above.
All 85 filters are Lumina's own.

## Run it

```sh
npm start          # http://localhost:5173
npm run phone      # also prints an address for a phone on the same Wi-Fi
```

No install step: the server is plain Node. To put it online, upload the `app/` folder to any
static host with HTTPS (Netlify, Cloudflare Pages, GitHub Pages, Vercel). Over plain `http://` on
a LAN, Save falls back to a download because the share sheet needs HTTPS.

## Code

| File | Job |
| --- | --- |
| `app/index.html` | Markup and styles; light and dark themes |
| `app/js/main.js` | Edit state, undo history, the tool row and each tool's options, brushes and drags, compare, thumbnails, loading and saving |
| `app/js/icons.js` | The line icons |
| `app/js/gl.js` | WebGL2 renderer: retouch pass (skin, face and body), the hair's matte and hair pass (grey hair, care and colour on the hair's share), composite pass (makeup, background), added people, and the final pass (warp, crop and lens, relight, effects, grade, text) |
| `app/js/face.js` | MediaPipe loading (face, pose, selfie and multi-class segmentation), landmark geometry, region masks, skin-colour model |
| `app/js/facemaps.js` | Region templates drawn in the canonical face mesh's texture space, and the per-face mesh that warps them |
| `app/js/facemesh-data.js` | The canonical mesh's texture coordinates and triangles, read out of the face model by `tools/canon-mesh.py` |
| `app/js/makeup.js` | Makeup masks: eyeshadow, eyeliner, lashes, freckles, contour, highlight |
| `app/js/relight.js` | Relight presets and the normal map |
| `app/js/layers.js` | Painted masks replayed from the edit state, made only when first used |
| `app/js/blur.js` | Box blur and guided filters (grey for the hair-and-skin masks, colour for fitting the cut-out to the photo), and the hair matte's helpers: minimum and maximum filters, and colours spread from the areas surely hair and surely not |
| `app/js/inpaint.js` | Background Freeze's plate: a smooth push-pull fill and a patch fill (PatchMatch) of the background behind the subject, and its full-size detail |
| `app/js/heal.js` | Blemish and Eraser healing, automatic spot finding (moles and freckles left alone), the clone stamp with Feather |
| `app/js/sculpt.js` | Sculpt's 48 controls: where each acts on the canonical face, what it protects, which way it moves, the guard that keeps the mesh from folding, and the rasteriser (nearest triangle first) that turns the moved mesh into warp offsets |
| `app/js/warp.js` | The displacement grid: Sculpt, lips, teeth align, hair volume, body shaping (arm and hand protection, the head's tilt, Slim, Tummy), Reshape's Push, Resize and Restore strokes, and Protect's mask |
| `app/js/luts.js` | Colour tables for the film, cinema and aesthetic filters, computed from recipes |
| `app/js/geometry.js` | Crop, rotate, flip, straighten, perspective, lens and Stretch, for the shader and for touches |
| `app/js/text.js` | Text fonts, styles, letter spacing, drawing and hit-testing |
| `app/js/gestures.js` | Pinch zoom, pan, brush strokes and taps |
| `app/js/looks.js` | Filters, makeup palettes and looks, hair and skin colours, hair styles, contour styles, glitter and sparkle, bokeh shapes |
| `app/js/save.js` | Export through the Claude `downloads` capability, the share sheet or a download |
| `app/assets/` | Sample photo plus its cached landmarks and person mask, so the sample opens without the 13 MB model |
| `app/vendor/mediapipe/` | Self-hosted MediaPipe runtime and models (Apache 2.0) |
| `tools/` | `make-artifact.mjs` (the artifact build) and `canon-mesh.py` (the face mesh data) |
| `server.mjs` | Static server for local and phone testing |

The sample opens with cached face data. Opening your own photo downloads the face model once
(about 13 MB, then cached by the browser). Body downloads a 6 MB pose model the first time it is
used, and Hair (Auto, Care, Shape, Style), Matte's Hair oil, Skin, Body › Tone, Background and Freeze bg
a 16 MB hair-and-skin model (both work with the small selfie model's cut-out until it arrives).
Freeze bg rebuilds the background behind the subject in the background: a smooth fill at once, the
patch fill a second or two later. If
WebAssembly is blocked, the face tools switch off with a message and Smooth, Blemish, Eraser,
Stamp, Texture, Filters, Adjust, Crop and Text keep working.

## Credits

- MediaPipe Tasks Vision 0.10.21; Face Landmarker, Selfie Segmenter, Pose Landmarker (lite) and
  Selfie Multiclass Segmenter models: Google, Apache License 2.0.
- Sample photo: Joshua McKnight, via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Smiling_woman_pink_shirt_(cropped).jpg), CC0.
- Fonts from Google Fonts under the SIL Open Font License: Bodoni Moda (the wordmark and a text
  font), Playfair Display, Pacifico and Bebas Neue (text fonts). The rest uses the phone's own
  system font.
