import math, json
from pathlib import Path
# Standalone transcription of equations 3-11. No engine code is imported.
cases=[]
for name, first, second in [
    ('same_neutral', (50,0,0,0,0),(50,0,0,0,0)),
    ('chroma_difference', (50,40,0,40,0),(50,10,0,10,0)),
    ('yellow_lightness', (30,0,40,40,90),(80,0,40,40,90)),
    ('blue_complement', (60,0,-30,30,270),(40,0,30,30,90)),
]:
    L1,a1,b1,C1,h1=first; L2,a2,b2,C2,h2=second
    delta=math.sqrt(max(0,(a1-a2)**2+(b1-b2)**2-(C1-C2)**2)+((C1-C2)/1.46)**2)
    hc=.04+.53*math.tanh(.8-.045*delta)
    hl=.28+.54*math.tanh(-3.88+.029*(L1+L2))+.14+.15*math.tanh(-2+.2*abs(L1-L2))
    terms=[]
    for L,C,h in [(L1,C1,h1),(L2,C2,h2)]:
        hs=-.08-.14*math.sin(math.radians(h+50))-.07*math.sin(math.radians(2*h+90))
        z=(90-h)/10
        ey=((.22*L-12.8)/10)*math.exp(z-math.exp(z))
        terms.append((.5+.5*math.tanh(-2+.5*C))*(hs+ey))
    hh=sum(terms)
    cases.append({'name':name,'first':first,'second':second,'expected':{k:round(v,6) for k,v in [('CH',hc+hl+hh),('H_C',hc),('H_L',hl),('H_H',hh)]}})
Path('tests/fixtures/ou_luo_2006.json').write_text(json.dumps({'source':'https://doi.org/10.1002/col.20208','equations':'3-11','note':'Formula conformance fixtures, not human preference ratings. Standalone derivation saved with review evidence.','cases':cases},indent=2)+'\n')
