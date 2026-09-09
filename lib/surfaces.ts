import * as T from 'three';
export type Surface = 'smooth'|'grain'|'brushed'|'hammered'|'worn';
export const surfaceNames:Record<Surface,string>={smooth:'Liso',grain:'Grano fino',brushed:'Cepillado',hammered:'Martillado',worn:'Desgastado'};
const fract=(x:number)=>x-Math.floor(x);
const hash=(x:number,y:number)=>fract(Math.sin(x*127.1+y*311.7+18.23)*43758.5453);
function noise(x:number,y:number){const i=Math.floor(x),j=Math.floor(y);let a=x-i,b=y-j;a=a*a*(3-2*a);b=b*b*(3-2*b);return (hash(i,j)*(1-a)+hash(i+1,j)*a)*(1-b)+(hash(i,j+1)*(1-a)+hash(i+1,j+1)*a)*b;}
export function surfacePixels(kind:Surface,size=256){
  const heights=new Float32Array(size*size),normal=new Uint8Array(size*size*4),rough=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    let h=.5;
    if(kind==='grain')h=.5+(hash(x,y)-.5)*.35+(noise(x/5,y/5)-.5)*.16;
    if(kind==='brushed')h=.5+Math.sin(y*2.8+noise(x/35,y/20))*.13+(noise(x/30,y*1.6)-.5)*.3;
    if(kind==='hammered')h=noise(x/12,y/12)*.65+noise(x/4,y/4)*.12;
    if(kind==='worn')h=.5+(noise(x/15,y/15)-.5)*.5+(hash(x,y)-.5)*.16-(hash(Math.floor((x+y*.3)/2),0)>.985?.22:0);
    heights[y*size+x]=h;
  }
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const index=y*size+x,i=index*4;
    const dx=(heights[y*size+Math.min(size-1,x+1)]-heights[y*size+Math.max(0,x-1)])*3;
    const dy=(heights[Math.min(size-1,y+1)*size+x]-heights[Math.max(0,y-1)*size+x])*3;
    const len=Math.sqrt(dx*dx+dy*dy+1);normal.set([Math.round((-.5*dx/len+.5)*255),Math.round((-.5*dy/len+.5)*255),Math.round((.5/len+.5)*255),255],i);
    const r=kind==='smooth'?255:Math.round(130+heights[index]*125);rough.set([r,r,r,255],i);
  }
  return {normal,rough};
}
export class SurfaceLibrary {
  private cache=new Map<Surface,{normal:T.Texture;rough:T.Texture}>();
  constructor(private createTexture:(pixels:Uint8Array)=>T.Texture=(pixels)=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d')!;const data=ctx.createImageData(256,256);data.data.set(pixels);ctx.putImageData(data,0,0);return new T.CanvasTexture(canvas);}){}
  apply(material:T.MeshStandardMaterial,kind:Surface,strength:number){
    if(kind==='smooth'||strength===0){if(material.normalMap||material.roughnessMap){material.normalMap=null;material.roughnessMap=null;material.needsUpdate=true;}return;}
    let maps=this.cache.get(kind);if(!maps){const pixels=surfacePixels(kind);const normal=this.createTexture(pixels.normal),rough=this.createTexture(pixels.rough);for(const t of [normal,rough]){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(2,2);t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;}maps={normal,rough};this.cache.set(kind,maps);}
    if(material.normalMap!==maps.normal){material.normalMap=maps.normal;material.roughnessMap=maps.rough;material.needsUpdate=true;}material.normalScale.setScalar(strength);
  }
  dispose(){for(const m of this.cache.values()){m.normal.dispose();m.rough.dispose();}this.cache.clear();}
}
