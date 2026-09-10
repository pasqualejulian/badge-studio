import * as T from 'three';
export type MapKind='color'|'normal'|'roughness';
export interface MapSettings{repeat:number;rotation:number;normalStrength:number;roughness:number;colorEnabled:boolean}
export const defaultMapSettings:MapSettings={repeat:2,rotation:0,normalStrength:.3,roughness:.6,colorEnabled:false};
export class MaterialMaps{
 private entries=new Map<string,{maps:Partial<Record<MapKind,T.Texture>>;settings:MapSettings}>();
 private revisions=new Map<string,number>();
 private disposed=false;
 private entry(id:string){let e=this.entries.get(id);if(!e){e={maps:{},settings:{...defaultMapSettings}};this.entries.set(id,e);}return e;}
 async load(id:string,files:Partial<Record<MapKind,File|string>>){
  const revision=(this.revisions.get(id)||0)+1;this.revisions.set(id,revision);
  const loaded:Partial<Record<MapKind,T.Texture>>={};
  try{for(const [kind,source] of Object.entries(files) as [MapKind,File|string][]){
   const local=typeof source!=='string';if(local&&(source.size>8*1024*1024||!['image/png','image/jpeg'].includes(source.type)))throw Error('Usá PNG/JPG de hasta 8 MB por mapa.');
   const url=local?URL.createObjectURL(source):source;
   try{const img=new Image();img.src=url;await img.decode();if(img.width>2048||img.height>2048)throw Error('Cada mapa admite hasta 2048 × 2048 px.');
    const t=new T.Texture(img);if(kind==='color')t.userData.mimeType='image/jpeg';t.colorSpace=kind==='color'?T.SRGBColorSpace:T.NoColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.needsUpdate=true;loaded[kind]=t;
   }finally{if(local)URL.revokeObjectURL(url);}
  }
  if(this.disposed||this.revisions.get(id)!==revision){Object.values(loaded).forEach(t=>t.dispose());return false;}
  const e=this.entry(id);for(const kind of Object.keys(loaded) as MapKind[]){e.maps[kind]?.dispose();e.maps[kind]=loaded[kind];}this.configure(id,{});return true;
  }catch(error){Object.values(loaded).forEach(t=>t.dispose());throw error;}
 }
 configure(id:string,patch:Partial<MapSettings>){const e=this.entry(id);Object.assign(e.settings,patch);for(const t of Object.values(e.maps)){t.repeat.setScalar(e.settings.repeat);t.center.set(.5,.5);t.rotation=e.settings.rotation*Math.PI/180;t.updateMatrix();}}
 apply(id:string,m:T.MeshStandardMaterial,fallback:T.Texture|null=null){const e=this.entries.get(id);m.map=id==='face'?fallback:(e?.settings.colorEnabled?e.maps.color||fallback:fallback);if(e?.maps.normal){m.normalMap=e.maps.normal;m.normalScale.setScalar(e.settings.normalStrength);}if(e?.maps.roughness){m.roughnessMap=e.maps.roughness;m.roughness=e.settings.roughness;}m.needsUpdate=true;}
 face(){const e=this.entries.get('face');return e?.settings.colorEnabled&&e.maps.color?{image:e.maps.color.image as HTMLImageElement,settings:e.settings}:null;}
 clear(id:string){this.revisions.set(id,(this.revisions.get(id)||0)+1);const e=this.entries.get(id);if(e)Object.values(e.maps).forEach(t=>t.dispose());this.entries.delete(id);}
 clearLayers(){for(const id of new Set([...this.entries.keys(),...this.revisions.keys()]))if(!['body','frame','face'].includes(id))this.clear(id);}
 dispose(){this.disposed=true;for(const id of this.entries.keys())this.clear(id);}
}
