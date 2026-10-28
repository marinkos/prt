var _t={"car/parts.bin":"car/parts-2241684c.bin","car/parts.json":"car/parts-a3f09d9e.json"};function pn(i){let e=()=>{for(let[t,n]of Object.entries(i))try{n()}catch(s){console.error(`[a-security] ${t} failed to start`,s)}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e):e()}import*as y from"https://cdn.jsdelivr.net/npm/three@0.184.0/+esm";import{Box3 as ns,InstancedInterleavedBuffer as ss,InterleavedBufferAttribute as xn,Line3 as is,MathUtils as os,Matrix4 as as,Mesh as rs,Sphere as ls,Vector3 as Kt,Vector4 as ue}from"https://cdn.jsdelivr.net/npm/three@0.184.0/+esm";import{Box3 as bn,Float32BufferAttribute as mn,InstancedBufferGeometry as Yn,InstancedInterleavedBuffer as yn,InterleavedBufferAttribute as be,Sphere as Kn,Vector3 as Qn,WireframeGeometry as Jn}from"https://cdn.jsdelivr.net/npm/three@0.184.0/+esm";var gn=new bn,ve=new Qn,Zt=class extends Yn{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";let e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],n=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(n),this.setAttribute("position",new mn(e,3)),this.setAttribute("uv",new mn(t,2))}applyMatrix4(e){let t=this.attributes.instanceStart,n=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),n.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let n=new yn(t,6,1);return this.setAttribute("instanceStart",new be(n,3,0)),this.setAttribute("instanceEnd",new be(n,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let n=new yn(t,6,1);return this.setAttribute("instanceColorStart",new be(n,3,0)),this.setAttribute("instanceColorEnd",new be(n,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new Jn(e.geometry)),this}fromLineSegments(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new bn);let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),gn.setFromBufferAttribute(t),this.boundingBox.union(gn))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Kn),this.boundingBox===null&&this.computeBoundingBox();let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){let n=this.boundingSphere.center;this.boundingBox.getCenter(n);let s=0;for(let a=0,l=e.count;a<l;a++)ve.fromBufferAttribute(e,a),s=Math.max(s,n.distanceToSquared(ve)),ve.fromBufferAttribute(t,a),s=Math.max(s,n.distanceToSquared(ve));this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}};import{ShaderLib as xe,ShaderMaterial as ts,UniformsLib as we,UniformsUtils as vn,Vector2 as es}from"https://cdn.jsdelivr.net/npm/three@0.184.0/+esm";we.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new es(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};xe.line={uniforms:vn.merge([we.common,we.fog,we.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
				vUv = uv;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			float alpha = opacity;
			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};var Yt=class extends ts{constructor(e){super({type:"LineMaterial",uniforms:vn.clone(xe.line.uniforms),vertexShader:xe.line.vertexShader,fragmentShader:xe.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0!==this.worldUnits&&(this.needsUpdate=!0),e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}};var Ue=new ue,wn=new Kt,En=new Kt,xt=new ue,wt=new ue,Ut=new ue,We=new Kt,Ne=new as,Et=new is,Sn=new Kt,Ee=new ns,Se=new ls,Wt=new ue,Nt,ne;function Mn(i,e,t){return Wt.set(0,0,-e,1).applyMatrix4(i.projectionMatrix),Wt.multiplyScalar(1/Wt.w),Wt.x=ne/t.width,Wt.y=ne/t.height,Wt.applyMatrix4(i.projectionMatrixInverse),Wt.multiplyScalar(1/Wt.w),Math.abs(Math.max(Wt.x,Wt.y))}function cs(i,e){let t=i.matrixWorld,n=i.geometry,s=n.attributes.instanceStart,a=n.attributes.instanceEnd,l=Math.min(n.instanceCount,s.count);for(let o=0,r=l;o<r;o++){Et.start.fromBufferAttribute(s,o),Et.end.fromBufferAttribute(a,o),Et.applyMatrix4(t);let h=new Kt,c=new Kt;Nt.distanceSqToSegment(Et.start,Et.end,c,h),c.distanceTo(h)<ne*.5&&e.push({point:c,pointOnLine:h,distance:Nt.origin.distanceTo(c),object:i,face:null,faceIndex:o,uv:null,uv1:null})}}function ds(i,e,t){let n=e.projectionMatrix,a=i.material.resolution,l=i.matrixWorld,o=i.geometry,r=o.attributes.instanceStart,h=o.attributes.instanceEnd,c=Math.min(o.instanceCount,r.count),d=-e.near;Nt.at(1,Ut),Ut.w=1,Ut.applyMatrix4(e.matrixWorldInverse),Ut.applyMatrix4(n),Ut.multiplyScalar(1/Ut.w),Ut.x*=a.x/2,Ut.y*=a.y/2,Ut.z=0,We.copy(Ut),Ne.multiplyMatrices(e.matrixWorldInverse,l);for(let u=0,p=c;u<p;u++){if(xt.fromBufferAttribute(r,u),wt.fromBufferAttribute(h,u),xt.w=1,wt.w=1,xt.applyMatrix4(Ne),wt.applyMatrix4(Ne),xt.z>d&&wt.z>d)continue;if(xt.z>d){let T=xt.z-wt.z,P=(xt.z-d)/T;xt.lerp(wt,P)}else if(wt.z>d){let T=wt.z-xt.z,P=(wt.z-d)/T;wt.lerp(xt,P)}xt.applyMatrix4(n),wt.applyMatrix4(n),xt.multiplyScalar(1/xt.w),wt.multiplyScalar(1/wt.w),xt.x*=a.x/2,xt.y*=a.y/2,wt.x*=a.x/2,wt.y*=a.y/2,Et.start.copy(xt),Et.start.z=0,Et.end.copy(wt),Et.end.z=0;let F=Et.closestPointToPointParameter(We,!0);Et.at(F,Sn);let m=os.lerp(xt.z,wt.z,F),w=m>=-1&&m<=1,S=We.distanceTo(Sn)<ne*.5;if(w&&S){Et.start.fromBufferAttribute(r,u),Et.end.fromBufferAttribute(h,u),Et.start.applyMatrix4(l),Et.end.applyMatrix4(l);let T=new Kt,P=new Kt;Nt.distanceSqToSegment(Et.start,Et.end,P,T),t.push({point:P,pointOnLine:T,distance:Nt.origin.distanceTo(P),object:i,face:null,faceIndex:u,uv:null,uv1:null})}}}var oe=class extends rs{constructor(e=new Zt,t=new Yt({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){let e=this.geometry,t=e.attributes.instanceStart,n=e.attributes.instanceEnd,s=new Float32Array(2*t.count);for(let l=0,o=0,r=t.count;l<r;l++,o+=2)wn.fromBufferAttribute(t,l),En.fromBufferAttribute(n,l),s[o]=o===0?0:s[o-1],s[o+1]=s[o]+wn.distanceTo(En);let a=new ss(s,2,1);return e.setAttribute("instanceDistanceStart",new xn(a,1,0)),e.setAttribute("instanceDistanceEnd",new xn(a,1,1)),this}raycast(e,t){let n=this.material.worldUnits,s=e.camera;s===null&&!n&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');let a=e.params.Line2!==void 0&&e.params.Line2.threshold||0;Nt=e.ray;let l=this.matrixWorld,o=this.geometry,r=this.material;ne=r.linewidth+a,o.boundingSphere===null&&o.computeBoundingSphere(),Se.copy(o.boundingSphere).applyMatrix4(l);let h;if(n)h=ne*.5;else{let d=Math.max(s.near,Se.distanceToPoint(Nt.origin));h=Mn(s,d,r.resolution)}if(Se.radius+=h,Nt.intersectsSphere(Se)===!1)return;o.boundingBox===null&&o.computeBoundingBox(),Ee.copy(o.boundingBox).applyMatrix4(l);let c;if(n)c=ne*.5;else{let d=Math.max(s.near,Ee.distanceToPoint(Nt.origin));c=Mn(s,d,r.resolution)}Ee.expandByScalar(c),Nt.intersectsBox(Ee)!==!1&&(n?cs(this,t):ds(this,s,t))}onBeforeRender(e){let t=this.material.uniforms;t&&t.resolution&&(e.getViewport(Ue),this.material.uniforms.resolution.value.set(Ue.z,Ue.w))}};import{createTimeline as gs}from"https://cdn.jsdelivr.net/npm/animejs@4.5.0/+esm";import*as X from"https://cdn.jsdelivr.net/npm/three@0.184.0/+esm";var hs=[0,.3,2.15],qe="air_cleaner",Qt=(i=0,e=0,t=0)=>new X.Vector3(i,e,t),Rn=Qt(0,1,0);function ae(i,{p:e=[0,0,0],r:t=[0,0,0],q:n}={}){return i.applyMatrix4(new X.Matrix4().compose(Qt(...e),n||new X.Quaternion().setFromEuler(new X.Euler(...t)),Qt(1,1,1))),i}var kt=(i,e,t,n)=>ae(new X.BoxGeometry(i,e,t),n),$t=(i,e,t,n=24)=>ae(new X.CylinderGeometry(i,i,e,n),t),yt=(i,e,t,n,s,a=24,l=i)=>ae(new X.CylinderGeometry(l,i,t-e,a).rotateX(Math.PI/2),{p:[n,s,(e+t)/2]}),kn=i=>new X.Shape(i.map(([e,t])=>new X.Vector2(e,t))),fe=(i,e,t,n)=>ae(new X.ExtrudeGeometry(kn(i),{depth:t-e,bevelEnabled:!1}).translate(0,0,e),n),Cn=(i,e)=>{let t=Qt(...i),n=Qt(...e),s=n.clone().sub(t);return{len:s.length(),o:{p:t.add(n).multiplyScalar(.5).toArray(),q:new X.Quaternion().setFromUnitVectors(Rn,s.normalize())}}},Tn=(i,e,t,n)=>{let s=Cn(i,e);return ae(new X.BoxGeometry(t,s.len,n),s.o)},Me=(i,e,t,n=16)=>{let s=Cn(i,e);return ae(new X.CylinderGeometry(t,t,s.len,n),s.o)},An=(i,e,t=48,n=14)=>new X.TubeGeometry(new X.CatmullRomCurve3(i.map(s=>Qt(...s))),t,e,n,!1);function us(i){let e=i.map(o=>o.index?o.toNonIndexed():o),t=0;for(let o of e)t+=o.attributes.position.count;let n=new Float32Array(t*3),s=new Float32Array(t*3),a=0;for(let o of e)o.attributes.normal||o.computeVertexNormals(),n.set(o.attributes.position.array,a*3),s.set(o.attributes.normal.array,a*3),a+=o.attributes.position.count;let l=new X.BufferGeometry;return l.setAttribute("position",new X.BufferAttribute(n,3)),l.setAttribute("normal",new X.BufferAttribute(s,3)),l}function fs(i,e,t,n){let s=l=>{let o=[];for(let[d,u,p]of i)for(let A=0;A<96;A++){let F=A/96*Math.PI*2;o.push([d+Math.cos(F)*(p+l),u+Math.sin(F)*(p+l)])}o.sort((d,u)=>d[0]-u[0]||d[1]-u[1]);let r=(d,u,p)=>(u[0]-d[0])*(p[1]-d[1])-(u[1]-d[1])*(p[0]-d[0]),h=[],c=[];for(let d of o){for(;h.length>1&&r(h.at(-2),h.at(-1),d)<=0;)h.pop();h.push(d)}for(let d of o.reverse()){for(;c.length>1&&r(c.at(-2),c.at(-1),d)<=0;)c.pop();c.push(d)}return h.slice(0,-1).concat(c.slice(0,-1))},a=kn(s(n+.003));return a.holes.push(new X.Path(s(.003).map(([l,o])=>new X.Vector2(l,o)))),new X.ExtrudeGeometry(a,{depth:t-e,bevelEnabled:!1,curveSegments:1}).translate(0,0,e)}function Hn(){let i=[],e=(m,w,{pivot:S=[0,0,0],spin:T=0}={})=>{let P=us(w).translate(-S[0],-S[1],-S[2]);i.push({name:m,geo:P,pivot:S.map((k,D)=>k+hs[D]),spin:T})},t=[-.33,-.11,.11,.33];e("oil_pan",[fe([[-.2,0],[.2,0],[.27,.2],[.27,.27],[-.27,.27],[-.27,.2]],-.48,.42),kt(.6,.03,.96,{p:[0,.285,-.02]}),$t(.025,.03,{p:[0,-.01,-.3]},6)]);let n=[fe([[-.3,.3],[.3,.3],[.3,.6],[.56,.84],[.36,1.04],[.1,.8],[-.1,.8],[-.36,1.04],[-.56,.84],[-.3,.6]],-.5,.46)];for(let m of[1,-1]){for(let w of[-.36,-.12,.12,.36])n.push(kt(.02,.26,.035,{p:[m*.31,.45,w]}));n.push(kt(.08,.07,.12,{p:[m*.34,.52,.16]}))}e("block",n),e("bellhousing",[yt(.24,-.72,-.52,0,.5,40,.37),yt(.39,-.52,-.5,0,.5,40),yt(.06,-.66,-.42,-.31,.3,20),yt(.035,-.42,-.36,-.31,.3,16)]);let s=[[-.14,0],[.14,0],[.135,.05],[.1,.095],[-.1,.095],[-.135,.05]];for(let m of[1,-1]){let w=m>0?"r":"l",S=-m*Math.PI/4,T=[m*Math.SQRT1_2,Math.SQRT1_2],P=[m*Math.SQRT1_2,-Math.SQRT1_2],k=(E,I)=>[m*.46+P[0]*E+T[0]*I,.94+P[1]*E+T[1]*I],D=(E,I,K)=>({p:[...k(E,I),K],r:[0,0,S]}),J=[kt(.3,.14,.92,D(0,.07,-.02))];for(let E of t){let[I,K]=k(.15,.085),at=Qt(m,-.3,0).normalize();J.push(Me([I,K,E],[I+at.x*.09,K+at.y*.09,E],.022,12)),J.push(Me([I+at.x*.09,K+at.y*.09,E],[I+at.x*.12,K+at.y*.12,E],.014,6))}e(`head_${w}`,J);let g=[kt(.3,.02,.9,D(0,.15,-.02)),fe(s,-.44,.4,D(0,.16,0))];for(let E of[-.32,-.16,0,.16])g.push(kt(.18,.014,.03,D(0,.262,E)));for(let E of[-.38,-.02,.34])for(let I of[-.135,.135])g.push($t(.013,.025,D(I,.17,E),6));m>0&&g.push($t(.04,.035,D(0,.272,.3),24),kt(.07,.012,.014,D(0,.295,.3))),e(`valve_cover_${w}`,g);let[$,_]=k(.17,.07),R=[kt(.02,.11,.88,D(.16,.07,-.02))];for(let E of t)R.push(An([[$,_,E],[$+m*.07,_-.03,E],[m*.76,.71,E*.75-.04],[m*.75,.59,E*.35-.2],[m*.73,.53,-.4]],.03));R.push(An([[m*.73,.54,-.34],[m*.73,.51,-.52],[m*.7,.42,-.64],[m*.62,.3,-.7]],.05,32,18)),e(`exhaust_${w}`,R)}let a=[fe([[-.16,.86],[.16,.86],[.19,1.05],[.15,1.12],[-.15,1.12],[-.19,1.05]],-.42,.4)];for(let m of[1,-1])for(let w of t)a.push(Tn([m*.15,1.03,w],[m*.39,1.08,w],.07,.065));a.push(yt(.035,.4,.5,0,.99,16),kt(.09,.05,.05,{p:[0,.99,.37]})),e("intake",a),e(qe,[kt(.17,.08,.15,{p:[0,1.16,-.02]}),$t(.25,.015,{p:[0,1.2075,-.02]},48),$t(.24,.08,{p:[0,1.255,-.02]},48),$t(.255,.02,{p:[0,1.305,-.02]},48),$t(.012,.05,{p:[0,1.335,-.02]},8),kt(.09,.022,.022,{p:[0,1.35,-.02]}),kt(.1,.06,.18,{p:[0,1.255,.28]})]);let l=[$t(.04,.2,{p:[0,.96,-.48]},20),$t(.07,.06,{p:[0,1.09,-.48]},28)];for(let m=0;m<6;m++){let w=m/6*Math.PI*2;l.push($t(.012,.03,{p:[Math.cos(w)*.045,1.135,-.48+Math.sin(w)*.045]},8))}e("distributor",l);let o=2.2,r=[0,.38,.11],h=[0,.74,.1],c=[.38,.7,.055],d=[-.36,.6,.08];e("timing_cover",[fe([[-.15,.27],[.15,.27],[.2,.42],[.15,.84],[-.15,.84],[-.2,.42]],.46,.52),yt(.075,.52,.6,h[0],h[1],28)]),e("belt",[fs([r,h,c,d],.605,.635,.015)]);let u=(m,w,S,T,P,k,D=.012)=>Array.from({length:T},(J,g)=>{let $=g/T*Math.PI*2;return yt(D,P,k,m+Math.cos($)*S,w+Math.sin($)*S,6)});e("crank_pulley",[yt(.13,.52,.575,r[0],r[1],40),yt(.11,.575,.645,r[0],r[1],40),yt(.035,.645,.675,r[0],r[1],6),...u(r[0],r[1],.07,6,.645,.66),kt(.012,.03,.04,{p:[r[0],r[1]+.12,.55]})],{pivot:[r[0],r[1],0],spin:o});let p=[yt(.1,.6,.645,h[0],h[1],40),...u(h[0],h[1],.06,4,.645,.66),yt(.055,.645,.7,h[0],h[1],24),yt(.085,.665,.68,h[0],h[1],24)];for(let m=0;m<5;m++){let w=m/5*Math.PI*2,S=new X.Quaternion().setFromAxisAngle(Qt(0,0,1),w-Math.PI/2).multiply(new X.Quaternion().setFromAxisAngle(Rn,.45));p.push(kt(.075,.17,.012,{p:[h[0]+Math.cos(w)*.165,h[1]+Math.sin(w)*.165,.69],q:S}))}e("fan",p,{pivot:[h[0],h[1],0],spin:o*r[2]/h[2]}),e("alternator",[yt(.1,.47,.585,c[0],c[1],32),Tn([c[0]-.06,c[1]-.05,.5],[.28,.6,.48],.03,.03)]);let A=[yt(.085,.585,.6,c[0],c[1],32),yt(c[2],.6,.65,c[0],c[1],24),yt(.022,.65,.67,c[0],c[1],6)];for(let m=0;m<8;m++){let w=m/8*Math.PI*2;A.push(kt(.012,.028,.012,{p:[c[0]+Math.cos(w)*.07,c[1]+Math.sin(w)*.07,.606],r:[0,0,w-Math.PI/2]}))}e("alternator_pulley",A,{pivot:[c[0],c[1],0],spin:o*r[2]/c[2]}),e("steering_pump",[yt(.07,.47,.59,d[0],d[1],28),$t(.045,.06,{p:[d[0],d[1]+.09,.53]},24)]),e("steering_pulley",[yt(d[2],.59,.65,d[0],d[1],32),yt(.025,.65,.67,d[0],d[1],6),...u(d[0],d[1],.048,3,.65,.658,.016)],{pivot:[d[0],d[1],0],spin:o*r[2]/d[2]});let F=[Me([.29,.45,.12],[.45,.37,.12],.065,32)];for(let m of[.35,.55,.75]){let w=[.29+.16*m,.45-.08*m,.12],S=[w[0]+.009,w[1]-.0045,.12];F.push(Me(w,S,.069,32))}return e("oil_filter",F),i}var ps="http://www.w3.org/2000/svg",vt={line:"#A3A3A3",text:"#6B6B6B",bright:"#001e3c",warn:"#efb814",halo:"#F1F1F1"},Ln="ABCDEFGHJKLMNPRSTUVWXYZ0123456789/#+",qt=(i,e=0,t=1)=>Math.min(t,Math.max(e,i)),re=(i,e)=>Math.hypot(e[0]-i[0],e[1]-i[1]),_n=(i,e,t)=>[i[0]+(e[0]-i[0])*t,i[1]+(e[1]-i[1])*t];function ms(i,e){if(e>=1)return i;let t=0;for(let a=1;a<i.length;a++)t+=re(i[a-1],i[a]);let n=t*e,s=[i[0]];for(let a=1;a<i.length;a++){let l=re(i[a-1],i[a]);if(n>=l){s.push(i[a]),n-=l;continue}s.push(_n(i[a-1],i[a],l?n/l:0));break}return s}function ys(i,e){if(e>=.999)return i;let t=Math.floor(i.length*e),n="";for(let s=t;s<Math.min(i.length,t+2);s++)n+=i[s]===" "?" ":Ln[(Math.floor(e*i.length*8)+s*7)%Ln.length];return i.slice(0,t)+n}function In(i){let e=new Map,t=new Set,n=(o,r)=>{let h=e.get(o);return h||(h=document.createElementNS(ps,r),i.append(h),e.set(o,h)),t.add(o),h},s=(o,r)=>{for(let h in r)o.setAttribute(h,r[h]);return o},a=o=>o.map(r=>`${r[0].toFixed(1)},${r[1].toFixed(1)}`).join(" "),l={begin(){t=new Set},end(){for(let[o,r]of e)r.style.display=t.has(o)?"":"none"},line(o,r,{draw:h=1,alpha:c=1,dash:d="",color:u=vt.line,width:p=1}={}){c<=.01||h<=.001||s(n(o,"polyline"),{points:a(ms(r,h)),stroke:u,"stroke-width":p,"stroke-dasharray":d,fill:"none",opacity:c.toFixed(3)})},text(o,r,h,c,{draw:d=1,alpha:u=1,color:p=vt.text,anchor:A="start",angle:F=0,size:m=10,weight:w=500,spacing:S=.12}={}){if(u<=.01||d<=.001)return;let T=s(n(o,"text"),{x:r.toFixed(1),y:h.toFixed(1),fill:p,"text-anchor":A,opacity:u.toFixed(3),"font-size":m,"font-weight":w,"letter-spacing":`${S}em`,transform:F?`rotate(${F.toFixed(2)} ${r.toFixed(1)} ${h.toFixed(1)})`:""});T.textContent=ys(c,d)},circle(o,r,h,c,{alpha:d=1,color:u=vt.line,fill:p="none",width:A=1,dash:F=""}={}){d<=.01||c<=0||s(n(o,"circle"),{cx:r.toFixed(1),cy:h.toFixed(1),r:c.toFixed(1),stroke:u,fill:p,"stroke-width":A,"stroke-dasharray":F,opacity:d.toFixed(3)})},rect(o,r,h,c,d,{alpha:u=1,color:p=vt.line,fill:A=vt.halo}={}){u<=.01||s(n(o,"rect"),{x:r.toFixed(1),y:h.toFixed(1),width:c,height:d,stroke:p,fill:A,opacity:u.toFixed(3)})},dim(o,r,h,c,d,u,{draw:p=1,alpha:A=1,color:F=vt.line}={}){if(A<=.01||p<=.001||re(c,d)<12)return;let m=(E,I)=>{let K=re(E,I)||1,at=(I[0]-E[0])/K,Ot=(I[1]-E[1])/K;return[[E[0]+at*4,E[1]+Ot*4],[I[0]+at*6,I[1]+Ot*6]]},w=qt(p/.35);l.line(`${o}:ea`,m(r,c),{draw:w,alpha:A,color:F}),l.line(`${o}:eb`,m(h,d),{draw:w,alpha:A,color:F});let S=qt((p-.2)/.5),T=_n(c,d,.5);l.line(`${o}:m1`,[T,c],{draw:S,alpha:A,color:F}),l.line(`${o}:m2`,[T,d],{draw:S,alpha:A,color:F});let P=re(c,d),k=(d[0]-c[0])/P,D=(d[1]-c[1])/P,J=(E,I)=>{let K=(k-D)*4.5,at=(D+k)*4.5;l.line(`${o}:t${I}`,[[E[0]-K,E[1]-at],[E[0]+K,E[1]+at]],{draw:S>=1?1:0,alpha:A,color:vt.text})};J(c,"a"),J(d,"b");let g=Math.atan2(D,k)*180/Math.PI;g>90&&(g-=180),g<-90&&(g+=180);let $=re(r,c)||1,_=(c[0]-r[0])/$,R=(c[1]-r[1])/$;l.text(`${o}:l`,T[0]+_*11,T[1]+R*11+3.5,u,{draw:qt((p-.55)/.45),alpha:A,angle:g,anchor:"middle"})},callout(o,r,h,c,d,{draw:u=1,alpha:p=1,color:A=vt.line,textColor:F=vt.text,shelf:m=64,sub:w=""}={}){if(p<=.01||u<=.001)return;let S=Math.sign(c)||1,T=[r[0]+c,r[1]+d],P=[T[0]+S*m,T[1]];l.circle(`${o}:d`,r[0],r[1],2.2,{alpha:p,color:F,fill:F}),l.line(`${o}:l`,[r,T,P],{draw:qt(u/.6),alpha:p,color:A});let k=T[0]+S*2,D=S>0?"start":"end",J=qt((u-.45)/.55);l.text(`${o}:t`,k,T[1]-6,h,{draw:J,alpha:p,color:F,anchor:D}),w&&l.text(`${o}:s`,k,T[1]+13,w,{draw:J,alpha:p*.8,anchor:D,size:9})},tag(o,r,h,c,{draw:d=1,alpha:u=1}={}){if(u<=.01||d<=.001)return;let p=u*qt(d/.3);l.rect(`${o}:r`,r[0]-8,r[1]-8,16,16,{alpha:p,color:vt.text}),l.text(`${o}:n`,r[0],r[1]+3.5,h,{alpha:p,color:vt.bright,anchor:"middle",spacing:0}),l.text(`${o}:t`,r[0]+13,r[1]+3.5,c,{draw:qt((d-.3)/.7),alpha:u})},reticle(o,r,h,c,d,{draw:u=1,alpha:p=1,color:A=vt.warn,pulse:F=1,flip:m=!1}={}){if(p<=.01||u<=.001)return;let w=qt(u/.5),S=h*(1.25-.25*w);l.circle(`${o}:c`,r[0],r[1],S,{alpha:p*w*(.55+.45*F),color:A,width:1.2}),l.circle(`${o}:c2`,r[0],r[1],S+7,{alpha:p*w*.5,color:A,dash:"2 5"});for(let _=0;_<4;_++){let R=_*Math.PI/2,E=Math.cos(R),I=Math.sin(R);l.line(`${o}:x${_}`,[[r[0]+E*(S-5),r[1]+I*(S-5)],[r[0]+E*(S+12),r[1]+I*(S+12)]],{alpha:p*w,color:A})}if(!c&&!d)return;let T=m?-1:1,P=[r[0]+T*S*.87,r[1]-S*.5],k=[P[0]+T*28,P[1]-16],D=[k[0]+T*160,k[1]];l.line(`${o}:l`,[P,k,D],{draw:qt((u-.3)/.4),alpha:p,color:A});let J=qt((u-.55)/.45),g=k[0]+T*2,$=m?"end":"start";l.text(`${o}:t`,g,k[1]-7,c,{draw:J,alpha:p*(.6+.4*F),color:vt.bright,weight:600,anchor:$}),l.text(`${o}:s`,g,k[1]+14,d,{draw:J,alpha:p,size:9,anchor:$})}};return l}var ce={outline:"#818181",carEdge:"#A3A3A3",engineEdge:"#999999",side:"#F1F1F1",top:"#F1F1F1",warn:"#efb814"},Jt=1e4,Fn=Jt/4,Te=1.06,On=.5,Ve=new y.Color(ce.warn),Ge=Math.PI/180,Pn=matchMedia("(prefers-reduced-motion: reduce)"),le=()=>Pn.matches,bs=[.23,.47,.72,.995],Ae=(i,e=0,t=1)=>Math.min(t,Math.max(e,i));function vs(){if(document.getElementById("car-scene-styles"))return;let i=document.createElement("style");i.id="car-scene-styles",i.textContent=`
:where([data-car-scene]){position:relative;overflow:hidden}
[data-car-scene] canvas,[data-car-scene] .car-notes{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
[data-car-scene] .car-notes{overflow:visible;font-family:var(--car-notes-font,DegularMono,ui-monospace,monospace);text-transform:uppercase}
[data-car-scene] .car-notes text{paint-order:stroke;stroke:var(--car-paper,#f1f1f1);stroke-width:3px;stroke-linejoin:round}
[data-car-scene].car-ready [data-car-poster]{opacity:0;visibility:hidden}
[data-car-scene].car-fallback canvas,[data-car-scene].car-fallback .car-notes{display:none}
[data-car-poster]{transition:opacity .4s ease,visibility .4s}
:where([data-car-stop]){cursor:pointer}`,document.head.append(i)}var xs=i=>i<.25?["PURSUE AT ALL TIMES","RUN ATTACKS 24/7"]:i<.585?["EXPLOIT CONFIRMED","ATTACK PATH · VALIDATED"]:i<.755?["DEFENSES UNDER TEST","VALIDATION · IN PROGRESS"]:["RETEST PASSED","ATTACK PATH · CLOSED"];function Re(i,e,t){let n=(i.getAttribute(e)||"").trim().split(/[\s,]+/).map(Number);return n.length===4&&n.every(Number.isFinite)?n:t}function ws(i){let e=i.closest("[data-car-scroll]")||document.querySelector("[data-car-scroll]"),t=e?.querySelector("[data-car-pin]"),n=[...(e||document).querySelectorAll("[data-car-card]")],s=(e||document).querySelector("[data-car-timeline]"),a=[...(e||document).querySelectorAll("[data-car-stop]")],l=(e||document).querySelector("[data-car-caption]"),o=!1;function r(R){if(!l)return;let[E,I]=xs(R),K=l.querySelector("strong"),at=l.querySelector("span");K&&K.textContent!==E&&(K.textContent=E),at&&at.textContent!==I&&(at.textContent=I),l.hidden=!(o||i.clientWidth<640)||!o&&R<.25}let h=0;function c(){if(!t)return;let R=parseFloat(getComputedStyle(t).getPropertyValue("--car-pin-clearance"))||0;h=Math.min(0,innerHeight-t.offsetHeight+R),t.style.top=`${h}px`}let d=()=>{let R=e.nextElementSibling;return R?Math.max(0,-parseFloat(getComputedStyle(R).marginTop)||0):0},u=()=>Math.max(1,e.offsetHeight-(t?t.offsetHeight:innerHeight)-d());function p(){return e?Ae((h-e.getBoundingClientRect().top)/u()):0}function A(R){let E=Math.min(3,Math.floor(R*4)),I=R*3;n.forEach((K,at)=>{let Ot=at===E;K.classList.toggle("is-active",Ot),K.matches("button")&&K.setAttribute("aria-pressed",String(Ot));let ut=K.querySelector("[data-car-bar]");ut&&(ut.style.transformOrigin="left center",ut.style.transform=`scaleX(${Ae(I-at+.5)})`)}),s&&(s.style.setProperty("--car-line",R.toFixed(4)),s.style.setProperty("--car-progress",R.toFixed(4))),a.forEach((K,at)=>{K.classList.toggle("is-reached",at<=E),K.classList.toggle("is-active",at===E)})}function F(R){if(!e)return;let E=e.getBoundingClientRect().top+scrollY-h+u()*bs[R];window.lenis?.scrollTo?window.lenis.scrollTo(E,{immediate:le()}):scrollTo({top:E,behavior:le()?"auto":"smooth"})}n.forEach((R,E)=>R.addEventListener("click",()=>F(E))),a.forEach((R,E)=>{R.matches("button, a")||(R.setAttribute("role","button"),R.tabIndex=0),R.addEventListener("click",()=>F(E)),R.addEventListener("keydown",I=>{(I.key==="Enter"||I.key===" ")&&(I.preventDefault(),F(E))})}),a[0]?.closest('[aria-hidden="true"]')?.removeAttribute("aria-hidden"),vs();let m=document.createElement("canvas");m.setAttribute("aria-hidden","true");let w=document.createElementNS("http://www.w3.org/2000/svg","svg");w.setAttribute("class","car-notes"),w.setAttribute("aria-hidden","true"),i.append(m,w),c();let S=p(),T=S,P=!1,k=performance.now(),D=()=>{};function J(){S=p(),A(S),o&&r(S),D()}addEventListener("scroll",J,{passive:!0}),addEventListener("resize",()=>{c(),J()}),t&&new ResizeObserver(()=>{c(),J()}).observe(t),document.fonts?.ready.then(()=>{c(),J()}),A(S);function g(R){o||(o=!0,i.classList.add("car-fallback"),i.classList.remove("car-ready"),r(S),R&&console.warn("Car scene uses its static illustration.",R))}function $(){let R=new y.WebGLRenderer({canvas:m,antialias:!0,alpha:!0});R.setClearColor(0,0);let E=new y.Scene,I=new y.Group;E.add(I);let K=1;class at{constructor(b){this.r=b,this.rt=new y.WebGLRenderTarget(1,1,{minFilter:y.NearestFilter,magFilter:y.NearestFilter,depthTexture:new y.DepthTexture(1,1)}),this.mat=new y.ShaderMaterial({uniforms:{tId:{value:this.rt.texture},tDepth:{value:this.rt.depthTexture},uTexel:{value:new y.Vector2},uW:{value:2},uColor:{value:new y.Color(ce.outline)},uWarnCol:{value:Ve}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",fragmentShader:`
        uniform sampler2D tId; uniform sampler2D tDepth; uniform vec2 uTexel; uniform float uW; uniform vec3 uColor; uniform vec3 uWarnCol;
        varying vec2 vUv;
        float hit(vec4 c, float d, vec2 o) {
          vec4 c2 = texture2D(tId, vUv + o * uTexel);
          if (c2.a < 0.5) return 1.0;
          float d2 = texture2D(tDepth, vUv + o * uTexel).x;
          return (distance(c2.rg, c.rg) > 0.001 && d2 > d + 0.00025) ? 1.0 : 0.0;
        }
        void main() {
          vec4 c = texture2D(tId, vUv);
          if (c.a < 0.5 || c.b < 0.01) discard;
          float d = texture2D(tDepth, vUv).x, h = 0.0;
          for (int i = 0; i < 12; i++) {
            vec2 dir = vec2(cos(float(i) * 0.5235988), sin(float(i) * 0.5235988));
            h += hit(c, d, dir * uW) + hit(c, d, dir * uW * 0.5);
          }
          float a = clamp(h / 5.0, 0.0, 1.0) * c.b;
          if (a <= 0.0) discard;
          float w = clamp((1.0 - c.a) / 0.45, 0.0, 1.0);   // alert level rides in the ID alpha
          gl_FragColor = vec4(mix(uColor, uWarnCol, w), a);
          #include <colorspace_fragment>
        }`,transparent:!0,depthTest:!1,depthWrite:!1});let v=new y.Mesh(new y.PlaneGeometry(2,2),this.mat);v.frustumCulled=!1,this.qs=new y.Scene,this.qs.add(v),this.qc=new y.OrthographicCamera(-1,1,1,-1,0,1)}setSize(b){let v=this.r.getDrawingBufferSize(new y.Vector2);this.rt.setSize(v.x,v.y),this.mat.uniforms.uTexel.value.set(1/v.x,1/v.y),this.mat.uniforms.uW.value=b*this.r.getPixelRatio()}render(b,v){let M=this.r;v.layers.set(K),M.setRenderTarget(this.rt),M.setClearColor(0,0),M.clear(),M.render(b,v),v.layers.set(0),M.setRenderTarget(null),M.clear(),M.render(b,v),M.autoClear=!1,M.render(this.qs,this.qc),M.autoClear=!0}}let Ot=new at(R),ut="varying vec3 vN; void main(){ vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",Le=`
  uniform vec3 uSide; uniform vec3 uTop; uniform vec3 uWarnCol; uniform float uOpacity; uniform float uWarn; varying vec3 vN;
  void main() {
    vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
    float t = smoothstep(0.3, 0.95, n.y);        // upward faces read a touch lighter, like the safety tops
    vec3 col = mix(mix(uSide, uTop, t), uWarnCol, uWarn * 0.08);
    gl_FragColor = vec4(col, uOpacity);
    #include <colorspace_fragment>
  }`,_e=1,ye=[];function Ie(f,b){let v=new Float32Array(b,f.pos,f.nv*3),M=new Uint32Array(b,f.idx,f.nf*3),rt=new Uint32Array(b,f.edge,f.ne*2),Z=new y.BufferGeometry;Z.setAttribute("position",new y.BufferAttribute(v,3)),Z.setIndex(new y.BufferAttribute(M,1)),Z.computeVertexNormals();let it=new Float32Array(f.ne*6);for(let tt=0;tt<f.ne;tt++){let pt=rt[tt*2]*3,At=rt[tt*2+1]*3;it.set([v[pt],v[pt+1],v[pt+2],v[At],v[At+1],v[At+2]],tt*6)}let ft=new y.Box3(new y.Vector3(...f.min),new y.Vector3(...f.max));if(!/^tire/.test(f.name))return{name:f.name,kind:"car",geo:Z,seg:it,box:ft};let st=ft.getCenter(new y.Vector3);Z.translate(-st.x,-st.y,-st.z);for(let tt=0;tt<it.length;tt+=3)it[tt]-=st.x,it[tt+1]-=st.y,it[tt+2]-=st.z;return{name:f.name,kind:"car",geo:Z,seg:it,box:ft,pivot:st.toArray(),roll:!0}}function Fe({name:f,geo:b,pivot:v,spin:M}){let rt=new y.EdgesGeometry(b,30).attributes.position.array;b.computeBoundingBox();let Z=b.boundingBox.clone();if(M){let it=Math.max(-Z.min.x,Z.max.x,-Z.min.y,Z.max.y);Z.min.x=Z.min.y=-it,Z.max.x=Z.max.y=it}return{name:f,kind:"engine",geo:b,seg:rt,pivot:v,spin:M,box:Z.translate(new y.Vector3(...v))}}function j({name:f,kind:b,geo:v,seg:M,box:rt,pivot:Z=[0,0,0],spin:it=0,roll:ft=!1}){let st={value:1},tt={value:0},pt=new y.ShaderMaterial({uniforms:{uSide:{value:new y.Color(ce.side)},uTop:{value:new y.Color(ce.top)},uWarnCol:{value:Ve},uOpacity:st,uWarn:tt},vertexShader:ut,fragmentShader:Le,side:y.DoubleSide,polygonOffset:!0,polygonOffsetFactor:1,polygonOffsetUnits:1,transparent:!0}),At=_e++,mt=new y.ShaderMaterial({uniforms:{uId:{value:new y.Vector2((At&255)/255,(At>>8&255)/255)},uOpacity:st,uWarn:tt},vertexShader:"void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:"uniform vec2 uId; uniform float uOpacity; uniform float uWarn; void main(){ gl_FragColor = vec4(uId, uOpacity, 1.0 - 0.45 * uWarn); }",side:y.DoubleSide}),Lt=new Zt;Lt.setPositions(M);let jt=new y.Color(b==="car"?ce.carEdge:ce.engineEdge),zt=new Yt({color:jt.clone(),linewidth:.6,worldUnits:!1,transparent:!0});ye.push(zt);let Bt=new y.Group,ot=new y.Group;ot.position.set(...Z);let Xt=new y.Mesh(v,pt),ge=new y.Mesh(v,mt);return ge.layers.set(K),ot.add(Xt,ge,new oe(Lt,zt)),Bt.add(ot),{name:f,kind:b,group:Bt,spinner:ot,spin:it,roll:ft,opacity:st,warn:tt,fill:pt,lineMat:zt,baseColor:jt,box:rt,center:rt.getCenter(new y.Vector3),size:rt.getSize(new y.Vector3)}}function N(f){let b=q(f);return b.v[1]*=.72,b}function q(f){let b=f.name,v=Math.sign(f.center.x)||1;return/^tire_cap/.test(b)?{v:[v*3,0,0],k:.35}:/^tire_rim/.test(b)?{v:[v*2.25,0,0],k:.3}:/^tire_\d/.test(b)?{v:[v*1.5,0,0],k:.25}:b==="car_hood"?{v:[0,2.6,.5],k:1}:/windshield|Object_26|Object_27/.test(b)?{v:[0,3.25,.3],k:.95}:b==="car_body"?{v:[0,1.85,0],k:.85}:b==="dor handels"?{v:[0,1.75,0],k:.8}:b==="car_doors"?{v:[0,1.35,0],k:.75}:/interior|Object_25/.test(b)?{v:[0,1,-.35],k:.7}:/front_light_cap|front_light_03/.test(b)?{v:[0,.35,2.2],k:.6}:/front_light|front_grill_frame/.test(b)?{v:[0,.1,1.85],k:.55}:b==="front_bumper"?{v:[0,-.25,1.6],k:.5}:b==="front_grill"?{v:[0,-.45,0],k:.45}:b==="back_lights"?{v:[0,.2,-1.9],k:.55}:b==="exhaust"?{v:[0,-.5,-1.6],k:.4}:b==="back_plate"?{v:[0,-1.65,0],k:.15}:b==="car_bottom"?{v:[0,-1.05,0],k:.1}:{v:f.center.clone().sub(new y.Vector3(0,1.2,0)).multiplyScalar(.6).toArray(),k:.5}}let C=new y.Vector3(1,.62,1.12).normalize(),B=new y.OrthographicCamera(-1,1,1,-1,.1,400),U={mix:0,wide:0},W={level:0},H={v:1},z={v:1},G={deg:-26},lt=[],Y=[],et=[],L=[],Q=[],nt=null,Mt=null,O=new y.Box3,ct=new y.Box3,ht=f=>lt.find(b=>b.name===f),Ct,bt,Pt={hw:1,hh:1},dt={hw:1,hh:1},Tt={hw:1,hh:1},Vt=f=>new URL(`../../${_t[`car/${f}`]}`,import.meta.url);async function se(){let[f,b]=await Promise.all([fetch(Vt("parts.json")).then(M=>{if(!M.ok)throw new Error(`parts.json ${M.status}`);return M.json()}),fetch(Vt("parts.bin")).then(M=>{if(!M.ok)throw new Error(`parts.bin ${M.status}`);return M.arrayBuffer()})]);Y=f.parts.filter(M=>M.group==="car").map(M=>j(Ie(M,b))),et=Hn().map(M=>j(Fe(M))),lt=[...Y,...et];for(let M of lt)I.add(M.group);L=et.filter(M=>M.spin),Q=Y.filter(M=>M.roll),nt=et.find(M=>M.name===qe);let v=M=>M.reduce((rt,Z)=>rt.union(Z.box),new y.Box3);O=v(Y),ct=v(et),Ct=O.getCenter(new y.Vector3),bt=ct.getCenter(new y.Vector3);for(let M of Y)M.move=N(M);[...Y].sort((M,rt)=>new y.Vector3(...rt.move.v).length()-new y.Vector3(...M.move.v).length()).forEach((M,rt,Z)=>{M.fadeRank=rt/(Z.length-1)}),nt.move={v:[0,On,0]},te(),Mt=Oe()}function te(){let f=new y.Vector3,b=new y.Vector3,v=new y.Matrix4().lookAt(C,new y.Vector3,new y.Vector3(0,1,0)).invert(),M=(Z,it,ft,st)=>{I.rotation.y=ft*Ge,I.updateMatrixWorld(!0),b.copy(st).applyMatrix4(I.matrixWorld).applyMatrix4(v);let tt=0,pt=0;for(let At of Z){let mt=At.box.clone();it&&At.move&&mt.translate(new y.Vector3(...At.move.v).multiplyScalar(it));for(let Lt=0;Lt<8;Lt++)f.set(Lt&1?mt.max.x:mt.min.x,Lt&2?mt.max.y:mt.min.y,Lt&4?mt.max.z:mt.min.z).applyMatrix4(I.matrixWorld).applyMatrix4(v),tt=Math.max(tt,Math.abs(f.x-b.x)),pt=Math.max(pt,Math.abs(f.y-b.y))}return{hw:tt,hh:pt}},rt=(Z,it,ft,st=[0,1])=>{let tt={hw:0,hh:0};for(let pt of it)for(let At of st){let mt=M(Z,At,pt,ft);tt.hw=Math.max(tt.hw,mt.hw),tt.hh=Math.max(tt.hh,mt.hh)}return tt};Pt=rt(Y,[-26,-18,-12,-4,10,20],Ct,[0,1,Te]),dt=rt(et,[16,20,24],bt,[0]),Tt=rt(et,[16,20,24],bt,[1]),I.rotation.y=G.deg*Ge}function Oe(){let f=gs({autoplay:!1}),b="inOutCubic",v=Fn;f.add(G,{deg:[{to:-12,duration:v,ease:"inOutSine"},{to:16,duration:v,ease:"inOutSine"},{to:24,duration:v,ease:"inOutSine"},{to:20,duration:v*.3,ease:"inOutSine"},{to:-26,duration:v*.7,ease:"inOutSine"}]},0);for(let M of Y){let[rt,Z,it]=M.move.v,ft=M.move.k,st=M.fadeRank;f.add(M.group.position,{x:rt,y:Z,z:it,duration:1400,ease:b},350+(1-ft)*500),f.add(M.group.position,{x:rt*Te,y:Z*Te,z:it*Te,duration:900,ease:"outSine"},v+st*150),f.add(M.opacity,{value:[{to:0,duration:450,ease:"inOutSine"}]},v+st*250),f.add(M.opacity,{value:[{to:1,duration:400,ease:"inOutSine"}]},v*3+1300+(1-st)*150),f.add(M.group.position,{x:0,y:0,z:0,duration:550,ease:b},v*3+1650+(1-ft)*100)}return f.add(z,{v:[{to:0,duration:450,ease:"inOutSine"}]},100),f.add(z,{v:[{to:1,duration:500,ease:"inOutSine"}]},Jt-520),f.add(U,{mix:[{to:1,duration:1900,ease:b}]},v+150),f.add(W,{level:[{to:1,duration:300,ease:"inOutSine"}]},v+100),f.add(H,{v:[{to:0,duration:700,ease:"inOutSine"}]},v*2),f.add(nt.group.position,{y:On,duration:1100,ease:b},v*2+900),f.add(U,{wide:[{to:1,duration:1100,ease:b}]},v*2+900),f.add(W,{level:[{to:0,duration:450,ease:"inOutSine"}]},v*3+50),f.add(nt.group.position,{y:0,duration:650,ease:b},v*3+350),f.add(U,{wide:[{to:0,duration:650,ease:b}]},v*3+350),f.add(H,{v:[{to:1,duration:800,ease:"inOutSine"}]},v*3+500),f.add(U,{mix:[{to:0,duration:850,ease:b}]},v*3+750),f.add({duration:1},Jt-1),f}let Rt=1,Dt=1,gt=0,Gt=matchMedia("(min-width: 901px)"),Ht={};function Pe(){Ht.car=Gt.matches?Re(i,"data-car-layout",[.23,.15,.93,1]):Re(i,"data-car-layout-mobile",[.02,.04,.98,.96]),Ht.engine=Gt.matches?Re(i,"data-engine-layout",[.36,.04,.86,.98]):Re(i,"data-engine-layout-mobile",[.04,.04,.96,.96]);let f=b=>{let v=parseFloat(i.getAttribute(b));return v>0?v:1};Ht.carZoom=f("data-car-zoom"),Ht.engineZoom=f("data-engine-zoom"),D()}Pe(),Gt.addEventListener("change",Pe),new MutationObserver(Pe).observe(i,{attributes:!0,attributeFilter:["data-car-layout","data-engine-layout","data-car-layout-mobile","data-engine-layout-mobile","data-car-zoom","data-engine-zoom"]});let an=()=>[Math.max(1,i.clientWidth),Math.max(1,i.clientHeight)];function De(){[Rt,Dt]=an(),R.setPixelRatio(Math.min(devicePixelRatio||1,2)),R.setSize(Rt,Dt,!1);for(let f of ye)f.resolution.set(Rt,Dt);Ot.setSize(.65),w.setAttribute("viewBox",`0 0 ${Rt} ${Dt}`),D()}new ResizeObserver(De).observe(i);function ze(){return!o&&P&&!document.hidden&&!!Mt}D=()=>{if(!ze()){cancelAnimationFrame(gt),gt=0;return}gt||(k=performance.now(),gt=requestAnimationFrame(cn))},m.addEventListener("webglcontextlost",f=>{f.preventDefault(),cancelAnimationFrame(gt),gt=0,R.dispose(),g()}),document.addEventListener("visibilitychange",D),Pn.addEventListener("change",D),new IntersectionObserver(f=>{P=f[f.length-1].isIntersecting,D()}).observe(i);let rn=new y.Vector3,ln=new y.Vector3;function cn(f){if(gt=0,!ze())return;let b=Ae((f-k)/1e3,0,.1);k=f;let[v,M]=an();(v!==Rt||M!==Dt||R.getPixelRatio()!==Math.min(devicePixelRatio||1,2))&&De(),T=le()?S:T+(S-T)*(1-Math.exp(-b*5)),Math.abs(T-S)<1e-4&&(T=S),Mt.seek(T*Jt);let rt=le()?0:2.5*Math.sin(f/9e3*Math.PI*2);I.rotation.y=(G.deg+rt)*Ge,I.updateMatrixWorld(!0),rn.copy(Ct).applyMatrix4(I.matrixWorld),ln.copy(bt).applyMatrix4(I.matrixWorld);let Z=rn.lerp(ln,U.mix);B.position.copy(Z).addScaledVector(C,60),B.lookAt(Z);let it=(ot,Xt,ge)=>{let un=l&&Rt<640?Math.max(100,Dt-72):Dt,Xn=Rt*(ot[2]-ot[0]),fn=un*(ot[3]-ot[1]);return{wpp:2*Math.max(Xt.hw/(Xn/fn),Xt.hh)*ge/fn,cx:Rt*(ot[0]+ot[2])/2,cy:un*(ot[1]+ot[3])/2}},ft=it(Ht.car,Pt,1.06/Ht.carZoom),st=it(Ht.engine,dt,1.42/Ht.engineZoom),tt=it(Ht.engine,Tt,1.3/Ht.engineZoom),pt=U.mix,At=st.wpp*Math.pow(tt.wpp/st.wpp,U.wide),mt=ft.wpp*Math.pow(At/ft.wpp,pt),Lt=ft.cx+(st.cx-ft.cx)*pt,jt=ft.cy+(st.cy-ft.cy)*pt;B.left=-Lt*mt,B.right=(Rt-Lt)*mt,B.top=jt*mt,B.bottom=-(Dt-jt)*mt,$e=1/mt,B.updateProjectionMatrix();let zt=le()?0:1;for(let ot of L)ot.spinner.rotation.z-=b*ot.spin*H.v*zt;for(let ot of Q)ot.spinner.rotation.x+=b*3.2*z.v*zt;let Bt=zt?.5+.5*Math.cos(f/1e3*Math.PI*2*1.5):1;nt.warn.value=W.level*(.3+.7*Bt),nt.lineMat.color.copy(nt.baseColor).lerp(Ve,nt.warn.value);for(let ot of lt){let Xt=ot.opacity.value;ot.group.visible=Xt>.01,ot.fill.depthWrite=Xt>.98,ot.lineMat.opacity=Xt}Ot.render(E,B),jn(T*Jt,Bt),ze()&&!le()&&!gt&&(gt=requestAnimationFrame(cn))}let ie=In(w),Be=new y.Vector3,$e=1,he=f=>(Be.copy(f).applyMatrix4(I.matrixWorld).project(B),[(Be.x+1)/2*Rt,(1-Be.y)/2*Dt]),dn=(f,b,v)=>new y.Vector3(f,b,v),ee=(f,b,v)=>Math.min(1,Math.max(0,(f-b)/(v-b))),hn=f=>f.center.clone().add(f.group.position),It=Fn,Gn=["front_windshield","car_hood","car_body","tire_04","front_bumper","back_lights"];function jn(f,b){ie.begin();let v=Rt<640;r(f/Jt);let M=O,rt=M.min.y+.01,Z=f<It*2?{draw:1,alpha:1-ee(f,220,620)}:{draw:ee(f,Jt-380,Jt-20),alpha:1};ie.line("cl",[he(dn(0,rt,M.min.z-.9)),he(dn(0,rt,M.max.z+.9))],{...Z,dash:"14 4 2 4",alpha:Z.alpha*.7});let it={draw:ee(f,650,1900),alpha:1-ee(f,It,It+380)};Gn.forEach((Lt,jt)=>{let zt=ht(Lt);if(!zt)return;let Bt=he(zt.center),ot=he(hn(zt));Math.hypot(ot[0]-Bt[0],ot[1]-Bt[1])<6||(ie.line(`tr${jt}`,[Bt,ot],{...it,dash:"3 4",color:vt.warn}),ie.circle(`tr${jt}o`,Bt[0],Bt[1],2.5,{alpha:it.alpha*Math.min(1,it.draw*3),color:vt.text}))});let ft=hn(nt),st=he(ft),tt=f>=It*3+50,pt=f<It*2+850?["EXPLOIT CONFIRMED","ATTACK PATH · VALIDATED",It+200]:tt?["RETEST PASSED","ATTACK PATH · CLOSED",It*3+50]:["DEFENSES UNDER TEST","VALIDATION · IN PROGRESS",It*2+850],At={draw:Math.min(ee(f,It+150,It+900),.55+.45*ee(f,pt[2],pt[2]+600)),alpha:1-ee(f,It*3+650,It*3+950)},mt=Rt-st[0]-st[0];ie.reticle("fault",st,.36*$e,v?"":pt[0],v?"":pt[1],{...At,color:tt?vt.bright:vt.warn,pulse:tt?1:b,flip:v?mt<0:st[0]+.36*$e+220>Rt}),ie.end()}De(),se().then(()=>{i.classList.add("car-ready"),i.dataset.renderer="threejs",D()}).catch(f=>{cancelAnimationFrame(gt),gt=0,R.dispose(),g(f)}),i.carScene={get progress(){return T},get target(){return S},seek(f){S=T=Ae(Number(f)||0),D()},parts:()=>lt,timeline:()=>Mt}}let _=new IntersectionObserver(R=>{if(R.some(E=>E.isIntersecting)){_.disconnect();try{$()}catch(E){g(E)}}},{rootMargin:"500px"});_.observe(i)}function Dn(){document.querySelectorAll("[data-car-scene]").forEach(ws)}import*as x from"https://cdn.jsdelivr.net/npm/three@0.184.0/+esm";import{animate as je,createTimeline as Es,splitText as Ke,stagger as ke}from"https://cdn.jsdelivr.net/npm/animejs@4.5.0/+esm";var V={outline:"#333333",edge:"#7A7A7A",main:"#666666",det:"#8F8F8F",dash:"#CCCCCC",faint:"#E3E3E3",side:"#FFFFFF",top:"#E9E9E9",tone:"#FFFFFF"},Bn=8e3,Ce=320,St=Math.PI/180,de=i=>new x.Vector3(i[0],i[2],i[1]),Xe=new Map;function Ft(i,e=x.FrontSide){let t=i+e;return Xe.has(t)||Xe.set(t,new x.MeshBasicMaterial({color:i,side:e,polygonOffset:!0,polygonOffsetFactor:1,polygonOffsetUnits:1})),Xe.get(t)}var pe=new Map;function Ss(i,e,t){let n=`${i}|${e}|${t?1:0}`;if(!pe.has(n)){let s=new Yt({color:new x.Color(i),linewidth:e,dashed:!!t,dashSize:2.4,gapSize:2.8,worldUnits:!1,transparent:!!t});s.userData.base=e,pe.set(n,s)}return pe.get(n)}var Ms=new x.Vector3(1,1,1).normalize(),$n=1,Ts=1;function As(){let i=Ts++;return new x.ShaderMaterial({uniforms:{uId:{value:new x.Vector3((i&255)/255,(i>>8&255)/255,.5)}},vertexShader:"void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:"uniform vec3 uId; void main() { gl_FragColor = vec4(uId, 1.0); }",side:x.DoubleSide})}var Qe=class{constructor(e){this.renderer=e,this.rt=new x.WebGLRenderTarget(1,1,{minFilter:x.NearestFilter,magFilter:x.NearestFilter,depthTexture:new x.DepthTexture(1,1)}),this.mat=new x.ShaderMaterial({uniforms:{tId:{value:this.rt.texture},tDepth:{value:this.rt.depthTexture},uTexel:{value:new x.Vector2(1,1)},uW:{value:2},uColor:{value:new x.Color(V.outline)}},vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",fragmentShader:`
        uniform sampler2D tId;
        uniform sampler2D tDepth;
        uniform vec2 uTexel;
        uniform float uW;
        uniform vec3 uColor;
        varying vec2 vUv;
        float hit(vec4 c, float d, vec2 o) {
          vec4 c2 = texture2D(tId, vUv + o * uTexel);
          if (c2.a < 0.5) return 1.0;                                   // background
          float d2 = texture2D(tDepth, vUv + o * uTexel).x;
          return (distance(c2.rgb, c.rgb) > 0.001 && d2 > d + 0.0004) ? 1.0 : 0.0;  // another, farther part
        }
        void main() {
          vec4 c = texture2D(tId, vUv);
          if (c.a < 0.5) discard;                                        // lines sit on the part, not outside it
          float d = texture2D(tDepth, vUv).x;
          float h = 0.0;
          for (int i = 0; i < 12; i++) {
            float a = float(i) * 0.5235988;
            vec2 dir = vec2(cos(a), sin(a));
            h += hit(c, d, dir * uW) + hit(c, d, dir * uW * 0.5);
          }
          float alpha = clamp(h / 5.0, 0.0, 1.0);
          if (alpha <= 0.0) discard;
          gl_FragColor = vec4(uColor, alpha);
          #include <colorspace_fragment>
        }`,transparent:!0,depthTest:!1,depthWrite:!1}),this.quad=new x.Mesh(new x.PlaneGeometry(2,2),this.mat),this.quad.frustumCulled=!1,this.qscene=new x.Scene,this.qscene.add(this.quad),this.qcam=new x.OrthographicCamera(-1,1,1,-1,0,1)}setSize(e){let t=this.renderer.getDrawingBufferSize(new x.Vector2);this.rt.setSize(t.x,t.y),this.mat.uniforms.uTexel.value.set(1/t.x,1/t.y),this.mat.uniforms.uW.value=e*this.renderer.getPixelRatio()}render(e,t){let n=this.renderer;t.layers.set($n),n.setRenderTarget(this.rt),n.setClearColor(0,0),n.clear(),n.render(e,t),t.layers.set(0),n.setRenderTarget(null),n.clear(),n.render(e,t),n.autoClear=!1,n.render(this.qscene,this.qcam),n.autoClear=!0}};function Ze(i,e,t,n=64){let s=[];for(let a=0;a<n;a++){let l=a/n*Math.PI*2,o=t*Math.cos(l),r=t*Math.sin(l);s.push(e==="x"?[i[0],i[1]+o,i[2]+r]:e==="y"?[i[0]+o,i[1],i[2]+r]:[i[0]+o,i[1]+r,i[2]])}return s}function Rs(i,e){let t=new x.Matrix4;return e==="x"?t.makeRotationZ(-Math.PI/2):e==="y"&&t.makeRotationX(Math.PI/2),t.setPosition(de(i)),t}var He=class{constructor(e,t=null){this.group=e,this.idMat=t,this.segs=new Map}pushSegs(e,t,n,s){let a=`${e}|${t}|${n?1:0}`;this.segs.has(a)||this.segs.set(a,{color:e,width:t,dashed:n,arr:[]});let l=this.segs.get(a).arr;for(let o=0;o<s.length;o++)l.push(s[o])}addLine(e,t,n,s,a){let l=[],o=e.map(de);for(let r=0;r<o.length-1;r++)l.push(o[r].x,o[r].y,o[r].z,o[r+1].x,o[r+1].y,o[r+1].z);if(t&&o.length>2){let r=o[o.length-1],h=o[0];l.push(r.x,r.y,r.z,h.x,h.y,h.z)}this.pushSegs(n,s,a,l)}addEdges(e,t=V.edge,n=1,s=25){let a=new x.EdgesGeometry(e,s);this.pushSegs(t,n,!1,a.attributes.position.array),a.dispose()}mesh(e,t){let n=new x.Mesh(e,t);if(this.group.add(n),this.idMat){let s=new x.Mesh(e,this.idMat);s.layers.set($n),this.group.add(s)}return n}box(e,t,n,s,a,l,o={}){let r=new x.BoxGeometry(t-e,l-a,s-n);r.translate(...de([(e+t)/2,(n+s)/2,(a+l)/2]).toArray());let h=Ft(o.fx||V.side),c=Ft(o.fy||V.side);this.mesh(r,[h,h,Ft(o.top||V.top),Ft(V.side),c,c]),this.addEdges(r,V.edge,1,20)}cyl(e,t,n,s,a={}){let l=a.n||48,o=a.a0||0,r=a.r1??n,h=Rs(e,t),c=t==="x"?[e[0]+s,e[1],e[2]]:t==="y"?[e[0],e[1]+s,e[2]]:[e[0],e[1],e[2]+s],d=u=>(u.translate(0,s/2,0),u.applyMatrix4(h),u);if(a.hole){this.mesh(d(new x.CylinderGeometry(r,n,s,l,1,!0,o)),Ft(V.side)),this.mesh(d(new x.CylinderGeometry(a.hole,a.hole,s,l,1,!0,o)),Ft(V.side,x.DoubleSide));let u=new x.RingGeometry(a.hole,r,l);u.rotateX(-Math.PI/2),u.translate(0,s/2,0);let p=new x.RingGeometry(a.hole,n,l);p.rotateX(Math.PI/2),p.translate(0,-s/2,0),this.mesh(d(u),Ft(a.cap||V.side)),this.mesh(d(p),Ft(V.side));for(let[A,F]of[[e,n],[c,r]])this.addLine(Ze(A,t,F),!0,V.edge,1),this.addLine(Ze(A,t,a.hole),!0,V.det,.8)}else{let u=d(new x.CylinderGeometry(r,n,s,l,1,!1,o));this.mesh(u,[Ft(V.side),Ft(a.cap||V.side),Ft(V.side)]),this.addEdges(u,V.edge,1,25)}}cylZ(e,t,n,s,a,l={}){this.cyl([e,t,n],"z",a,s,l)}cylA(e,t,n,s,a={}){this.cyl(e,t,n,s,a)}ring(e,t,n,s={}){if(this.addLine(Ze(e,t,n),!0,s.stroke||V.det,s.w||.8,!!s.dash),s.fill){let a=new x.CircleGeometry(n,48);t==="z"?a.rotateX(-Math.PI/2):t==="x"&&a.rotateY(Math.PI/2),a.translate(...de(e).toArray()),this.mesh(a,Ft(s.fill,x.DoubleSide))}}poly(e,t={}){this.addLine(e,t.closed!==!1,t.stroke||V.det,t.w||.8,!!t.dash)}line(e,t,n={}){this.addLine([e,t],!1,n.stroke||V.dash,n.w||.8,n.dash===void 0?!0:!!n.dash)}finish(){for(let{color:e,width:t,dashed:n,arr:s}of this.segs.values()){let a=new Zt;a.setPositions(s);let l=new oe(a,Ss(e,t,n));n&&l.computeLineDistances(),this.group.add(l)}this.segs.clear()}},Je={guard(){let i=[45,135,225,315].map(s=>[32*Math.cos(s*St),32*Math.sin(s*St)]),e=[i[0],i[2]],t=[-61,0,18],n=[{anchor:[-61,0,1],lift:[-10,0,0],k:.35,label:{n:"02",text:"SCOPE RULES",side:"l",at:[-72,16,-8]},draw:s=>{s.box(-72,-50,-16,16,-16,18),[-20,20,60,100].forEach((a,l)=>{let o=a*St,r=10.5,h=12.5+l*1.4;s.poly([[t[0]+r*Math.cos(o),t[1]+r*Math.sin(o),18],[t[0]+h*Math.cos(o),t[1]+h*Math.sin(o),18]],{closed:!1,stroke:l===2?V.main:V.det,w:l===2?1.2:.8})}),s.cylA([-50,0,-2],"x",6,4)}},{anchor:[-61,0,22],lift:[-10,0,18],k:.8,label:{n:"01",text:"TEST PROFILE",side:"l",at:[-67,6,25]},draw:s=>{s.cylZ(t[0],t[1],18,7,8,{cap:V.top}),s.cylZ(t[0],t[1],25,3,4.5,{cap:V.top});let a=60*St;s.poly([[t[0]+4.8*Math.cos(a),t[1]+4.8*Math.sin(a),25],[t[0]+7.6*Math.cos(a),t[1]+7.6*Math.sin(a),25]],{closed:!1,stroke:V.main,w:1.4})}},{anchor:[-34,0,0],lift:[62,0,0],k:.55,label:{n:"03",text:"AGGRESSION LEVEL",side:"r",at:[-34,-15.5,15.5]},draw:s=>{s.cylA([-35,0,0],"x",22,2.2);for(let a of[-7,7])s.ring([-32.7,a,0],"x",1.4)}},{anchor:[-33,0,0],draw:s=>{s.cylA([-46,0,0],"x",29,26,{hole:23}),s.cylA([-20,0,0],"x",38,6,{hole:23});for(let[a,l]of i)s.ring([-14,a,l],"x",2.6)}},{anchor:[-32,0,0],lift:[62,0,0],k:.55,draw:s=>s.cylA([-33.9,-46,0],"y",2.2,92)},{anchor:[-13,0,0],lift:[88,0,0],k:.7,draw:s=>{s.cylA([-14,0,0],"x",38,2,{hole:26});for(let[a,l]of i)s.ring([-12,a,l],"x",2.6)}}];return e.forEach(([s,a],l)=>{n.push({anchor:[-3,s,a],lift:[114,0,0],k:.92,label:l===0?{n:"04",text:"EXECUTION LIMITS",side:"r",at:[6.5,s,a+5]}:null,draw:o=>{o.cylA([-12,s,a],"x",2.6,14),o.cylA([2,s,a],"x",5,4.5,{n:6})}})}),{parts:n,guides:s=>{s.line([-100,0,0],[128,0,0]);for(let[a,l]of e)s.line([-14,a,l],[116,a,l]);s.line([28,-58,0],[28,58,0]),s.line([-71,0,18],[-71,0,52])}}},bounds(){let i=[-16,0,16];return{parts:[{anchor:[0,-84,0],lift:[0,-26,0],k:.9,label:{n:"01",text:"TRAFFIC PROXY",side:"r",at:[0,-80,11]},draw:t=>{t.cylA([0,-96,0],"y",11,24,{hole:8})}},{anchor:[0,-67,0],lift:[0,-12,0],k:.7,draw:t=>{t.cylA([0,-72,0],"y",20,10,{n:6}),t.ring([0,-62,0],"y",11)}},{anchor:[0,-40,0],lift:[0,52,0],k:.4,label:{n:"02",text:"SCOPE ENFORCEMENT",side:"r",at:[10.6,-30,10.6]},draw:t=>{t.cylA([0,-60,0],"y",15,42,{hole:11});for(let n=-40;n<=130;n+=12){let s=15*Math.cos(n*St),a=15*Math.sin(n*St);t.poly([[s,-59,a],[s,-19,a]],{closed:!1,stroke:"#6E6E6E",w:.55})}for(let n=-56;n<=-22;n+=4.5){let s=[];for(let a=0;a<=24;a++){let l=(-45+a*7.5)*St;s.push([15*Math.cos(l),n,15*Math.sin(l)])}t.poly(s,{closed:!1,stroke:"#6E6E6E",w:.55})}}},{anchor:[0,-39,0],draw:t=>{t.cylA([0,-62,0],"y",22,46,{hole:18}),t.cylZ(0,-39,21,3,7,{cap:V.top}),t.ring([0,-39,24],"z",3)}},{anchor:[0,-11,0],lift:[0,56,0],k:.55,draw:t=>{t.cylA([0,-16,0],"y",20,10,{n:6}),t.ring([0,-6,0],"y",11)}},{anchor:[0,2,0],lift:[0,88,0],k:.78,label:{n:"03",text:"ALLOWED PATHS",side:"l",at:[-26,10,13]},draw:t=>{t.box(-26,26,-6,10,-13,13);for(let n of i)t.cylA([n,10,0],"y",6,12,{hole:4})}},{anchor:[16,24,0],lift:[0,108,0],k:.95,label:{n:"04",text:"EXCLUDED TARGETS",side:"l",at:[9,27,0]},draw:t=>{t.cylA([16,22,0],"y",7,5);let n=27.1;t.poly([[12,n,-4],[20,n,4]],{closed:!1,stroke:V.main,w:1.2}),t.poly([[12,n,4],[20,n,-4]],{closed:!1,stroke:V.main,w:1.2})}}],guides:t=>{t.line([0,-132,0],[0,140,0]);for(let n of[-16,16])t.line([n,10,0],[n,140,0])}}},health(){return{parts:[{anchor:[-1,0,-92],draw:t=>{t.cylA([-26,0,-92],"x",5,14),t.box(-12,10,-12,12,-104,-80),t.cylA([10,0,-92],"x",5,14,{hole:3}),t.cylA([-1,12,-92],"y",2.2,8)}},{anchor:[-1,0,-60],label:{n:"04",text:"ACTIVITY FEED",side:"l",at:[-5.5,0,-56]},draw:t=>{t.cylZ(-1,0,-80,42,4.5),t.cylZ(-1,0,-70,7,8,{n:6,cap:V.top})}},{anchor:[-1,21,-92],lift:[0,18,0],k:.9,label:{n:"03",text:"OPERATOR CONTROL",side:"l",at:[-1,23,-79]},draw:t=>{t.cylA([-1,20,-92],"y",13,3,{hole:10});for(let n of[45,135,225,315]){let s=n*St;t.poly([[-1+3.5*Math.cos(s),23.1,-92+3.5*Math.sin(s)],[-1+10*Math.cos(s),23.1,-92+10*Math.sin(s)]],{closed:!1,stroke:V.main,w:1})}t.cylA([-1,20,-92],"y",3.5,4.5,{cap:V.top})}},{anchor:[-5,0,0],lift:[0,0,10],k:.3,draw:t=>t.cylA([-12,0,0],"x",38,14)},{anchor:[3,0,0],lift:[24,0,10],k:.5,label:{n:"01",text:"CAMPAIGN HEALTH",side:"r",at:[4.2,-22,22]},draw:t=>{t.cylA([2,0,0],"x",34,2);let n=4.2;for(let a=0;a<=20;a++){let l=(225-a*13.5)*St,o=a%5===0,r=a>=17,h=o?24:27.5,c=30;t.poly([[n,-h*Math.cos(l),h*Math.sin(l)],[n,-c*Math.cos(l),c*Math.sin(l)]],{closed:!1,stroke:o||r?V.main:V.det,w:r?1.5:o?1:.7})}let s=[];for(let a=0;a<=40;a++){let l=(225-a*6.75)*St;s.push([n,-21*Math.cos(l),21*Math.sin(l)])}t.poly(s,{closed:!1,w:.6}),t.ring([n,0,-12],"x",6,{w:.6})}},{anchor:[5,0,0],lift:[42,0,10],k:.66,label:{n:"02",text:"LIVE STATUS",side:"r",at:[5.2,-25*Math.cos(100*St),25*Math.sin(100*St)]},draw:t=>{let n=100*St;t.poly([[5.2,6*Math.cos(n),-6*Math.sin(n)],[5.2,-25*Math.cos(n),25*Math.sin(n)]],{closed:!1,stroke:V.main,w:1.4}),t.cylA([4,0,0],"x",3,2.5,{cap:V.top})}},{anchor:[8,0,0],lift:[60,0,10],k:.8,draw:t=>{t.ring([8,0,0],"x",34,{stroke:V.det,w:.8}),t.poly([[8,10,24],[8,20,14]],{closed:!1,w:.7}),t.poly([[8,4,26],[8,8,22]],{closed:!1,w:.7})}},{anchor:[11,0,0],lift:[80,0,10],k:.95,draw:t=>t.cylA([9,0,0],"x",40,5,{hole:34})}],guides:t=>{t.line([-24,0,10],[100,0,10]),t.line([-1,0,-112],[-1,0,-28]),t.line([-1,10,-92],[-1,46,-92])}}},logs(){let i=[12,20,28],e=[{anchor:[0,0,22],label:{n:"04",text:"CAMPAIGN RECORD",side:"l",at:[-40,26,18]},draw:t=>{t.box(-40,40,-26,26,0,44,{top:V.side});for(let n of[34,38.5])t.poly([[-40,26.05,n],[40,26.05,n]],{closed:!1,stroke:V.main,w:.9}),t.poly([[40.05,-26,n],[40.05,26,n]],{closed:!1,stroke:V.main,w:.9});t.box(-30,-12,26,30,6,14,{top:V.top});for(let n=0;n<5;n++)for(let s=0;s<2;s++)t.ring([-27+n*3,30.05,8.5+s*3],"y",.8,{w:.6})}},{anchor:[49,0,24],lift:[22,0,0],k:.6,label:{n:"03",text:"AUDIT REPORTS",side:"r",at:[52,-6,30]},draw:t=>{t.cylA([40,0,24],"x",6,18);for(let n of[46,52])t.ring([n,0,24],"x",6,{w:.7});t.ring([58.05,0,24],"x",2.5,{w:.7})}}];return i.forEach((t,n)=>{e.push({anchor:[0,0,t+1],lift:[0,0,44+n*4],k:.4+n*.15,label:n===2?{n:"01",text:"ACTION LOG",side:"r",at:[34,-20,t+2]}:n===0?{n:"02",text:"DECISION TRACE",side:"l",at:[-34,20,t+1]}:null,draw:s=>{s.box(-34,34,-20,20,t,t+2),s.box(-24,-8,-12,4,t+2,t+4.5,{top:V.top}),s.box(4,18,-14,-2,t+2,t+4),s.box(6,14,6,14,t+2,t+3.5);for(let a of[8,12,16])s.poly([[-30,a,t+2],[-4,a,t+2]],{closed:!1,w:.6})}})}),e.push({anchor:[0,0,46],lift:[0,0,50],k:.85,draw:t=>t.box(-42,42,-28,28,44,48)}),e.push({anchor:[0,0,55],lift:[0,0,62],k:.95,draw:t=>{t.box(-26,-20,-4,4,48,56),t.box(20,26,-4,4,48,56),t.box(-26,26,-4,4,56,60,{top:V.top})}}),{parts:e,guides:t=>{for(let[n,s]of[[40,-26],[-40,26],[40,26]])t.line([n,s,44],[n,s,100]);t.line([40,0,24],[86,0,24])}}}};function ks(i){let e=new x.Group,t=new x.Group;e.add(t);let n=i.parts.map((s,a)=>{let l=new x.Group,o=new x.Group;l.add(o),t.add(l);let r=new He(o,As());s.draw(r,{e:{}}),r.finish();let h=null;return s.label&&(h=new x.Object3D,h.position.copy(de(s.label.at)),o.add(h)),{part:s,group:l,float:o,anchor:h,i:a,lift:de(s.lift||[0,0,0])}});if(i.guides){let s=new He(t);i.guides(s,{e:{}}),s.finish()}return{root:e,reveal:t,parts:n,fx:{cam:0,line:0}}}function tn(i,e){for(let t of i.parts)t.group.position.copy(t.lift).multiplyScalar(e),t.float.position.set(0,0,0)}function Cs(i,e){i.labelBox=document.createElement("div"),i.labelBox.className="ss-labels",i.labelBox.hidden=!0,e.appendChild(i.labelBox);for(let t of i.parts){let n=t.part.label;if(!n)continue;let s=document.createElement("div");s.className="ss-lbl",s.dataset.side=n.side,s.innerHTML=`<span class="n">${n.n}</span><span class="t">${n.text}</span>`,i.labelBox.appendChild(s),t.lbl={el:s,n:Ke(s.querySelector(".n"),{chars:!0,accessible:!1}).chars,t:Ke(s.querySelector(".t"),{chars:!0,accessible:!1}).chars,w:0,h:0}}}function Hs(i,e){let t=Es({autoplay:!1,onComplete:e});for(let{part:n,group:s,float:a,lift:l,i:o}of i.parts){if(!n.lift)continue;let r=n.k||0,h={},c={};for(let d of["x","y","z"]){let u=l[d];Math.abs(u)<1e-6||(h[d]=[{to:-.03*u,duration:150,ease:"inOutSine"},{to:u,duration:900,ease:"outExpo"}],c[d]=[{to:-.025*u,duration:860,ease:"inOutCubic"},{to:0,duration:190,ease:"outCubic"}])}t.add(s.position,h,450+(1-r)*550),t.add(s.position,c,4900+r*500),t.add(a.position,{y:[{to:.9,duration:800,ease:"inOutSine"},{to:-.7,duration:1e3,ease:"inOutSine"},{to:0,duration:800,ease:"inOutSine"}]},2050+o%5*110)}return t.add(i.reveal.rotation,{y:[{to:11*St,duration:1950,ease:"inOutCubic"}]},350),t.add(i.reveal.rotation,{y:[{to:0,duration:2e3,ease:"inOutCubic"}]},4800),t.add(i.fx,{cam:[{to:1,duration:1950,ease:"inOutCubic"}]},350),t.add(i.fx,{cam:[{to:0,duration:2e3,ease:"inOutCubic"}]},4800),t.add(i.fx,{line:[{to:1,duration:600,ease:"outCubic"}]},1750),t.add(i.fx,{line:[{to:0,duration:380,ease:"inCubic"}]},4480),i.parts.filter(n=>n.lbl).forEach((n,s)=>{let a=2050+s*110;t.add(n.lbl.n,{opacity:[0,1],translateX:["0.7em","0em"],duration:650,ease:"outExpo",delay:ke(24)},a),t.add(n.lbl.t,{opacity:[0,1],translateX:["0.7em","0em"],color:["#CCCCCC","#6B6B6B"],duration:750,ease:"outExpo",delay:ke(16)},a+70),t.add([...n.lbl.n,...n.lbl.t],{opacity:0,translateX:"-0.3em",duration:260,ease:"inQuad",delay:ke(7,{from:"last"})},4250+s*40)}),t.add({duration:1},Bn-1),t}function Ls(){let i=new x.OrthographicCamera(-1,1,1,-1,1100,1900);return i.position.copy(Ms).multiplyScalar(1500),i.up.set(0,1,0),i.lookAt(0,0,0),i.updateMatrixWorld(!0),i}function _s(i,e,t,n,s,a){let l=e.matrixWorldInverse,o=1/0,r=-1/0,h=1/0,c=-1/0,d=new x.Box3,u=new x.Vector3,p=i.reveal.rotation.y,A=i.root.rotation.y,F=i.parts.map(T=>[T.group.position.clone(),T.float.position.clone()]);i.root.rotation.y=0;for(let T of[0,1])for(let P of[-5,0,16]){tn(i,T),i.reveal.rotation.y=P*St,i.root.updateMatrixWorld(!0),d.makeEmpty();for(let k of i.parts)d.expandByObject(k.group);for(let k=0;k<8;k++)u.set(k&1?d.max.x:d.min.x,k&2?d.max.y:d.min.y,k&4?d.max.z:d.min.z).applyMatrix4(l),o=Math.min(o,u.x),r=Math.max(r,u.x),h=Math.min(h,u.y),c=Math.max(c,u.y)}i.reveal.rotation.y=p,i.root.rotation.y=A,i.parts.forEach((T,P)=>{T.group.position.copy(F[P][0]),T.float.position.copy(F[P][1])});let m=Math.max((r-o)/(t-2*s),(c-h)/(n-2*a))*.92,w=(o+r)/2,S=(h+c)/2;return{left:w-t/2*m,right:w+t/2*m,top:S+n/2*m,bottom:S-n/2*m}}function zn(i,e){i.left=e.left,i.right=e.right,i.top=e.top,i.bottom=e.bottom,i.updateProjectionMatrix()}function Is(i,e,t){let n=Math.min(window.devicePixelRatio||1,2);i.width=Math.round(e*n),i.height=Math.round(t*n);let s=i.getContext("2d");return s.setTransform(n,0,0,n,0,0),s.lineCap="butt",s.lineJoin="miter",s}var Ye=i=>Math.max(0,Math.min(1,i));function Fs(i,e,t){let n=[],s=0;for(let l=1;l<e.length;l++){let o=Math.hypot(e[l][0]-e[l-1][0],e[l][1]-e[l-1][1]);n.push(o),s+=o}let a=s*t;i.beginPath(),i.moveTo(e[0][0],e[0][1]);for(let l=1;l<e.length&&a>0;l++){let o=n[l-1],r=Math.min(1,a/o);i.lineTo(e[l-1][0]+(e[l][0]-e[l-1][0])*r,e[l-1][1]+(e[l][1]-e[l-1][1])*r),a-=o}i.stroke()}var en=["guard","bounds","health","logs"],Os=Object.fromEntries(en.map(i=>[i,Je[i]().parts.filter(e=>e.label).map(e=>({number:e.label.n,text:e.label.text})).sort((e,t)=>e.number.localeCompare(t.number))]));function Ps(){if(document.getElementById("safety-scene-styles"))return;let i=document.createElement("style");i.id="safety-scene-styles",i.textContent=`
:where([data-safety-stage]){--ss-accent:#001e3c;--ss-font-mono:DegularMono,"Degular Mono",ui-monospace,"SF Mono",Menlo,monospace;position:relative;overflow:hidden}
:where([data-safety-canvas]){position:absolute;inset:0}
.ss-gl,.ss-ov,.ss-label-host{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.ss-gl,.ss-ov,.ss-label-host{transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .9s cubic-bezier(.22,1,.36,1)}
.ss-gl.ss-out,.ss-ov.ss-out,.ss-label-host.ss-out{opacity:0;transform:translateX(-28px);transition:opacity ${Ce}ms cubic-bezier(.55,0,1,.45),transform ${Ce}ms cubic-bezier(.55,0,1,.45)}
.ss-gl.ss-pre,.ss-ov.ss-pre,.ss-label-host.ss-pre{opacity:0;transform:translateX(28px);transition:none}
[data-safety-chip]{transition:opacity .5s ease}
[data-safety-chip].ss-out{opacity:0;transition-duration:${Ce}ms}
.ss-labels{position:absolute;inset:0}
.ss-lbl{position:absolute;left:0;top:0;white-space:nowrap;will-change:transform,opacity;font:600 11px/1 var(--ss-font-mono);letter-spacing:.08em;text-transform:uppercase;color:#8A8A8A}
.ss-lbl .n{color:var(--ss-accent);margin-right:.9em}
.ss-lbl .n,.ss-lbl .t{display:inline-block}
.ss-lbl [data-char]{display:inline-block;opacity:0}
:where([data-safety-captions]){list-style:none;margin:16px 0 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 16px;font:500 12px/1.4 var(--ss-font-mono,DegularMono,monospace);color:#4a4f5a}
:where([data-safety-caption]){display:flex;align-items:baseline;gap:8px;min-width:0}
:where([data-safety-caption-number]){color:#001e3c;background:#efb814;padding:0 3px;flex:none}
:where([data-safety-caption-text]){min-width:0;overflow-wrap:anywhere}
:where([data-safety-captions]) li{display:flex;align-items:baseline;gap:8px;min-width:0}
:where([data-safety-captions]) .caption-number{color:#001e3c;background:#efb814;padding:0 3px;flex:none}
:where([data-safety-captions]) .caption-text{min-width:0;overflow-wrap:anywhere}
[data-safety-tab]{cursor:pointer}
@media (prefers-reduced-motion: reduce){.ss-gl,.ss-ov,.ss-label-host,[data-safety-chip]{transition:none!important}}`,document.head.append(i)}var nn=class{constructor(e){this.stage=e;let t=e.closest("[data-safety]")||e.parentElement;for(;t&&!t.querySelector("[data-safety-tab]");)t=t.parentElement;if(this.root=t||document,this.tabs=[...this.root.querySelectorAll("[data-safety-tab]")],!this.tabs.length){console.warn("safety-scene: no [data-safety-tab] rows found");return}this.keys=this.tabs.map((s,a)=>Je[s.dataset.safetyScene]?s.dataset.safetyScene:en[a%en.length]),this.host=e.querySelector("[data-safety-canvas]")||e,this.chip=this.root.querySelector("[data-safety-chip]"),this.bars=[...this.root.querySelectorAll("[data-safety-bar]")],this.captions=this.root.querySelector("[data-safety-captions]");let n=this.captions?.querySelector("[data-safety-caption]");n&&(this.captionTemplate=n.cloneNode(!0),this.captions.replaceChildren()),this.fallbackArt=this.root.querySelector("[data-safety-fallback]"),this.visible=!1,this.hovered=!1,this.focusWithin=!1,this.manualSelection=!1,this.pendingSwap=!1,this.selectionVersion=0,this.fallbackMode=!1,this.listAnimations=[],this.reduced=matchMedia("(prefers-reduced-motion: reduce)"),Ps(),this.mount()}get autoplay(){return!this.stage.hasAttribute("data-safety-no-autoplay")&&!this.manualSelection&&!this.hovered&&!this.focusWithin&&!this.reduced.matches}canRun(){return!!(this.scenes&&this.visible&&!document.hidden&&!this.reduced.matches&&!this.pendingSwap)}mount(){var l;let e=(o,r)=>{let h=document.createElement(o);return h.className=r,h.setAttribute("aria-hidden","true"),h};this.canvas=e("canvas","ss-gl"),this.overlay=e("canvas","ss-ov"),this.labelHost=e("div","ss-label-host"),this.host.append(this.canvas,this.overlay,this.labelHost),this.fallbackArt&&(this.fallbackArt.style.display="none");let t=this.tabs.find(o=>o.classList.contains("is-active"))||this.tabs[0],n=[...new Set([...t.querySelectorAll(".is-active")].map(o=>[...o.classList].find(r=>r!=="is-active")).filter(Boolean))];this.activeTargets=this.tabs.map(o=>[o,...n.flatMap(r=>[...o.getElementsByClassName(r)])]),this.active=this.tabs.indexOf(t);let s=this.tabs[0].parentElement;s.setAttribute("role","tablist"),s.setAttribute("aria-orientation","vertical"),s.hasAttribute("aria-label")||s.setAttribute("aria-label","Safety features"),(l=this.stage).id||(l.id="safety-stage"),this.stage.setAttribute("role","img"),this.split=this.tabs.map((o,r)=>{o.id||(o.id=`safety-tab-${r}`),o.setAttribute("role","tab"),o.setAttribute("aria-controls",this.stage.id),o.addEventListener("click",()=>this.select(r,!0,!0)),o.addEventListener("keydown",d=>{let u={ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1}[d.key],p;if(u)p=(r+u+this.tabs.length)%this.tabs.length;else if(d.key==="Home")p=0;else if(d.key==="End")p=this.tabs.length-1;else if(d.key==="Enter"||d.key===" ")p=r;else return;d.preventDefault(),this.select(p,!0,!0),this.tabs[p].focus({preventScroll:!0})});let h=o.querySelector("[data-safety-desc]")||o.querySelector("p"),c=o.querySelector("[data-safety-icon]")||o.querySelector('[class*="icon"]');return{desc:h?Ke(h,{words:!0}).words:[],icon:c}}),this.root.addEventListener("pointerenter",o=>{o.pointerType!=="touch"&&(this.hovered=!0,this.syncMotion())}),this.root.addEventListener("pointerleave",()=>{this.hovered=!1,this.syncMotion()}),this.root.addEventListener("focusin",()=>{this.focusWithin=!0,this.syncMotion()}),this.root.addEventListener("focusout",()=>queueMicrotask(()=>{this.focusWithin=this.root.contains(document.activeElement),this.syncMotion()})),this.select(this.active,!1),new ResizeObserver(()=>this.layout()).observe(this.stage),new IntersectionObserver(([o])=>{this.visible=o.isIntersecting,this.syncMotion()},{threshold:.05}).observe(this.root===document?this.stage:this.root),this.reduced.addEventListener("change",()=>{this.select(this.active,!1),this.syncMotion()}),document.addEventListener("visibilitychange",()=>this.syncMotion());let a=new IntersectionObserver(o=>{o.some(r=>r.isIntersecting)&&(a.disconnect(),this.start3D())},{rootMargin:"400px"});a.observe(this.stage)}start3D(){try{this.renderer=new x.WebGLRenderer({canvas:this.canvas,antialias:!0,alpha:!0}),this.renderer.setClearColor(0,0),this.post=new Qe(this.renderer),this.scene3=new x.Scene,this.camera=Ls(),this.drift=new x.Group,this.scene3.add(this.drift),this.scenes=this.keys.map(e=>{let t=ks(Je[e]());return t.root.visible=!1,this.drift.add(t.root),Cs(t,this.labelHost),t.tl=Hs(t,()=>{}),t}),this.driftAnim=je(this.drift.rotation,{y:[-4*St,4*St],duration:7e3,loop:!0,alternate:!0,autoplay:!1,ease:"inOutSine"}),this.stage.dataset.renderer="webgl",this.select(this.active,!1),this.layout(),this.syncMotion()}catch(e){console.warn("safety-scene: using the static illustration",e),this.showFallback()}}showFallback(){clearTimeout(this.swapT),this.selectionVersion++,this.pendingSwap=!1,cancelAnimationFrame(this.raf);for(let e of this.scenes||[])e.tl.pause();this.driftAnim?.pause(),this.renderer?.dispose(),this.renderer=null,this.scenes=null,this.fallbackMode=!0,this.stage.dataset.renderer="static";for(let e of[this.canvas,this.overlay,this.labelHost])e.hidden=!0;this.fallbackArt&&(this.fallbackArt.style.display=""),this.select(this.active,!1),this.layout()}setLineScale(e,t,n=1){for(let s of pe.values())s.resolution.set(e,t),s.linewidth=s.userData.base*n}layout(){let e=this.host.clientWidth,t=this.host.clientHeight;if(this.captions&&(this.captions.style.display=e<520||this.fallbackMode?"":"none"),!e||!t||!this.renderer||!this.scenes)return;this.W=e,this.H=t,this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,2)),this.renderer.setSize(this.W,this.H,!1),this.octx=Is(this.overlay,this.W,this.H),this.setLineScale(this.W,this.H,Math.max(1,this.W/700)),this.post.setSize(1.05*Math.max(1,this.W/700)),this.callouts=this.W>=520,this.labelHost.hidden=!this.callouts;let n=this.callouts?this.W*.2:Math.max(24,this.W*.09),s=Math.max(24,this.H*.1);this.frames=this.scenes.map(a=>_s(a,this.camera,this.W,this.H,n,s)),zn(this.camera,this.frames[this.active]),this.measureLabels(),this.reduced.matches&&tn(this.scenes[this.active],.6),this.paint()}measureLabels(){for(let e of this.scenes){let t=e.labelBox.hidden;e.labelBox.hidden=!1;for(let n of e.parts)n.lbl&&(n.lbl.w=n.lbl.el.offsetWidth,n.lbl.h=n.lbl.el.offsetHeight);e.labelBox.hidden=t}}syncMotion(){if(this.stage.dataset.motion=this.fallbackMode?"static":this.reduced.matches?"reduced":this.canRun()?"playing":"paused",!this.scenes)return;let e=this.canRun();e||this.finishListAnimations();for(let t of this.scenes)e&&t===this.scenes[this.active]&&t.root.visible?t.tl.completed?t.tl.restart():t.tl.play():t.tl.pause();e?(this.driftAnim.play(),this.loop()):(this.driftAnim.pause(),cancelAnimationFrame(this.raf),this.paint())}onCycleEnd(e,t){!this.canRun()||t!==this.selectionVersion||e!==this.scenes[this.active]||(this.autoplay?this.select((this.active+1)%this.tabs.length):e.tl.restart())}select(e,t=!0,n=!1){if(!Number.isInteger(e)||!this.tabs[e])return;clearTimeout(this.swapT),this.finishListAnimations();let s=++this.selectionVersion;for(let c of this.scenes||[])c.tl.pause();this.pendingSwap=!1,n&&(this.manualSelection=!0);let a=e!==this.active,l=this.active,o=t&&a&&!this.reduced.matches;if(this.active=e,this.activeTargets.forEach((c,d)=>c.forEach(u=>u.classList.toggle("is-active",d===e))),this.tabs.forEach((c,d)=>{c.setAttribute("aria-selected",String(d===e)),c.tabIndex=d===e?0:-1}),this.stage.setAttribute("aria-labelledby",this.tabs[e].id),this.captions&&this.renderCaptions(Os[this.keys[e]]),this.chip&&(this.chip.textContent=String(e+1).padStart(2,"0")),this.bars.forEach((c,d)=>{c.style.width=(this.fallbackMode||this.reduced.matches)&&d===e?"100%":"0"}),!this.scenes)return;let r=[this.canvas,this.overlay,this.labelHost,this.chip].filter(Boolean),h=()=>{if(s!==this.selectionVersion||e!==this.active)return;this.pendingSwap=!1;for(let d of this.scenes)d.tl.pause(),d.tl.seek(0),d.root.visible=!1,d.labelBox.hidden=!0;let c=this.scenes[e];if(c.tl.onComplete=()=>this.onCycleEnd(c,s),c.root.visible=!0,c.labelBox.hidden=!1,this.frames&&zn(this.camera,this.frames[e]),this.reduced.matches){tn(c,.6),c.fx.line=1,c.fx.cam=.4;for(let d of c.parts)if(d.lbl)for(let u of[...d.lbl.n,...d.lbl.t])u.style.opacity=1,u.style.color=""}if(this.paint(),o){this.revealListItems(e,l);let d=[this.canvas,this.overlay,this.labelHost];d.forEach(u=>{u.classList.remove("ss-out"),u.classList.add("ss-pre")}),this.stage.offsetWidth,d.forEach(u=>u.classList.remove("ss-pre"))}r.forEach(d=>d.classList.remove("ss-out")),this.syncMotion()};o?(this.pendingSwap=!0,this.syncMotion(),r.forEach(c=>c.classList.add("ss-out")),this.prehideListItems(e,l),this.swapT=setTimeout(h,Ce)):h()}renderCaptions(e){let t=this.captionTemplate;if(!t){this.captions.innerHTML=e.map(n=>`<li><span class="caption-number">${n.number}</span><span class="caption-text">${n.text}</span></li>`).join("");return}this.captions.replaceChildren(...e.map(n=>{let s=t.cloneNode(!0),a=s.querySelector("[data-safety-caption-number]"),l=s.querySelector("[data-safety-caption-text]");return a&&(a.textContent=n.number),l&&(l.textContent=n.text),s}))}finishListAnimations(){for(let e of this.listAnimations)e.complete();this.listAnimations=[];for(let e of this.prehidden||[])e.style.opacity="",e.style.transform="";this.prehidden=[]}prehideListItems(e,t){let n=this.split[e],s=this.split[t];for(let a of n.desc)a.style.opacity="0",a.style.transform="translateX(0.8em)";s.icon&&(s.icon.style.opacity="0",s.icon.style.transform="translateX(0.9em)"),this.prehidden=[...n.desc,s.icon].filter(Boolean)}revealListItems(e,t){let n=this.split[e],s=this.split[t];this.prehidden=[],this.listAnimations=[n.desc.length&&je(n.desc,{opacity:[0,1],translateX:["0.8em","0em"],duration:850,ease:"outExpo",delay:ke(10,{start:220})}),s.icon&&je(s.icon,{opacity:[0,1],translateX:["0.9em","0em"],duration:800,ease:"outExpo",delay:120})].filter(Boolean)}loop(){cancelAnimationFrame(this.raf);let e=()=>{this.canRun()&&(this.paint(),this.raf=requestAnimationFrame(e))};this.raf=requestAnimationFrame(e)}paint(){if(!this.renderer||!this.frames||!this.scenes)return;let e=this.scenes[this.active];this.camera.zoom=1+.035*e.fx.cam,this.camera.updateProjectionMatrix();for(let s of pe.values())s.dashed&&(s.opacity=.45+.55*e.fx.cam);this.scene3.updateMatrixWorld(),this.post.render(this.scene3,this.camera);let t=this.octx;t.clearRect(0,0,this.W,this.H),this.callouts&&this.paintCallouts(e,t);let n=this.bars[this.active];n&&(n.style.width=(this.reduced.matches?100:Ye(e.tl.currentTime/Bn)*100)+"%")}paintCallouts(e,t){let n=this.W,s=this.H,a=Math.max(22,n*.035),l=new x.Vector3,o=[];for(let c of e.parts){if(!c.lbl)continue;let d=c.lift.lengthSq()>0?Ye(c.group.position.length()/c.lift.length()):1;c.anchor.getWorldPosition(l).project(this.camera);let u=(l.x+1)/2*n,p=(1-l.y)/2*s;o.push({p:c,a:Ye(d*1.4),x:u,y:p,ty:Math.max(96,Math.min(s-56,p))})}let r=26;for(let c of["l","r"]){let d=o.filter(u=>u.p.part.label.side===c).sort((u,p)=>u.ty-p.ty);for(let u=1;u<d.length;u++)d[u].ty-d[u-1].ty<r&&(d[u].ty=d[u-1].ty+r)}let h=e.fx.line;t.lineWidth=1;for(let{p:c,a:d,x:u,y:p,ty:A}of o){let{el:F,w:m,h:w}=c.lbl,S=c.part.label.side==="l",T=S?a:n-a-m;if(F.style.transform=`translate(${T.toFixed(1)}px, ${(A-w/2).toFixed(1)}px)`,F.style.opacity=d,h<=0||d<=.01)continue;let P=S?T+m+12:T-12;if(t.globalAlpha=d,S&&P<u-8||!S&&P>u+8){let k=Math.round(p)+.5,D=Math.round(A)+.5,J=Math.abs(D-k)<1?[[u,k],[P,k]]:(()=>{let g=Math.round(u+(P-u)*.35)+.5;return[[u,k],[g,k],[g,D],[P,D]]})();t.strokeStyle="#efb814",Fs(t,J,h),h>.98&&(t.beginPath(),t.moveTo(Math.round(P)+.5,D-3.5),t.lineTo(Math.round(P)+.5,D+3.5),t.stroke())}t.beginPath(),t.arc(u,p,2.1*Math.min(1,h*3),0,Math.PI*2),t.fillStyle=V.outline,t.fill()}t.globalAlpha=1}};function Un(){document.querySelectorAll("[data-safety-stage]").forEach(i=>{i.safetyTabs=new nn(i)})}var Wn=matchMedia("(prefers-reduced-motion: reduce)");function Ds(i){let t=[...(i.querySelector("[data-slider-track]")||i).querySelectorAll("[data-slider-slide]")];if(t.length<2)return;let n=i;for(;n.parentElement&&!n.querySelector("[data-slider-prev], [data-slider-next], [data-slider-dot]");)n=n.parentElement;let s=n.querySelector("[data-slider-prev]"),a=n.querySelector("[data-slider-next]"),l=[...n.querySelectorAll("[data-slider-dot]")],o=Number(i.dataset.sliderScale)||.813576,r=Number(i.dataset.sliderOpacity??.5),h=t.length,c=t.find(g=>g.classList.contains("is-active"))||t[0],d=[...new Set([...c.querySelectorAll(".is-active")].map(g=>[...g.classList].find($=>$!=="is-active")).filter(Boolean))],u=t.map(g=>[g,...d.flatMap($=>[...g.getElementsByClassName($)])]),p=t.indexOf(c),A=!1,F=t.map(g=>{let $=getComputedStyle(g).transform,_=new DOMMatrixReadOnly($==="none"?void 0:$);return Math.abs(_.e+g.offsetWidth/2)<1.5?null:_.e}),m=t.map(g=>{let $=g.querySelector("[data-slider-video]"),_=$?$.matches("video")?$:$.querySelector("video"):g.querySelector("video");if(_){_.muted=!0,_.playsInline=!0,_.autoplay=!1,_.removeAttribute("autoplay"),_.pause();for(let R of[_,..._.querySelectorAll("source")]){let E=R.getAttribute("src");E&&!E.includes("#")&&R.setAttribute("src",`${E}#t=0.001`)}_.querySelector("source")&&!_.getAttribute("src")&&_.load()}return _}),w=null,S=()=>{if(w)return;w=new AbortController;let g=()=>{w.abort(),w=null,P()};for(let $ of["pointerdown","touchend","keydown"])addEventListener($,g,{passive:!0,capture:!0,signal:w.signal})};function T(){let g=innerWidth,$=t[p].offsetWidth;return g<=600?g*.89:g<=900?g*.76:$/2+Math.min($*o,g*.40625)/2+g*.031746}function P(){m.forEach((g,$)=>{g&&($===p&&A&&!document.hidden&&!Wn.matches?(g.preload="auto",g.play().catch(_=>{_.name==="NotAllowedError"&&S()})):g.pause())})}function k(g){p=(g%h+h)%h;let $=T();t.forEach((_,R)=>{let E=(R-p+h)%h;E>h/2&&(E-=h);let I=R===p,K=F[R]===null?`translateX(calc(-50% + ${E*$}px))`:`translateX(${F[R]+E*$}px)`;_.style.transform=`${K} scale(${I?1:o})`,_.style.opacity=I?"":String(r),_.style.zIndex=I?"2":"1",_.inert=!I,_.setAttribute("aria-hidden",String(!I))}),u.forEach((_,R)=>_.forEach(E=>E.classList.toggle("is-active",R===p))),l.forEach((_,R)=>{_.classList.toggle("is-active",R===p),_.setAttribute("aria-pressed",String(R===p))}),P()}s?.addEventListener("click",()=>k(p-1)),a?.addEventListener("click",()=>k(p+1)),s&&!s.hasAttribute("aria-label")&&s.setAttribute("aria-label","Previous"),a&&!a.hasAttribute("aria-label")&&a.setAttribute("aria-label","Next"),l.forEach((g,$)=>{g.matches("button, a")||(g.setAttribute("role","button"),g.tabIndex=0),g.hasAttribute("aria-label")||g.setAttribute("aria-label",`Show slide ${$+1}`),g.style.cursor="pointer",g.addEventListener("click",()=>k($)),g.addEventListener("keydown",_=>{(_.key==="Enter"||_.key===" ")&&(_.preventDefault(),k($))})}),i.addEventListener("keydown",g=>{g.key==="ArrowLeft"?(g.preventDefault(),k(p-1)):g.key==="ArrowRight"&&(g.preventDefault(),k(p+1))});let D=0,J=0;i.addEventListener("touchstart",g=>{D=g.touches[0].clientX,J=g.touches[0].clientY},{passive:!0}),i.addEventListener("touchend",g=>{let $=g.changedTouches[0].clientX-D,_=g.changedTouches[0].clientY-J;Math.abs($)>50&&Math.abs($)>Math.abs(_)&&k(p+($<0?1:-1))},{passive:!0}),addEventListener("resize",()=>k(p)),new IntersectionObserver(([g])=>{A=g.isIntersecting,P()},{rootMargin:"100px"}).observe(i),document.addEventListener("visibilitychange",P),Wn.addEventListener("change",P),k(p),i.threatSlider={show:k,next:()=>k(p+1),prev:()=>k(p-1),get index(){return p}}}function Nn(){document.querySelectorAll("[data-slider]").forEach(Ds)}var me=(i,e=0,t=1)=>Math.min(t,Math.max(e,i)),sn=matchMedia("(prefers-reduced-motion: reduce)"),qn=matchMedia("(max-width: 767px)");function zs(i){let e=i.querySelector("[data-reveal-pin]")||i.firstElementChild,t=i.querySelector("[data-reveal-panel]");if(!e||!t){console.warn("reveal: needs a [data-reveal-panel] inside",i);return}let n=i.querySelector("[data-reveal-behind]")||i.querySelector("[data-burst-logo]"),s=i.querySelector("[data-reveal-pull]"),a=i.querySelector("[data-reveal-push]"),l=0,o=()=>{l=0;let h=!sn.matches&&!qn.matches,c=Math.min(0,innerHeight-e.offsetHeight);e.style.top=h?`${c}px`:"";let d=me((c-i.getBoundingClientRect().top)/Math.max(1,i.offsetHeight-e.offsetHeight)),u=h?me((d-.16)/.4):0,p=u*u*(3-2*u),A=h&&p*115<100,F=h&&u>.97;n&&(n.inert=A,n.setAttribute("aria-hidden",String(A))),t.inert=F,t.setAttribute("aria-hidden",String(F)),t.style.transform=h?`translate3d(${-p*115}vw, 0, 0)`:"",s&&(s.style.opacity=h?String(1-me(d/.12)):""),a&&(a.style.opacity=h?String(me((d-.07)/.1)):"",a.style.transform=h?`translateX(${(1-me((d-.06)/.12))*160}px)`:"")},r=()=>{l||(l=requestAnimationFrame(o))};addEventListener("scroll",r,{passive:!0}),addEventListener("resize",r),sn.addEventListener("change",r),qn.addEventListener("change",r),new ResizeObserver(r).observe(i),sn.matches||(t.style.willChange="transform"),o()}function Vn(){document.querySelectorAll("[data-reveal]").forEach(zs)}(()=>{if(customElements.get("a-burst-logo"))return;let i="M326.279 198.593L326.286 241.499H300.899V198.593H326.279ZM292.705 198.593V241.499H267.325V198.593H292.705ZM156.005 165.018H412.969L387.589 190.398H156.585C143.202 190.398 130.366 195.714 120.902 205.178L84.582 241.499H48.6885L103.365 186.822C117.326 172.861 136.261 165.018 156.005 165.018ZM152.445 131.443H446.544L421.163 156.823H153.024C133.016 156.823 113.827 164.772 99.6787 178.92L37.0996 241.499H1.20703L82.1416 160.564C100.787 141.919 126.076 131.443 152.445 131.443ZM278.099 0.5L155.361 123.237H151.158C139.762 123.237 128.448 125.177 117.703 128.974L111.394 131.202L242.205 0.5H278.099ZM326.279 123.237H300.899V36.5479L326.279 11.168V123.237ZM292.704 123.237H267.324V70.1221L292.704 44.7422V123.237ZM325.579 0.500977L202.844 123.237H166.95L289.687 0.5L325.579 0.500977Z",e=1e3,t=540,n=550,s=230,a=356/448,l=44,o=.063,r=500,h=26,c=224,d=121,u=2.5,p=1.5,A=-38,F=.42,m=[.4,.16,1,-.68,.26,.36,-1.1,-.17],w=m.map(j=>m.filter(N=>N<j).length+1),S=[-.3,1],T=[1,-1],P=[S,S,S,T,T,S,S,S],k=[1,1,1,-1,-1,1,1,1],D="http://www.w3.org/2000/svg";function J(j,N,q,C){let B=(U,W,H)=>3*U*H*(1-H)*(1-H)+3*W*H*H*(1-H)+H*H*H;return U=>{if(U<=0)return 0;if(U>=1)return 1;let W=0,H=1,z=U;for(let G=0;G<24;G++)z=(W+H)/2,B(j,q,z)<U?W=z:H=z;return B(N,C,z)}}let g=J(.65,0,.35,1),$=J(.16,1,.3,1),_=(j,N,q)=>Math.min(q,Math.max(N,j)),R=(j,N,q)=>_((j-N)/(q-N),0,1);function E(j){let N=g(R(j,.1,.48)),q=m.map(C=>{let B=(1-C)/2.1;return $(R(j,.58+B*.26,1.18+B*.26))});return{r:N,e:q}}function I(j){let N=j.match(/[MLHVCZ]|[\d.]+/g),q=[],C=()=>+N[B++],B=0,U=null,W=0,H=0,z=null;for(;B<N.length;)if(/[A-Z]/.test(N[B])&&(U=N[B++]),U==="M")W=C(),H=C(),z=[[W,H]],q.push(z),U="L";else if(U==="L")W=C(),H=C(),z.push([W,H]);else if(U==="H")W=C(),z.push([W,H]);else if(U==="V")H=C(),z.push([W,H]);else if(U==="C"){let G=[C(),C()],lt=[C(),C()],Y=[C(),C()];for(let et=1;et<=10;et++){let L=et/10,Q=1-L,nt=[Q*Q*Q,3*Q*Q*L,3*Q*L*L,L*L*L];z.push([nt[0]*W+nt[1]*G[0]+nt[2]*lt[0]+nt[3]*Y[0],nt[0]*H+nt[1]*G[1]+nt[2]*lt[1]+nt[3]*Y[1]])}[W,H]=Y}else U=null;return q.map(G=>{let lt=G[0],Y=G[G.length-1];return Math.hypot(lt[0]-Y[0],lt[1]-Y[1])<.01&&(G=G.slice(0,-1)),G.map(([et,L])=>[et-c,-(L-d)])})}let K=I(i);function at(j,N){let q=!1;for(let C=0,B=N.length-1;C<N.length;B=C++){let[U,W]=N[C],[H,z]=N[B];W>j[1]!=z>j[1]&&j[0]<(H-U)*(j[1]-W)/(z-W)+U&&(q=!q)}return q}let Ot=j=>j.reduce((N,q,C)=>{let B=j[(C+1)%j.length];return N+q[0]*B[1]-B[0]*q[1]},0),ut=j=>j[0].toFixed(1)+" "+j[1].toFixed(1);function Le(j,N,q,C){let B=L=>j.map(([Q,nt])=>N(Q,L+q,nt)),U=B(-h/2),W=B(h/2),H=U.length,z=[U,W];for(let L=0;L<H;L++){let Q=(L+1)%H;z.push([U[L],U[Q],W[Q],W[L]])}let G=L=>z.some(Q=>at(L,Q)),lt=z.map(L=>"M"+(Ot(L)<0?L.slice().reverse():L).map(ut).join("L")+"Z").join(""),Y={1:"",2:""},et=(L,Q,nt)=>{let Mt=Q[0]-L[0],O=Q[1]-L[1],ct=Math.hypot(Mt,O);if(ct<.05)return;let ht=Math.ceil(ct/u),Ct=-O/ct*.6,bt=Mt/ct*.6,Pt=0;for(let dt=0;dt<ht;dt++){let Tt=[L[0]+Mt*(dt+.5)/ht,L[1]+O*(dt+.5)/ht],Vt=G([Tt[0]+Ct,Tt[1]+bt])!==G([Tt[0]-Ct,Tt[1]-bt])?1:nt?2:0;Vt&&(Y[Vt]+=(Vt===Pt?"":"M"+ut([L[0]+Mt*dt/ht,L[1]+O*dt/ht]))+"L"+ut([L[0]+Mt*(dt+1)/ht,L[1]+O*(dt+1)/ht])),Pt=Vt}};for(let L=0;L<H;L++){let Q=(L+1)%H;et(U[L],U[Q],!C),et(W[L],W[Q],C),et(U[L],W[L],!1)}return{body:lt,sil:Y[1],crease:Y[2]}}function _e(j,N){let q=j.length,C=Ot(j)>0?1:-1;return j.map((B,U)=>{let W=j[(U+q-1)%q],H=j[(U+1)%q],z=[B[0]-W[0],B[1]-W[1]],G=[H[0]-B[0],H[1]-B[1]],lt=Math.hypot(...z)||1,Y=Math.hypot(...G)||1,et=[-z[1]/lt*C,z[0]/lt*C],L=[-G[1]/Y*C,G[0]/Y*C],Q=[et[0]+L[0],et[1]+L[1]],nt=Math.hypot(...Q)||1,Mt=Math.max(.35,(Q[0]*et[0]+Q[1]*et[1])/nt);return[B[0]+Q[0]/nt*(N/Mt),B[1]+Q[1]/nt*(N/Mt)]})}let ye=K.map(j=>_e(j,3.2)),Ie=`
    :host { display: block; container-type: inline-size; --ab-bg: #f1f1f1; --ab-ink: #1b1b1b; --ab-crease: #b4b4b4;
      --ab-guide: #9a9a9a; --ab-grid: rgba(0, 0, 0, 0.06); --ab-rail: #b9b9b9; --ab-label: #1f2b46; --ab-accent: #b68f00;
      --ab-dot: #fdc902; --ab-font: ui-monospace, "SF Mono", Menlo, Consolas, monospace; background: var(--ab-bg); }
    .box { position: relative; width: 100%; aspect-ratio: ${e} / ${t};
      background-image: radial-gradient(var(--ab-grid) 1px, transparent 1.2px); background-size: 2.2cqw 2.2cqw; background-position: center; }
    svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
    .body { fill: var(--ab-bg); stroke: none; }
    .sil { fill: none; stroke: var(--ab-ink); stroke-width: 1.25px; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke; }
    .crease { fill: none; stroke: var(--ab-crease); stroke-width: 1px; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
    .axis { fill: none; stroke: var(--ab-guide); stroke-width: 1px; stroke-dasharray: 2.4 2.8; vector-effect: non-scaling-stroke; }
    .guide { fill: none; stroke: var(--ab-guide); stroke-width: 1px; stroke-linecap: round; stroke-dasharray: 0.5 4; vector-effect: non-scaling-stroke; }
    .cap-line, .lead { fill: none; stroke: var(--ab-guide); stroke-width: 1px; vector-effect: non-scaling-stroke; }
    .anchor { fill: var(--ab-ink); stroke: none; }
    .tags { position: absolute; inset: 0; pointer-events: none; }
    .tag { position: absolute; left: 0; top: 0; white-space: nowrap; font: 600 max(9px, 0.62cqw) / 1 var(--ab-font);
      letter-spacing: 0.08em; text-transform: uppercase; color: var(--ab-guide); opacity: 0;
      background: var(--ab-bg); padding: 0.35em 0.4em; }
    .tag .n { color: var(--ab-accent); }
    @container (max-width: 620px) { .tags, .callouts { display: none; } }
    .label { position: absolute; right: ${(e-(n-224*a-l))/e*100}%; top: ${s/t*100}%; transform: translateY(-50%);
      margin: 0 -0.62em 0 0; font: 400 max(10px, 0.8cqw) / 1 var(--ab-font); letter-spacing: 0.62em; text-transform: uppercase;
      color: var(--ab-label); white-space: nowrap; pointer-events: none; }
    /* too narrow for the label beside the mark: it goes back above it */
    @container (max-width: 700px) {
      .label { right: auto; left: ${n/e*100}%; top: ${(s-121*a-40)/t*100}%; transform: translate(-50%, -50%);
        margin: 0; padding-left: 0.62em; }
    }
    .label:empty { display: none; }
    .scrub { position: absolute; left: ${o*100}%; right: ${o*100}%; top: ${r/t*100}%; transform: translateY(-50%);
      display: flex; align-items: center; }
    .cap { width: 1px; height: 10px; background: var(--ab-rail); flex: none; }
    input { -webkit-appearance: none; appearance: none; flex: 1; min-width: 0; height: 20px; margin: 0; background: none; cursor: pointer; }
    input::-webkit-slider-runnable-track { height: 1px; background: var(--ab-rail); }
    input::-moz-range-track { height: 1px; background: var(--ab-rail); }
    input::-webkit-slider-thumb { -webkit-appearance: none; width: 11px; height: 11px; margin-top: -5px; border-radius: 50%;
      background: var(--ab-dot); border: 1px solid var(--ab-ink); box-sizing: border-box; }
    input::-moz-range-thumb { width: 11px; height: 11px; border-radius: 50%; background: var(--ab-dot); border: 1px solid var(--ab-ink); box-sizing: border-box; }
    input:focus-visible { outline: 1px dashed var(--ab-guide); outline-offset: 4px; }
  `;class Fe extends HTMLElement{static get observedAttributes(){return["label","spread"]}attributeChangedCallback(N){this.shadowRoot&&(N==="label"&&(this.labelEl.textContent=this.getAttribute("label")??"Introducing"),this.last="",this.wake())}connectedCallback(){this.shadowRoot||this.build(),this.motion=matchMedia("(prefers-reduced-motion: reduce)"),this.wake()}disconnectedCallback(){cancelAnimationFrame(this.raf),this.raf=0}build(){let N=this.attachShadow({mode:"open"});N.innerHTML=`<style>${Ie}</style><div class="box"><svg viewBox="0 0 ${e} ${t}" aria-hidden="true">
        <path class="axis"/><path class="cap-line"/><path class="guide"/><g class="parts"></g><g class="callouts"></g></svg>
        <div class="tags" aria-hidden="true"></div><p class="label"></p>
        <div class="scrub"><span class="cap"></span><input type="range" min="0" max="1000" value="0"
        aria-label="Logo animation, from the flat mark to the burst"><span class="cap"></span></div></div>`;let q=H=>N.querySelector(H),C=(H,z)=>{let G=document.createElementNS(D,"path");return G.setAttribute("class",H),z.appendChild(G),G};this.labelEl=q(".label"),this.labelEl.textContent=this.getAttribute("label")??"Introducing",this.g=q(".parts"),this.axisEl=q(".axis"),this.capEl=q(".cap-line"),this.guideEl=q(".guide");let B=q(".callouts"),U=q(".tags");this.parts=K.map((H,z)=>{let G=document.createElementNS(D,"g");this.g.appendChild(G);let lt=H.reduce((et,L)=>[et[0]+L[0]/H.length,et[1]+L[1]/H.length],[0,0]),Y=document.createElement("div");return Y.className="tag",Y.innerHTML=`<span class="n">${String(w[z]).padStart(2,"0")}</span>`,U.appendChild(Y),{pts:H,c:lt,out:m[z],side:k[z],aim:P[z],grp:G,depth:0,body:C("body",G),crease:C("crease",G),inset:C("crease",G),sil:C("sil",G),lead:C("lead",B),anchor:C("anchor",B),tag:Y}}),this.base=0,this.hover=null,this.sp={x:0,v:0},this.last="",this.prev=0;let W=q(".box");W.addEventListener("pointermove",H=>{if(H.pointerType==="touch"||this.dragging)return;let z=W.getBoundingClientRect();this.hover=_((H.clientX-z.left-o*z.width)/((1-2*o)*z.width),0,1),this.wake()}),W.addEventListener("pointerleave",()=>{this.hover=null,this.wake()}),this.range=q("input"),this.range.addEventListener("input",()=>{this.dragging=!0,this.hover=null,this.base=this.range.value/1e3,this.wake()}),this.range.addEventListener("change",()=>{this.dragging=!1}),this.draw(E(0))}wake(){!this.raf&&this.isConnected&&(this.prev=0,this.raf=requestAnimationFrame(N=>this.tick(N)))}tick(N){this.raf=0;let q=this.prev?Math.min(.05,(N-this.prev)/1e3):0;this.prev=N;let C=this.sp,B=(this.hover??this.base)*p;if(this.motion?.matches)C.x=B,C.v=0;else for(let z=0;z<4;z++){let G=100*(B-C.x)-18*C.v;C.v+=G*q/4,C.x+=C.v*q/4}let U=Math.abs(B-C.x)>1e-4||Math.abs(C.v)>1e-4;U||(C.x=B,C.v=0);let W=_(C.x,0,p);this.dragging||(this.range.value=Math.round(W/p*1e3));let H=W.toFixed(4)+"|"+this.getAttribute("spread");H!==this.last&&(this.draw(E(W)),this.last=H),U&&(this.raf=requestAnimationFrame(z=>this.tick(z)))}draw({r:N,e:q}){let C=q.reduce((O,ct)=>O+ct,0)/q.length,B=+(this.getAttribute("spread")??400)||400,U=A*N*Math.PI/180,W=F*N,H=Math.sqrt(1-W*W),z=Math.cos(U),G=Math.sin(U),lt=(O,ct,ht)=>[n+a*(z*O-G*ct),s+a*(W*(G*O+z*ct)-H*ht)],Y=[H*G,H*z,W],et=Y[1]>=0?h/2:-h/2,L=0,Q=0,nt="";if(this.parts.forEach((O,ct)=>{let ht=O.out*B*q[ct],Ct=Le(O.pts,lt,ht,Y[1]>=0);O.body.setAttribute("d",Ct.body),O.sil.setAttribute("d",Ct.sil),O.crease.setAttribute("d",Ct.crease),O.inset.setAttribute("d",N>.02?"M"+ye[ct].map(([gt,Gt])=>ut(lt(gt,et+ht,Gt))).join("L")+"Z":""),O.inset.style.opacity=N.toFixed(3),O.depth=Y[0]*O.c[0]+Y[1]*ht+Y[2]*O.c[1],L=Math.min(L,ht),Q=Math.max(Q,ht);let bt=_((q[ct]-.35)/.5,0,1),Pt=gt=>O.aim[0]*gt[0]+O.aim[1]*gt[1],dt=null,Tt=null;for(let[gt,Gt]of O.pts){let Ht=lt(gt,et+ht,Gt);(!dt||Pt(Ht)<Pt(dt))&&(dt=Ht,Tt=[gt,Gt])}Math.abs(ht)>1&&(nt+=`M${ut(lt(Tt[0],et,Tt[1]))}L${ut(dt)}`);let Vt=26*O.side,se=dt[0]+Vt*bt,te=dt[1];O.lead.setAttribute("d",bt>.01?`M${ut(dt)}L${ut([se,te])}`+(bt>.98?`M${ut([se,te-3.5])}L${ut([se,te+3.5])}`:""):""),O.anchor.setAttribute("d",bt>.01?`M${ut([dt[0]-2,te])}a2 2 0 1 0 4 0a2 2 0 1 0 -4 0`:""),O.lead.style.opacity=O.anchor.style.opacity=bt.toFixed(3);let Oe=6*O.side,Rt=(se+Oe)/e*100,Dt=te/t*100;O.tag.style.transform=`translate(${O.side>0?0:-100}%, -50%) translateX(${((1-bt)*.7*O.side).toFixed(2)}em)`,O.tag.style.left=Rt.toFixed(2)+"%",O.tag.style.top=Dt.toFixed(2)+"%",O.tag.style.opacity=bt.toFixed(3)}),C>.001){let O=lt(0,L-40*C,-121),ct=lt(0,Q+40*C,-121),ht=ct[0]-O[0],Ct=ct[1]-O[1],bt=Math.hypot(ht,Ct)||1,Pt=-Ct/bt*5,dt=ht/bt*5;this.axisEl.setAttribute("d",`M${ut(O)}L${ut(ct)}`),this.capEl.setAttribute("d",[O,ct].map(Tt=>`M${ut([Tt[0]-Pt,Tt[1]-dt])}L${ut([Tt[0]+Pt,Tt[1]+dt])}`).join(""))}else this.axisEl.setAttribute("d",""),this.capEl.setAttribute("d","");this.guideEl.setAttribute("d",nt),this.axisEl.style.opacity=this.capEl.style.opacity=this.guideEl.style.opacity=Math.min(1,C*1.6).toFixed(3),this.labelEl.style.opacity=(1-C).toFixed(3);let Mt=this.parts.slice().sort((O,ct)=>O.depth-ct.depth);Mt.some((O,ct)=>this.g.children[ct]!==O.grp)&&Mt.forEach(O=>this.g.appendChild(O.grp))}}customElements.define("a-burst-logo",Fe)})();var on;(()=>{let i={"--ab-accent":"#efb814","--ab-dot":"#efb814","--ab-label":"#001e3c","--ab-font":'DegularMono, "Degular Mono", "Courier New", monospace'},e=["--ab-bg","--ab-ink","--ab-crease","--ab-guide","--ab-grid","--ab-rail","--ab-label","--ab-accent","--ab-dot","--ab-font"],t=`
    :host { background: transparent; }
    .box { background: none; }
    input { height: 44px; }
    @media (max-width: 700px) {
      .box { height: 100%; aspect-ratio: auto; }
      .label { top: 16%; left: 50%; right: auto; transform: translate(-50%, -50%); margin: 0; font-size: 11px; }
      .tags, .callouts { display: none; }
      .scrub { top: 91%; }
    }`,n=matchMedia("(max-width: 700px)"),s=55,a=230/540*100,l=67.2,o=17.8;function r(c){let d=c.querySelector("[data-burst-fallback]");try{let u=document.createElement("a-burst-logo");u.setAttribute("label",c.dataset.burstLabel??"Introducing"),c.dataset.burstSpread&&u.setAttribute("spread",c.dataset.burstSpread),u.style.cssText="display:block;margin:0 auto";let p=getComputedStyle(c);for(let D of e){let J=p.getPropertyValue(D).trim()||i[D];J&&u.style.setProperty(D,J)}if(c.append(u),!u.shadowRoot?.querySelector("svg"))throw new Error("logo did not start");let A=Math.max(.5,Math.min(3,parseFloat(c.dataset.burstScale)||1)),F=document.createElement("style");F.textContent=t+(A===1?"":`
        @media (min-width: 701px) {
          .tags { transform: scale(${A}); transform-origin: ${s}% ${a}%; }
          .tag { font-size: calc(max(9px, 0.62cqw) / ${A}); }
          .label { right: calc(${l}% + ${((A-1)*o).toFixed(3)}%); }
        }`),u.shadowRoot.append(F);let m=`${550-350/A} ${230-230/A} ${700/A} ${540/A}`,w=`${550-550/A} ${230-230/A} ${1e3/A} ${540/A}`,S=()=>{u.shadowRoot.querySelector("svg").setAttribute("viewBox",n.matches?m:w),Object.assign(u.style,n.matches?{width:"100%",height:"min(100svh, 740px)",aspectRatio:"auto"}:{width:"min(100%, 185.19vh)",height:"auto",aspectRatio:"1000 / 540"})};n.addEventListener("change",S),S(),d&&(d.style.display="none");let T=u.shadowRoot.querySelector(".scrub"),P=c.closest("[data-burst-section]")||c.parentElement,k=()=>{if(n.matches){T.style.top="";return}let D=P.getBoundingClientRect(),J=u.getBoundingClientRect();T.style.top=`${(D.top+D.height*.93-J.top).toFixed(1)}px`};new ResizeObserver(k).observe(P),new ResizeObserver(k).observe(u),n.addEventListener("change",k),k(),h(u),c.burstLogo=u}catch(u){console.warn("burst-logo: showing the static mark",u),c.querySelector("a-burst-logo")?.remove(),d&&(d.style.display="")}}function h(c){let d=!0,u=()=>c.isConnected&&d&&!document.hidden,p=c.wake,A=c.tick,F=()=>{cancelAnimationFrame(c.raf),c.raf=0,c.prev=0};c.wake=function(){u()&&p.call(this)},c.tick=function(w){if(!u()){F();return}A.call(this,w)};let m=()=>{u()?c.wake():(F(),c.hover=null,c.dragging=!1)};new IntersectionObserver(w=>{d=w[w.length-1].isIntersecting,m()}).observe(c),document.addEventListener("visibilitychange",m)}on=()=>document.querySelectorAll("[data-burst-logo]").forEach(r)})();pn({carScene:Dn,safetyScene:Un,threatSlider:Nn,reveal:Vn,burstLogo:on});
