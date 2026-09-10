export type MotionPreset='turntable'|'sway';
export interface MotionOptions{preset:MotionPreset;duration:number;loop:boolean;background:string}
export const defaultMotion:MotionOptions={preset:'turntable',duration:6,loop:true,background:'#171b23'};
export function motionAngle(preset:MotionPreset,progress:number){const t=Math.max(0,Math.min(1,progress));return preset==='turntable'?t*Math.PI*2:Math.sin(t*Math.PI*2)*Math.PI/6;}
export function recordingFormat(){if(typeof MediaRecorder==='undefined')return null;return ['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm','video/mp4'].find(t=>MediaRecorder.isTypeSupported(t))||null;}
