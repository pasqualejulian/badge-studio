import * as T from 'three';
import {bendGeometry} from './relief.ts';
import type {EngravingSettings} from './engraving-settings';
export function engravingGeometry(points:T.Vector2[],curvature:number){const g=new T.ShapeGeometry(new T.Shape(points),32),p=g.getAttribute('position'),uv=g.getAttribute('uv');const bounds=new T.Box2().setFromPoints(points),size=bounds.getSize(new T.Vector2());for(let i=0;i<p.count;i++){uv.setXY(i,(bounds.max.x-p.getX(i))/size.x,(p.getY(i)-bounds.min.y)/size.y);p.setZ(i,-.0145);}const index=g.index!;for(let i=0;i<index.count;i+=3){const b=index.getX(i+1);index.setX(i+1,index.getX(i+2));index.setX(i+2,b);}g.computeVertexNormals();return bendGeometry(g,curvature);}
export class Engraving{
 private canvas=document.createElement('canvas');private normals=document.createElement('canvas');
 private color=new T.CanvasTexture(this.canvas);private normal=new T.CanvasTexture(this.normals);
 material=new T.MeshStandardMaterial({transparent:true,depthWrite:false,side:T.FrontSide,metalness:.65,roughness:.48,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 private key='';
 constructor(){this.canvas.width=this.canvas.height=this.normals.width=this.normals.height=1024;this.color.colorSpace=T.SRGBColorSpace;this.material.map=this.color;this.material.normalMap=this.normal;}
 paint(s:EngravingSettings){const key=JSON.stringify(s);if(key===this.key)return;this.key=key;const ctx=this.canvas.getContext('2d')!;ctx.clearRect(0,0,1024,1024);ctx.save();ctx.translate(512+s.x*10.24,512+s.y*10.24);ctx.rotate(s.rotation*Math.PI/180);ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`600 ${s.size}px ${s.font==='serif'?'Georgia, serif':s.font==='mono'?'monospace':'sans-serif'}`;const lines=s.text.split('\n');ctx.fillStyle='#ffffff';lines.forEach((line,i)=>ctx.fillText(line,0,(i-(lines.length-1)/2)*s.size*1.3));ctx.restore();const mask=ctx.getImageData(0,0,1024,1024);const out=ctx.createImageData(1024,1024),normal=ctx.createImageData(1024,1024);const a=(x:number,y:number)=>mask.data[(Math.max(0,Math.min(1023,y))*1024+Math.max(0,Math.min(1023,x)))*4+3]/255;
 for(let y=0;y<1024;y++)for(let x=0;x<1024;x++){const i=(y*1024+x)*4,m=a(x,y),dx=a(x+1,y)-a(x-1,y),dy=a(x,y+1)-a(x,y-1),edge=Math.max(Math.abs(dx),Math.abs(dy));const shade=Math.max(15,Math.min(240,55+(dx-dy)*140));out.data[i]=out.data[i+1]=out.data[i+2]=shade;out.data[i+3]=Math.round(Math.max(m*.62,edge*.85)*s.strength*255);const length=Math.hypot(dx*2,dy*2,1);normal.data[i]=(dx/length+.5)*255;normal.data[i+1]=(-dy/length+.5)*255;normal.data[i+2]=(.5/length+.5)*255;normal.data[i+3]=255;}
 ctx.putImageData(out,0,0);this.normals.getContext('2d')!.putImageData(normal,0,0);this.material.normalScale.setScalar(s.strength);this.color.needsUpdate=this.normal.needsUpdate=true;}
 dispose(){this.color.dispose();this.normal.dispose();this.material.dispose();}
}
