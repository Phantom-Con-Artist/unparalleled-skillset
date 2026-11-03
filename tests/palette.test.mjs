import test from 'node:test';
import assert from 'node:assert/strict';

for (const skill of ['unparalleled-ui', 'unparalleled-website']) {
  const { scorePalette } = await import(`../.agents/skills/${skill}/scripts/score-palette.mjs`);
  const input = () => ({ colors: [{name:'Ink',hex:'#000',weight:.5},{name:'Paper',hex:'#fff',weight:.5}], pairs:[{name:'Body',fg:'#000',bg:'#fff',req:4.5}], targets:{luminanceRange:[1,1], saturationMean:[0,0], hueDiversity:[0,1], hueSeparation:[0,180]} });
  test(`${skill}: palette diagnostics calculate known extremes without inventing achromatic hues`, () => {
    const r = scorePalette(input());
    assert.equal(r.metrics.luminanceRange.value, 1);
    assert.equal(r.metrics.saturationMean.value, 0);
    assert.equal(r.metrics.hueDiversity.value, null);
    assert.equal(r.metrics.hueSeparation.value, null);
    assert.equal(r.fitScore, 100);
    assert.equal(r.pairs[0].ratio, 21);
    assert.equal(r.contrastPass, true);
  });
  test(`${skill}: complementary hue measurements are distinct from hard contrast acceptance`, () => {
    const i = input();
    i.colors = [{name:'Red',hex:'#f00',weight:.5},{name:'Cyan',hex:'#0ff',weight:.5}];
    i.pairs[0] = {name:'Unreadable label', fg:'#fff', bg:'#fff', req:4.5};
    const r = scorePalette(i);
    assert.equal(r.metrics.hueSeparation.value, 180);
    assert.ok(Math.abs(r.metrics.hueDiversity.value - 1) < 1e-10);
    assert.equal(r.metrics.saturationMean.value, 1);
    assert.equal(r.contrastPass, false);
    const mono = input(); mono.colors = [{name:'Red',hex:'#f00',weight:.5},{name:'Dark red',hex:'#800000',weight:.5}];
    assert.equal(scorePalette(mono).metrics.hueSeparation.value, 0);
    assert.ok(scorePalette(mono).metrics.hueDiversity.value < 1e-10);
  });
  test(`${skill}: palette checker rejects invalid inputs and excludes zero-area colors`, () => {
    for (const change of [i => {i.colors[0].weight=-1;}, i => {i.colors[0].hex='red';}, i => {i.colors[0].weight=NaN;}, i => {i.colors[0].name=i.colors[1].name;}, i => {i.pairs=[];}, i => {i.targets.hueSeparation=[180,0];}, i => {delete i.targets;}]) {
      const i=input(); change(i); assert.throws(() => scorePalette(i));
    }
    const i=input(); i.colors.push({name:'Unused red',hex:'#f00',weight:0});
    assert.equal(scorePalette(i).metrics.hueDiversity.value, null);
    i.targets.luminanceRange=[0,.5];
    assert.equal(scorePalette(i).metrics.luminanceRange.score, 50);
  });
}
