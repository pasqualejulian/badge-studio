import * as T from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import type { Surface } from './surfaces';
export interface ReliefLayer { id:string; name:string; color:string; metallic:boolean; height:number; surface:Surface; textureStrength:number; roughness:number }
export interface ReliefPart { geometry:T.BufferGeometry; layer:string; order:number }
export function parseRelief(svg:string):{parts:ReliefPart[];layers:ReliefLayer[]} {
  if(svg.length>512_000)throw Error('Para relieve, usá un SVG de menos de 500 KB.');
  const doc=new DOMParser().parseFromString(svg,'image/svg+xml');
  if(doc.querySelector('parsererror'))throw Error('El SVG no es válido.');
  if(doc.querySelector('image,text,filter,mask,clipPath,use,linearGradient,radialGradient,pattern,script,foreignObject'))throw Error('Este SVG usa imágenes, texto o efectos no compatibles con relieve. Convertí textos y efectos a trazados.');
  const parsed=new SVGLoader().parse(svg);if(parsed.paths.length>160)throw Error('Usá un SVG de hasta 160 trazados para esta prueba.');
  if(parsed.paths.reduce((sum,p)=>sum+p.subPaths.reduce((n,s)=>n+s.curves.length,0),0)>4000)throw Error('El SVG tiene demasiados segmentos. Simplificá sus trazados.');
  const parts:ReliefPart[]=[],layers:ReliefLayer[]=[];const bounds=new T.Box3();
  const layer=(name:string,color:string)=>{const id=name+' '+color;if(!layers.some(l=>l.id===id))layers.push({id,name,color,height:1,surface:'grain',textureStrength:.35,roughness:.3,metallic:!['#182a4e','#142c59'].includes(color.toLowerCase())});return id;};
  for(const [i,path] of parsed.paths.entries()){
    const style=path.userData?.style as Parameters<typeof SVGLoader.pointsToStroke>[1] & {fill?:string;stroke?:string};const node=path.userData?.node as Element;const label=node?.getAttribute('data-layer')||node?.parentElement?.getAttribute('id');
    if(style?.fill && style.fill!=='none')for(const shape of path.toShapes()){
      const g=new T.ExtrudeGeometry(shape,{depth:1,bevelEnabled:false,curveSegments:12});parts.push({geometry:g,layer:layer(label||'Formas',style.fill),order:i*2});
    }
    if(style?.stroke && style.stroke!=='none' && Number(style.strokeWidth)>0)for(const sub of path.subPaths){
      const flat=SVGLoader.pointsToStroke(sub.getPoints(20),style);if(flat){const g=extrudeStroke(flat);flat.dispose();parts.push({geometry:g,layer:layer(label==='Cornetas'?'Contornos':label||'Trazos',style.stroke),order:i*2+1});}
    }
  }
  if(!parts.length)throw Error('No encontramos formas o trazos visibles.');
  for(const p of parts){p.geometry.computeBoundingBox();bounds.union(p.geometry.boundingBox!);}
  const center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3()),factor=2.5/Math.max(size.x,size.y);
  if(!Number.isFinite(factor)||factor<=0)throw Error('El SVG no tiene un área utilizable.');
  for(const p of parts){const pos=p.geometry.getAttribute('position');for(let i=0;i<pos.count;i++)pos.setXYZ(i,(pos.getX(i)-center.x)*factor,-(pos.getY(i)-center.y)*factor,pos.getZ(i));
    // Reflection changes winding: reverse triangle indices so front faces remain visible.
    if(p.geometry.index){const idx=p.geometry.index;for(let i=0;i<idx.count;i+=3){const a=idx.getX(i);idx.setX(i,idx.getX(i+2));idx.setX(i+2,a);}}
    else{for(const attribute of Object.values(p.geometry.attributes)){for(let i=0;i<attribute.count;i+=3){for(let k=0;k<attribute.itemSize;k++){const a=attribute.array[i*attribute.itemSize+k];attribute.array[i*attribute.itemSize+k]=attribute.array[(i+2)*attribute.itemSize+k];attribute.array[(i+2)*attribute.itemSize+k]=a;}}}}
    p.geometry.computeVertexNormals();}
  return {parts,layers};
}
function extrudeStroke(flat:T.BufferGeometry){
  const p=flat.getAttribute('position');const indices=flat.index;const count=indices?.count||p.count;const out:number[]=[];const edges=new Map<string,{a:number[];b:number[];count:number}>();
  const key=(v:number[])=>v.slice(0,2).map(n=>n.toFixed(4)).join(',');
  for(let i=0;i<count;i+=3){let tri=[0,1,2].map(k=>{const j=indices?indices.getX(i+k):i+k;return [p.getX(j),p.getY(j),0];});
    if((tri[1][0]-tri[0][0])*(tri[2][1]-tri[0][1])-(tri[1][1]-tri[0][1])*(tri[2][0]-tri[0][0])<0)tri=[tri[2],tri[1],tri[0]];
    for(const v of tri)out.push(v[0],v[1],1);for(const v of [...tri].reverse())out.push(...v);
    for(let j=0;j<3;j++){const a=tri[j],b=tri[(j+1)%3],id=[key(a),key(b)].sort().join('|');const e=edges.get(id);if(e)e.count++;else edges.set(id,{a,b,count:1});}
  }
  for(const {a,b,count} of edges.values())if(count===1)out.push(...a,...b,b[0],b[1],1,...a,b[0],b[1],1,a[0],a[1],1);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(out,3));g.computeVertexNormals();return g;
}
// Subdivide before bending: long cap triangles would otherwise stay visually flat.
export function bendGeometry(source:T.BufferGeometry,curve:number):T.BufferGeometry {
  if(!curve)return source;
  const g=source.index?source.toNonIndexed():source;const pos=g.getAttribute('position'),normal=g.getAttribute('normal'),uv=g.getAttribute('uv');const out:number[]=[],normals:number[]=[],uvs:number[]=[];
  type V=number[];const mid=(a:V,b:V)=>a.map((v,i)=>(v+b[i])/2);const dist=(a:V,b:V)=>(a[0]-b[0])**2+(a[1]-b[1])**2;
  const emit=(a:V,b:V,c:V,depth:number)=>{const ds=[dist(a,b),dist(b,c),dist(c,a)],max=Math.max(...ds);if(max>.045 && depth<11){const k=ds.indexOf(max);if(k===0){const m=mid(a,b);emit(a,m,c,depth+1);emit(m,b,c,depth+1);}else if(k===1){const m=mid(b,c);emit(a,b,m,depth+1);emit(a,m,c,depth+1);}else{const m=mid(c,a);emit(a,b,m,depth+1);emit(m,b,c,depth+1);}return;}
    for(const v of [a,b,c]){const [x,y,z,nx,ny,nz,u,w]=v;out.push(x,y,z+curve*(1-x*x/3.0625-y*y/4));const n=new T.Vector3(nx+2*curve*x/3.0625*nz,ny+curve*y/2*nz,nz).normalize();normals.push(n.x,n.y,n.z);uvs.push(u,w);}};
  for(let i=0;i<pos.count;i+=3){const vs=[0,1,2].map(k=>[pos.getX(i+k),pos.getY(i+k),pos.getZ(i+k),normal?.getX(i+k)||0,normal?.getY(i+k)||0,normal?.getZ(i+k)||0,uv?.getX(i+k)||0,uv?.getY(i+k)||0]);emit(vs[0],vs[1],vs[2],0);}
  const result=new T.BufferGeometry();result.setAttribute('position',new T.Float32BufferAttribute(out,3));result.setAttribute('normal',new T.Float32BufferAttribute(normals,3));result.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));if(g!==source)g.dispose();source.dispose();return result;
}
