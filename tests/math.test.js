import test from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
import { sample, recurrence } from '../src/domain.js';
import { lessons } from '../src/lessons.js';

const close = (a,b) => assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)), `${a} != ${b}`);
const sum = (id,z) => Array.from({length:120},(_,k)=>sample(id,k)*z**(-k)).reduce((a,b)=>a+b,0);
test('1a: suma directa coincide con 3z/(3z−1) dentro de la ROC',()=>{
  for(const z of [-2,1,2,4])close(sum('1a',z),3*z/(3*z-1));
});
test('1f: suma del seno coincide con la fórmula racional',()=>{
  for(const z of [-3,-2,2,3])close(sum('1f',z),z/(2*(z*z-Math.sqrt(3)*z+1)));
  for(let k=0;k<36;k++)close(sample('1f',k),sample('1f',k+12));
});
test('3d: inversa incluye únicamente los dos impulsos correctos',()=>{
  const expected=[1,-1/3,10/9,26/27,1/81,-1/243];
  expected.forEach((v,k)=>close(sample('3d',k),v));
  for(const z of [-2,1,2,4])close(sum('3d',z),(1+z)/z**3+3*z/(3*z+1));
});
test('4d: fórmula cerrada coincide con recurrencia independiente y datos iniciales',()=>{
  recurrence(25).forEach((v,k)=>assert.equal(sample('4d',k),v));
  assert.deepEqual(recurrence(8),[0,-1,2,-7,20,-61,182,-547]);
  for(let k=0;k<20;k++)assert.equal(sample('4d',k+3)+sample('4d',k+2)-5*sample('4d',k+1)+3*sample('4d',k),0);
});
test('4d: suma de la solución recupera Y(z) y sus fracciones parciales',()=>{
  for(const z of [-6,-5,5,6]){
    const original=(-z*z+z)/(z**3+z*z-5*z+3);
    close(sum('4d',z),original);
    close(original,-z/(4*(z-1))+z/(4*(z+3)));
  }
});
test('Todas las fórmulas de los 47 pasos, enunciados y resultados se renderizan con KaTeX',()=>{
  for(const l of lessons){
    for(const eq of [l.problem,l.initial,l.result,l.caseEq,...(l.resultForms??[]).map(form=>form.eq),...l.steps.map(s=>s.eq)].filter(Boolean)){
      assert.doesNotThrow(()=>katex.renderToString(eq,{throwOnError:true,strict:'ignore'}));
    }
  }
  assert.deepEqual(lessons.map(l=>l.id),['1a','1f','3d','4d']);
  assert.equal(lessons.find(l=>l.id==='3d').steps.length,5);
  assert.equal(lessons.reduce((n,l)=>n+l.steps.length,0),47);
});
