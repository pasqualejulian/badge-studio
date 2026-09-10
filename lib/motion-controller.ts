import fixWebmDuration from 'fix-webm-duration';
import * as T from 'three';
import type {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {motionAngle,recordingFormat,type MotionOptions} from './animation';
export class MotionController{
 private saved:{position:T.Vector3;target:T.Vector3;enabled:boolean}|null=null;
 private elapsed=0;private last=0;private playing=false;private options:MotionOptions|null=null;
 onState?:(state:'playing'|'paused'|'idle')=>void;
 constructor(private camera:T.PerspectiveCamera,private controls:OrbitControls){}
 get active(){return !!this.saved;}
 private pose(progress:number){if(!this.saved||!this.options)return;const offset=this.saved.position.clone().sub(this.saved.target).applyAxisAngle(new T.Vector3(0,1,0),motionAngle(this.options.preset,progress));this.camera.position.copy(this.saved.target).add(offset);this.controls.target.copy(this.saved.target);this.camera.lookAt(this.saved.target);}
 play(options:MotionOptions){if(!this.saved){this.saved={position:this.camera.position.clone(),target:this.controls.target.clone(),enabled:this.controls.enabled};this.elapsed=0;}this.options={...options};this.last=performance.now();this.controls.enabled=false;this.playing=true;this.onState?.('playing');}
 pause(){this.playing=false;this.onState?.('paused');}
 stop(){if(this.saved){this.camera.position.copy(this.saved.position);this.controls.target.copy(this.saved.target);this.controls.enabled=this.saved.enabled;this.camera.lookAt(this.saved.target);}this.saved=null;this.playing=false;this.elapsed=0;this.onState?.('idle');}
 tick(now:number){if(!this.saved)return false;if(this.playing&&this.options){this.elapsed+=(now-this.last)/1000;this.last=now;let t=this.elapsed/this.options.duration;if(t>=1&&!this.options.loop){this.stop();return false;}t%=1;this.pose(t);}return true;}
 seek(progress:number){this.pose(progress);}
}
export async function recordVideo(renderer:T.WebGLRenderer,scene:T.Scene,camera:T.PerspectiveCamera,controller:MotionController,options:MotionOptions,signal:AbortSignal,onProgress:(n:number)=>void){
 const mime=recordingFormat();if(!mime)throw Error('Este navegador no permite grabar video. Probá Chrome o Edge.');
 if(typeof renderer.domElement.captureStream!=='function')throw Error('La captura del canvas no está disponible.');
 const size=renderer.getSize(new T.Vector2()),ratio=renderer.getPixelRatio(),aspect=camera.aspect,background=scene.background;
 let stream:MediaStream|undefined,recorder:MediaRecorder|undefined;
 const stop=()=>{if(recorder&&recorder.state!=='inactive')recorder.stop();};
 let interrupted=false;const hidden=()=>{if(document.hidden){interrupted=true;stop();}};
 try{
  controller.stop();controller.play({...options,loop:false});controller.pause();
  renderer.setPixelRatio(1);renderer.setSize(1080,1080,false);camera.aspect=1;camera.updateProjectionMatrix();scene.background=new T.Color(options.background);
  controller.seek(0);renderer.render(scene,camera);stream=renderer.domElement.captureStream(30);
  recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:8_000_000});const chunks:Blob[]=[];
  const done=new Promise<Blob>((resolve,reject)=>{recorder!.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder!.onerror=()=>reject(Error('Falló la grabación.'));recorder!.onstop=()=>resolve(new Blob(chunks,{type:mime}));});
  signal.addEventListener('abort',stop);document.addEventListener('visibilitychange',hidden);
  recorder.start(200);const start=performance.now();
  await new Promise<void>(resolve=>{let timer:ReturnType<typeof setTimeout>;const finish=()=>{clearTimeout(timer);signal.removeEventListener('abort',finish);recorder!.removeEventListener('stop',finish);resolve();};signal.addEventListener('abort',finish,{once:true});recorder!.addEventListener('stop',finish,{once:true});const frame=()=>{if(signal.aborted||recorder!.state==='inactive'){finish();return;}const p=Math.min(1,(performance.now()-start)/(options.duration*1000));controller.seek(p);renderer.render(scene,camera);onProgress(p);if(p===1){finish();return;}timer=setTimeout(frame,1000/30);};frame();});
  const recordedMs=performance.now()-start;stop();let blob=await done;if(signal.aborted)throw new DOMException('Exportación cancelada','AbortError');if(interrupted)throw Error('La grabación se interrumpió al salir de la pestaña.');if(!blob.size)throw Error('El video quedó vacío.');if(mime.includes('webm'))blob=await fixWebmDuration(blob,recordedMs,{logger:false});return {blob,extension:mime.includes('mp4')?'mp4':'webm'};
 }finally{signal.removeEventListener('abort',stop);document.removeEventListener('visibilitychange',hidden);stop();stream?.getTracks().forEach(t=>t.stop());controller.stop();scene.background=background;renderer.setPixelRatio(ratio);renderer.setSize(size.x,size.y,false);camera.aspect=aspect;camera.updateProjectionMatrix();renderer.render(scene,camera);}
}
