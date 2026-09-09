import * as T from 'three';
// A directional, velocity-driven preview blur. Not a cinematic shutter simulation.
export class MotionPreview {
  private target=new T.WebGLRenderTarget(1,1,{depthBuffer:true});
  private scene=new T.Scene();private camera=new T.OrthographicCamera(-1,1,1,-1,0,1);
  private material=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{image:{value:this.target.texture},direction:{value:new T.Vector2()}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',fragmentShader:`
    uniform sampler2D image; uniform vec2 direction; varying vec2 vUv;
    void main(){vec4 total=vec4(0.0);for(int i=0;i<9;i++){float t=float(i)/8.0-.5;vec4 s=texture2D(image,vUv+direction*t);total+=vec4(s.rgb*s.a,s.a)/9.0;}gl_FragColor=vec4(total.a>.0001?total.rgb/total.a:vec3(0.0),total.a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    }`});
  private quad=new T.Mesh(new T.PlaneGeometry(2,2),this.material);
  constructor(){this.scene.add(this.quad);}
  render(renderer:T.WebGLRenderer,scene:T.Scene,camera:T.Camera,direction:T.Vector2){
    if(direction.lengthSq()<.0000001){renderer.render(scene,camera);return;}
    const size=renderer.getDrawingBufferSize(new T.Vector2());if(this.target.width!==size.x||this.target.height!==size.y)this.target.setSize(size.x,size.y);
    this.material.uniforms.direction.value.copy(direction);renderer.setRenderTarget(this.target);renderer.clear();renderer.render(scene,camera);renderer.setRenderTarget(null);renderer.render(this.scene,this.camera);
  }
  dispose(){this.target.dispose();this.quad.geometry.dispose();this.material.dispose();}
}
