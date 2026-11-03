"""Project-authored semantic descriptors; these are hypotheses, not human ratings."""
import json
from pathlib import Path

# term | aliases | descriptive training-language proxy | limitation when relevant
rows = '''cyberpunk|cyber punk,blade runner|dark neon purple blue electric city|Also depends on lighting, typography and imagery.
neon|fluorescent,glowing|bright electric pink green yellow|Emission and glow require rendering beyond flat sRGB.
calm|peaceful,tranquil,serene|soft quiet blue green pale|
bold|striking,punchy|strong bright red black|
minimalism|minimal,minimalist,clean|simple white grey black|Layout, spacing and restraint determine minimalism.
maximalism|maximal,maximalist,eclectic|colorful bright purple orange pink|Density, pattern and composition determine maximalism.
modern|contemporary|clean grey blue white|
vintage|retro,old fashioned|old faded brown cream orange|Era and material context matter.
pastel|pastels,sugary|pale soft pink blue yellow|
muted|desaturated,subdued|soft grey faded|
vibrant|vivid,saturated|bright colorful strong|
dark|night,inky|dark black blue|
light|airy,luminous|light white pale|
warm|warmth|warm red orange yellow|
cool|cold,icy|cool blue green purple|
earthy|earth tones,grounded|earth brown green sand|
organic|natural,nature inspired|natural green brown cream|
luxury|luxurious,premium,opulent|rich black gold cream|Color alone cannot establish luxury.
elegant|refined,sophisticated|soft black cream grey|
playful|fun,whimsical|happy colorful pink yellow|
professional|corporate,business|blue grey white|Industry and cultural expectations vary.
editorial|magazine|white black red|Typography and hierarchy are central.
industrial|factory,utilitarian|grey black orange|Material and structural context matter.
brutalist|brutalism,raw|black white red|Architecture and typography dominate the aesthetic.
soft|gentle,delicate|soft pale pink cream|
romantic|romance,lovely|pink rose red cream|
mysterious|enigmatic|dark purple blue black|
energetic|dynamic,lively|bright orange yellow red|
cheerful|happy,joyful|yellow orange pink bright|
melancholic|melancholy,sad|grey blue dark|
nostalgic|nostalgia|old faded warm brown|
futuristic|future,sci fi,science fiction|electric blue purple silver|Shape and interaction also convey this term.
technical|tech,technological|blue grey black|
trustworthy|trust,reliable|blue green white|Associations vary by culture and context.
cozy|cosy,comfortable|warm brown orange cream|
fresh|crisp,refreshing|green light blue white|
clean|pure,pristine|white light blue|
minimal monochrome|black and white,monochrome|black white grey|
monochromatic|single hue|blue pale dark|A compositional color constraint; not a learned guarantee.
neutral|neutrals,understated|grey cream brown white|
cinematic|film,filmic|dark orange blue|Lighting and grading shape cinematic appearance.
noir|film noir|black grey white|Lighting and composition remain necessary.
vaporwave|vapor wave|pink purple blue pastel|Era-specific imagery and typography matter.
synthwave|synth wave,outrun|neon purple pink blue dark|Distinct from a validated style classifier.
retrofuturism|retro futuristic|orange cream blue purple|
space|cosmic,galactic|dark blue purple black|
oceanic|ocean,marine|blue turquoise green|
coastal|seaside,beach|sand blue cream|
tropical|island,exotic|green orange pink yellow|
forest|woodland,woodsy|green brown dark|
botanical|garden,leafy|green pink cream|
desert|arid,sandy|sand brown orange|
autumn|fall,autumnal|orange brown red yellow|
spring|springtime|light green pink yellow|
summer|summery|bright yellow blue orange|
winter|wintry,snowy|white blue grey|
sunset|dusk|orange pink purple|
sunrise|dawn|pale orange pink blue|
midnight|after dark|dark blue black purple|
underwater|deep sea|dark blue green|
art deco|deco|gold black green|Geometric ornament is essential.
art nouveau|nouveau|green cream gold|Organic linework is essential.
bauhaus|primary modernism|red yellow blue white|Geometry and structure are essential.
memphis|memphis design|pink yellow blue black|Pattern and geometry are essential.
scandinavian|scandi,nordic|white grey cream green|Materials and spacing are essential.
japandi|japanese scandinavian|cream brown grey green|Materials and spatial composition are essential.
wabi sabi|wabi-sabi|brown grey cream|Material aging and imperfection cannot be inferred from colors.
zen|meditative,mindful|soft green grey cream|
bohemian|boho|brown orange pink green|Textiles and pattern matter.
rustic|country,farmhouse|brown cream green|
heritage|traditional,classic|brown navy cream red|
academic|scholarly,dark academia|dark brown cream green|A palette is only part of this aesthetic.
light academia|scholastic light|cream beige brown|
preppy|collegiate|navy pink green white|
nautical|sailor|navy white red|
western|cowboy|brown orange cream|
gothic|goth,macabre|black purple red|Architecture and imagery matter.
punk|rebellious,grunge|black red pink|Texture and typography matter.
metallic|metal,chrome|silver grey gold|Reflectance requires material rendering.
iridescent|holographic,pearlescent|pink purple blue green|Angle-dependent appearance cannot be encoded by a static palette.
glass|glassmorphism,frosted|pale blue grey white|Transparency and backdrop require composited contrast checks.
flat|flat design|blue red yellow|A rendering and composition style.
material|material design|blue green white|Component and interaction rules are outside color-only validation.
accessible|high contrast,readable|black white blue|Numerical accessibility must be checked against actual usages.
low contrast|subtle contrast|soft grey cream|Text still requires compliant contrast.
complementary|opposites|orange blue|Explicit harmony geometry requires separate mathematical analysis.
analogous|neighboring hues|blue green turquoise|Explicit harmony geometry requires separate mathematical analysis.
triadic|three hue|red blue yellow|Explicit harmony geometry requires separate mathematical analysis.
tertiary|complex hues|purple teal orange|
berry|berries|purple red pink|
citrus|zesty|yellow orange green|
jewel|jewel tones|rich purple green blue|
powder|powdery|pale pink blue grey|
clay|terracotta|brown orange red|
sage|herbal|soft green grey|
rose|rosy|pink red cream|
lavender|lilac|pale purple pink|
peach|apricot|pale orange pink|
mint|minty|light green blue|
navy|maritime blue|dark blue white|
sepia|antique brown|brown cream faded|
sepulchral|somber,sombre|dark grey purple|
candy|bubblegum|pink bright yellow purple|
toylike|toy like|red blue yellow bright|
wellness|spa,restorative|soft green cream blue|
medical|clinical,healthcare|white blue green|Context and usability require independent review.
financial|banking,fintech|navy green grey|No universal industry palette exists.
food|appetizing,culinary|red orange brown|Food associations depend on product and culture.
festive|celebratory,party|red yellow green bright|Holiday meanings vary by culture.
ceremonial|formal|black cream gold|Cultural context is required.
luminous pastel|ethereal,dreamy|light pink purple blue|
quiet luxury|stealth wealth|cream brown grey|Materials, craft and composition are central.
solarpunk|solar punk|green yellow cream|Ecological themes and architecture matter.
biopunk|bio punk|green black purple|A speculative project-authored proxy.
steampunk|steam punk|brown gold black|Material and machinery motifs are central.
cottagecore|cottage core|green cream pink brown|Narrative and material context matter.
fairycore|fairy core|pale green pink purple|Narrative and imagery matter.'''
terms = []
for line in rows.splitlines():
    term, aliases, proxy, limitation = line.split('|')
    terms.append({'term': term, 'aliases': aliases.split(','), 'descriptor': proxy,
                  'definition': f'Palette interpretation: {proxy}.', 'limitation': limitation or 'Color associations are contextual and culturally variable.',
                  'evidence': 'project_authored_descriptor_proxy', 'human_validated': False})
path = Path(__file__).resolve().parents[1] / 'color_engine/resources/semantic_vocabulary.json'
path.write_text(json.dumps({'version': '1.0-alpha', 'policy': 'Descriptors are explicit hypotheses; no human validation is implied.', 'terms': terms}, indent=2) + '\n')
print(f'{len(terms)} canonical terms; {sum(len(t["aliases"]) for t in terms)} aliases')
