import * as T from 'three';
import {SVGLoader} from 'three/addons/loaders/SVGLoader.js';
export function parseBaseSVG(svg:string):T.Vector2[]{
  if(svg.length>512000)throw Error('La base SVG debe pesar menos de 500 KB.');
  const doc=new DOMParser().parseFromString(svg,'image/svg+xml');
  if(doc.querySelector('parsererror,image,text,filter,mask,clipPath,use,script,foreignObject'))throw Error('Usá una silueta vectorial simple, sin máscaras ni imágenes.');
  const paths=new SVGLoader().parse(svg).paths;
  if(paths.reduce((n,p)=>n+p.subPaths.reduce((a,s)=>a+s.curves.length,0),0)>2000)throw Error('Simplificá los trazados de la base.');
  const outlines=paths.flatMap(p=>p.subPaths.filter(s=>s.autoClose||s.getPoint(0).distanceTo(s.getPoint(1))<.01).map(s=>s.getPoints(24))).filter(p=>p.length>=3);
  outlines.sort((a,b)=>Math.abs(T.ShapeUtils.area(b))-Math.abs(T.ShapeUtils.area(a)));
  const outline=outlines[0];if(!outline||Math.abs(T.ShapeUtils.area(outline))<.01)throw Error('No encontramos un contorno cerrado. Cerrá la silueta antes de exportar el SVG.');
  const bounds=new T.Box2().setFromPoints(outline),size=bounds.getSize(new T.Vector2()),center=bounds.getCenter(new T.Vector2());
  const scale=4/Math.max(size.x,size.y);return outline.map(p=>new T.Vector2((p.x-center.x)*scale,-(p.y-center.y)*scale));
}
