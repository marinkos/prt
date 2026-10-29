var _t={"car/parts.bin":"car/parts-2241684c.bin","car/parts.json":"car/parts-a3f09d9e.json"};function pn(i){let e=()=>{for(let[t,n]of Object.entries(i))try{n()}catch(s){console.error(`[a-security] ${t} failed to start`,s)}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e):e()}import*as x from"https://cdn.jsdelivr.net/npm/three@0.184.0/+esm";import{Box3 as ns,InstancedInterleavedBuffer as ss,InterleavedBufferAttribute as xn,Line3 as is,MathUtils as os,Matrix4 as as,Mesh as rs,Sphere as ls,Vector3 as Kt,Vector4 as he}from"https://cdn.jsdelivr.net/npm/three@0.184.0/+esm";import{Box3 as bn,Float32BufferAttribute as mn,InstancedBufferGeometry as Yn,InstancedInterleavedBuffer as yn,InterleavedBufferAttribute as be,Sphere as Kn,Vector3 as Qn,WireframeGeometry as Jn}from"https://cdn.jsdelivr.net/npm/three@0.184.0/+esm";var gn=new bn,ve=new Qn,Zt=class extends Yn{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";let e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],n=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(n),this.setAttribute("position",new mn(e,3)),this.setAttribute("uv",new mn(t,2))}applyMatrix4(e){let t=this.attributes.instanceStart,n=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),n.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let n=new yn(t,6,1);return this.setAttribute("instanceStart",new be(n,3,0)),this.setAttribute("instanceEnd",new be(n,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let n=new yn(t,6,1);return this.setAttribute("instanceColorStart",new be(n,3,0)),this.setAttribute("instanceColorEnd",new be(n,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new Jn(e.geometry)),this}fromLineSegments(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new bn);let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),gn.setFromBufferAttribute(t),this.boundingBox.union(gn))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Kn),this.boundingBox===null&&this.computeBoundingBox();let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){let n=this.boundingSphere.center;this.boundingBox.getCenter(n);let s=0;for(let a=0,l=e.count;a<l;a++)ve.fromBufferAttribute(e,a),s=Math.max(s,n.distanceToSquared(ve)),ve.fromBufferAttribute(t,a),s=Math.max(s,n.distanceToSquared(ve));this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}};import{ShaderLib as xe,ShaderMaterial as ts,UniformsLib as we,UniformsUtils as vn,Vector2 as es}from"https://cdn.jsdelivr.net/npm/three@0.184.0/+esm";we.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new es(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};xe.line={uniforms:vn.merge([we.common,we.fog,we.line]),vertexShader:`
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
		`};var Yt=class extends ts{constructor(e){super({type:"LineMaterial",uniforms:vn.clone(xe.line.uniforms),vertexShader:xe.line.vertexShader,fragmentShader:xe.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0!==this.worldUnits&&(this.needsUpdate=!0),e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}};var Ue=new he,wn=new Kt,En=new Kt,xt=new he,wt=new he,Ut=new he,We=new Kt,Ne=new as,Et=new is,Sn=new Kt,Ee=new ns,Se=new ls,Wt=new he,Nt,ne;function Mn(i,e,t){return Wt.set(0,0,-e,1).applyMatrix4(i.projectionMatrix),Wt.multiplyScalar(1/Wt.w),Wt.x=ne/t.width,Wt.y=ne/t.height,Wt.applyMatrix4(i.projectionMatrixInverse),Wt.multiplyScalar(1/Wt.w),Math.abs(Math.max(Wt.x,Wt.y))}function cs(i,e){let t=i.matrixWorld,n=i.geometry,s=n.attributes.instanceStart,a=n.attributes.instanceEnd,l=Math.min(n.instanceCount,s.count);for(let o=0,r=l;o<r;o++){Et.start.fromBufferAttribute(s,o),Et.end.fromBufferAttribute(a,o),Et.applyMatrix4(t);let d=new Kt,u=new Kt;Nt.distanceSqToSegment(Et.start,Et.end,u,d),u.distanceTo(d)<ne*.5&&e.push({point:u,pointOnLine:d,distance:Nt.origin.distanceTo(u),object:i,face:null,faceIndex:o,uv:null,uv1:null})}}function ds(i,e,t){let n=e.projectionMatrix,a=i.material.resolution,l=i.matrixWorld,o=i.geometry,r=o.attributes.instanceStart,d=o.attributes.instanceEnd,u=Math.min(o.instanceCount,r.count),c=-e.near;Nt.at(1,Ut),Ut.w=1,Ut.applyMatrix4(e.matrixWorldInverse),Ut.applyMatrix4(n),Ut.multiplyScalar(1/Ut.w),Ut.x*=a.x/2,Ut.y*=a.y/2,Ut.z=0,We.copy(Ut),Ne.multiplyMatrices(e.matrixWorldInverse,l);for(let h=0,m=u;h<m;h++){if(xt.fromBufferAttribute(r,h),wt.fromBufferAttribute(d,h),xt.w=1,wt.w=1,xt.applyMatrix4(Ne),wt.applyMatrix4(Ne),xt.z>c&&wt.z>c)continue;if(xt.z>c){let M=xt.z-wt.z,H=(xt.z-c)/M;xt.lerp(wt,H)}else if(wt.z>c){let M=wt.z-xt.z,H=(wt.z-c)/M;wt.lerp(xt,H)}xt.applyMatrix4(n),wt.applyMatrix4(n),xt.multiplyScalar(1/xt.w),wt.multiplyScalar(1/wt.w),xt.x*=a.x/2,xt.y*=a.y/2,wt.x*=a.x/2,wt.y*=a.y/2,Et.start.copy(xt),Et.start.z=0,Et.end.copy(wt),Et.end.z=0;let C=Et.closestPointToPointParameter(We,!0);Et.at(C,Sn);let f=os.lerp(xt.z,wt.z,C),E=f>=-1&&f<=1,g=We.distanceTo(Sn)<ne*.5;if(E&&g){Et.start.fromBufferAttribute(r,h),Et.end.fromBufferAttribute(d,h),Et.start.applyMatrix4(l),Et.end.applyMatrix4(l);let M=new Kt,H=new Kt;Nt.distanceSqToSegment(Et.start,Et.end,H,M),t.push({point:H,pointOnLine:M,distance:Nt.origin.distanceTo(H),object:i,face:null,faceIndex:h,uv:null,uv1:null})}}}var oe=class extends rs{constructor(e=new Zt,t=new Yt({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){let e=this.geometry,t=e.attributes.instanceStart,n=e.attributes.instanceEnd,s=new Float32Array(2*t.count);for(let l=0,o=0,r=t.count;l<r;l++,o+=2)wn.fromBufferAttribute(t,l),En.fromBufferAttribute(n,l),s[o]=o===0?0:s[o-1],s[o+1]=s[o]+wn.distanceTo(En);let a=new ss(s,2,1);return e.setAttribute("instanceDistanceStart",new xn(a,1,0)),e.setAttribute("instanceDistanceEnd",new xn(a,1,1)),this}raycast(e,t){let n=this.material.worldUnits,s=e.camera;s===null&&!n&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');let a=e.params.Line2!==void 0&&e.params.Line2.threshold||0;Nt=e.ray;let l=this.matrixWorld,o=this.geometry,r=this.material;ne=r.linewidth+a,o.boundingSphere===null&&o.computeBoundingSphere(),Se.copy(o.boundingSphere).applyMatrix4(l);let d;if(n)d=ne*.5;else{let c=Math.max(s.near,Se.distanceToPoint(Nt.origin));d=Mn(s,c,r.resolution)}if(Se.radius+=d,Nt.intersectsSphere(Se)===!1)return;o.boundingBox===null&&o.computeBoundingBox(),Ee.copy(o.boundingBox).applyMatrix4(l);let u;if(n)u=ne*.5;else{let c=Math.max(s.near,Ee.distanceToPoint(Nt.origin));u=Mn(s,c,r.resolution)}Ee.expandByScalar(u),Nt.intersectsBox(Ee)!==!1&&(n?cs(this,t):ds(this,s,t))}onBeforeRender(e){let t=this.material.uniforms;t&&t.resolution&&(e.getViewport(Ue),this.material.uniforms.resolution.value.set(Ue.z,Ue.w))}};import{createTimeline as gs}from"https://cdn.jsdelivr.net/npm/animejs@4.5.0/+esm";import*as X from"https://cdn.jsdelivr.net/npm/three@0.184.0/+esm";var us=[0,.3,2.15],qe="air_cleaner",Qt=(i=0,e=0,t=0)=>new X.Vector3(i,e,t),Rn=Qt(0,1,0);function ae(i,{p:e=[0,0,0],r:t=[0,0,0],q:n}={}){return i.applyMatrix4(new X.Matrix4().compose(Qt(...e),n||new X.Quaternion().setFromEuler(new X.Euler(...t)),Qt(1,1,1))),i}var kt=(i,e,t,n)=>ae(new X.BoxGeometry(i,e,t),n),$t=(i,e,t,n=24)=>ae(new X.CylinderGeometry(i,i,e,n),t),yt=(i,e,t,n,s,a=24,l=i)=>ae(new X.CylinderGeometry(l,i,t-e,a).rotateX(Math.PI/2),{p:[n,s,(e+t)/2]}),kn=i=>new X.Shape(i.map(([e,t])=>new X.Vector2(e,t))),fe=(i,e,t,n)=>ae(new X.ExtrudeGeometry(kn(i),{depth:t-e,bevelEnabled:!1}).translate(0,0,e),n),Cn=(i,e)=>{let t=Qt(...i),n=Qt(...e),s=n.clone().sub(t);return{len:s.length(),o:{p:t.add(n).multiplyScalar(.5).toArray(),q:new X.Quaternion().setFromUnitVectors(Rn,s.normalize())}}},Tn=(i,e,t,n)=>{let s=Cn(i,e);return ae(new X.BoxGeometry(t,s.len,n),s.o)},Me=(i,e,t,n=16)=>{let s=Cn(i,e);return ae(new X.CylinderGeometry(t,t,s.len,n),s.o)},An=(i,e,t=48,n=14)=>new X.TubeGeometry(new X.CatmullRomCurve3(i.map(s=>Qt(...s))),t,e,n,!1);function hs(i){let e=i.map(o=>o.index?o.toNonIndexed():o),t=0;for(let o of e)t+=o.attributes.position.count;let n=new Float32Array(t*3),s=new Float32Array(t*3),a=0;for(let o of e)o.attributes.normal||o.computeVertexNormals(),n.set(o.attributes.position.array,a*3),s.set(o.attributes.normal.array,a*3),a+=o.attributes.position.count;let l=new X.BufferGeometry;return l.setAttribute("position",new X.BufferAttribute(n,3)),l.setAttribute("normal",new X.BufferAttribute(s,3)),l}function fs(i,e,t,n){let s=l=>{let o=[];for(let[c,h,m]of i)for(let y=0;y<96;y++){let C=y/96*Math.PI*2;o.push([c+Math.cos(C)*(m+l),h+Math.sin(C)*(m+l)])}o.sort((c,h)=>c[0]-h[0]||c[1]-h[1]);let r=(c,h,m)=>(h[0]-c[0])*(m[1]-c[1])-(h[1]-c[1])*(m[0]-c[0]),d=[],u=[];for(let c of o){for(;d.length>1&&r(d.at(-2),d.at(-1),c)<=0;)d.pop();d.push(c)}for(let c of o.reverse()){for(;u.length>1&&r(u.at(-2),u.at(-1),c)<=0;)u.pop();u.push(c)}return d.slice(0,-1).concat(u.slice(0,-1))},a=kn(s(n+.003));return a.holes.push(new X.Path(s(.003).map(([l,o])=>new X.Vector2(l,o)))),new X.ExtrudeGeometry(a,{depth:t-e,bevelEnabled:!1,curveSegments:1}).translate(0,0,e)}function Hn(){let i=[],e=(f,E,{pivot:g=[0,0,0],spin:M=0}={})=>{let H=hs(E).translate(-g[0],-g[1],-g[2]);i.push({name:f,geo:H,pivot:g.map((b,F)=>b+us[F]),spin:M})},t=[-.33,-.11,.11,.33];e("oil_pan",[fe([[-.2,0],[.2,0],[.27,.2],[.27,.27],[-.27,.27],[-.27,.2]],-.48,.42),kt(.6,.03,.96,{p:[0,.285,-.02]}),$t(.025,.03,{p:[0,-.01,-.3]},6)]);let n=[fe([[-.3,.3],[.3,.3],[.3,.6],[.56,.84],[.36,1.04],[.1,.8],[-.1,.8],[-.36,1.04],[-.56,.84],[-.3,.6]],-.5,.46)];for(let f of[1,-1]){for(let E of[-.36,-.12,.12,.36])n.push(kt(.02,.26,.035,{p:[f*.31,.45,E]}));n.push(kt(.08,.07,.12,{p:[f*.34,.52,.16]}))}e("block",n),e("bellhousing",[yt(.24,-.72,-.52,0,.5,40,.37),yt(.39,-.52,-.5,0,.5,40),yt(.06,-.66,-.42,-.31,.3,20),yt(.035,-.42,-.36,-.31,.3,16)]);let s=[[-.14,0],[.14,0],[.135,.05],[.1,.095],[-.1,.095],[-.135,.05]];for(let f of[1,-1]){let E=f>0?"r":"l",g=-f*Math.PI/4,M=[f*Math.SQRT1_2,Math.SQRT1_2],H=[f*Math.SQRT1_2,-Math.SQRT1_2],b=(w,P)=>[f*.46+H[0]*w+M[0]*P,.94+H[1]*w+M[1]*P],F=(w,P,K)=>({p:[...b(w,P),K],r:[0,0,g]}),J=[kt(.3,.14,.92,F(0,.07,-.02))];for(let w of t){let[P,K]=b(.15,.085),at=Qt(f,-.3,0).normalize();J.push(Me([P,K,w],[P+at.x*.09,K+at.y*.09,w],.022,12)),J.push(Me([P+at.x*.09,K+at.y*.09,w],[P+at.x*.12,K+at.y*.12,w],.014,6))}e(`head_${E}`,J);let v=[kt(.3,.02,.9,F(0,.15,-.02)),fe(s,-.44,.4,F(0,.16,0))];for(let w of[-.32,-.16,0,.16])v.push(kt(.18,.014,.03,F(0,.262,w)));for(let w of[-.38,-.02,.34])for(let P of[-.135,.135])v.push($t(.013,.025,F(P,.17,w),6));f>0&&v.push($t(.04,.035,F(0,.272,.3),24),kt(.07,.012,.014,F(0,.295,.3))),e(`valve_cover_${E}`,v);let[z,_]=b(.17,.07),R=[kt(.02,.11,.88,F(.16,.07,-.02))];for(let w of t)R.push(An([[z,_,w],[z+f*.07,_-.03,w],[f*.76,.71,w*.75-.04],[f*.75,.59,w*.35-.2],[f*.73,.53,-.4]],.03));R.push(An([[f*.73,.54,-.34],[f*.73,.51,-.52],[f*.7,.42,-.64],[f*.62,.3,-.7]],.05,32,18)),e(`exhaust_${E}`,R)}let a=[fe([[-.16,.86],[.16,.86],[.19,1.05],[.15,1.12],[-.15,1.12],[-.19,1.05]],-.42,.4)];for(let f of[1,-1])for(let E of t)a.push(Tn([f*.15,1.03,E],[f*.39,1.08,E],.07,.065));a.push(yt(.035,.4,.5,0,.99,16),kt(.09,.05,.05,{p:[0,.99,.37]})),e("intake",a),e(qe,[kt(.17,.08,.15,{p:[0,1.16,-.02]}),$t(.25,.015,{p:[0,1.2075,-.02]},48),$t(.24,.08,{p:[0,1.255,-.02]},48),$t(.255,.02,{p:[0,1.305,-.02]},48),$t(.012,.05,{p:[0,1.335,-.02]},8),kt(.09,.022,.022,{p:[0,1.35,-.02]}),kt(.1,.06,.18,{p:[0,1.255,.28]})]);let l=[$t(.04,.2,{p:[0,.96,-.48]},20),$t(.07,.06,{p:[0,1.09,-.48]},28)];for(let f=0;f<6;f++){let E=f/6*Math.PI*2;l.push($t(.012,.03,{p:[Math.cos(E)*.045,1.135,-.48+Math.sin(E)*.045]},8))}e("distributor",l);let o=2.2,r=[0,.38,.11],d=[0,.74,.1],u=[.38,.7,.055],c=[-.36,.6,.08];e("timing_cover",[fe([[-.15,.27],[.15,.27],[.2,.42],[.15,.84],[-.15,.84],[-.2,.42]],.46,.52),yt(.075,.52,.6,d[0],d[1],28)]),e("belt",[fs([r,d,u,c],.605,.635,.015)]);let h=(f,E,g,M,H,b,F=.012)=>Array.from({length:M},(J,v)=>{let z=v/M*Math.PI*2;return yt(F,H,b,f+Math.cos(z)*g,E+Math.sin(z)*g,6)});e("crank_pulley",[yt(.13,.52,.575,r[0],r[1],40),yt(.11,.575,.645,r[0],r[1],40),yt(.035,.645,.675,r[0],r[1],6),...h(r[0],r[1],.07,6,.645,.66),kt(.012,.03,.04,{p:[r[0],r[1]+.12,.55]})],{pivot:[r[0],r[1],0],spin:o});let m=[yt(.1,.6,.645,d[0],d[1],40),...h(d[0],d[1],.06,4,.645,.66),yt(.055,.645,.7,d[0],d[1],24),yt(.085,.665,.68,d[0],d[1],24)];for(let f=0;f<5;f++){let E=f/5*Math.PI*2,g=new X.Quaternion().setFromAxisAngle(Qt(0,0,1),E-Math.PI/2).multiply(new X.Quaternion().setFromAxisAngle(Rn,.45));m.push(kt(.075,.17,.012,{p:[d[0]+Math.cos(E)*.165,d[1]+Math.sin(E)*.165,.69],q:g}))}e("fan",m,{pivot:[d[0],d[1],0],spin:o*r[2]/d[2]}),e("alternator",[yt(.1,.47,.585,u[0],u[1],32),Tn([u[0]-.06,u[1]-.05,.5],[.28,.6,.48],.03,.03)]);let y=[yt(.085,.585,.6,u[0],u[1],32),yt(u[2],.6,.65,u[0],u[1],24),yt(.022,.65,.67,u[0],u[1],6)];for(let f=0;f<8;f++){let E=f/8*Math.PI*2;y.push(kt(.012,.028,.012,{p:[u[0]+Math.cos(E)*.07,u[1]+Math.sin(E)*.07,.606],r:[0,0,E-Math.PI/2]}))}e("alternator_pulley",y,{pivot:[u[0],u[1],0],spin:o*r[2]/u[2]}),e("steering_pump",[yt(.07,.47,.59,c[0],c[1],28),$t(.045,.06,{p:[c[0],c[1]+.09,.53]},24)]),e("steering_pulley",[yt(c[2],.59,.65,c[0],c[1],32),yt(.025,.65,.67,c[0],c[1],6),...h(c[0],c[1],.048,3,.65,.658,.016)],{pivot:[c[0],c[1],0],spin:o*r[2]/c[2]});let C=[Me([.29,.45,.12],[.45,.37,.12],.065,32)];for(let f of[.35,.55,.75]){let E=[.29+.16*f,.45-.08*f,.12],g=[E[0]+.009,E[1]-.0045,.12];C.push(Me(E,g,.069,32))}return e("oil_filter",C),i}var ps="http://www.w3.org/2000/svg",vt={line:"#A3A3A3",text:"#6B6B6B",bright:"#001e3c",warn:"#efb814",halo:"#F1F1F1"},Ln="ABCDEFGHJKLMNPRSTUVWXYZ0123456789/#+",qt=(i,e=0,t=1)=>Math.min(t,Math.max(e,i)),re=(i,e)=>Math.hypot(e[0]-i[0],e[1]-i[1]),_n=(i,e,t)=>[i[0]+(e[0]-i[0])*t,i[1]+(e[1]-i[1])*t];function ms(i,e){if(e>=1)return i;let t=0;for(let a=1;a<i.length;a++)t+=re(i[a-1],i[a]);let n=t*e,s=[i[0]];for(let a=1;a<i.length;a++){let l=re(i[a-1],i[a]);if(n>=l){s.push(i[a]),n-=l;continue}s.push(_n(i[a-1],i[a],l?n/l:0));break}return s}function ys(i,e){if(e>=.999)return i;let t=Math.floor(i.length*e),n="";for(let s=t;s<Math.min(i.length,t+2);s++)n+=i[s]===" "?" ":Ln[(Math.floor(e*i.length*8)+s*7)%Ln.length];return i.slice(0,t)+n}function In(i){let e=new Map,t=new Set,n=(o,r)=>{let d=e.get(o);return d||(d=document.createElementNS(ps,r),i.append(d),e.set(o,d)),t.add(o),d},s=(o,r)=>{for(let d in r)o.setAttribute(d,r[d]);return o},a=o=>o.map(r=>`${r[0].toFixed(1)},${r[1].toFixed(1)}`).join(" "),l={begin(){t=new Set},end(){for(let[o,r]of e)r.style.display=t.has(o)?"":"none"},line(o,r,{draw:d=1,alpha:u=1,dash:c="",color:h=vt.line,width:m=1}={}){u<=.01||d<=.001||s(n(o,"polyline"),{points:a(ms(r,d)),stroke:h,"stroke-width":m,"stroke-dasharray":c,fill:"none",opacity:u.toFixed(3)})},text(o,r,d,u,{draw:c=1,alpha:h=1,color:m=vt.text,anchor:y="start",angle:C=0,size:f=10,weight:E=500,spacing:g=.12}={}){if(h<=.01||c<=.001)return;let M=s(n(o,"text"),{x:r.toFixed(1),y:d.toFixed(1),fill:m,"text-anchor":y,opacity:h.toFixed(3),"font-size":f,"font-weight":E,"letter-spacing":`${g}em`,transform:C?`rotate(${C.toFixed(2)} ${r.toFixed(1)} ${d.toFixed(1)})`:""});M.textContent=ys(u,c)},circle(o,r,d,u,{alpha:c=1,color:h=vt.line,fill:m="none",width:y=1,dash:C=""}={}){c<=.01||u<=0||s(n(o,"circle"),{cx:r.toFixed(1),cy:d.toFixed(1),r:u.toFixed(1),stroke:h,fill:m,"stroke-width":y,"stroke-dasharray":C,opacity:c.toFixed(3)})},rect(o,r,d,u,c,{alpha:h=1,color:m=vt.line,fill:y=vt.halo}={}){h<=.01||s(n(o,"rect"),{x:r.toFixed(1),y:d.toFixed(1),width:u,height:c,stroke:m,fill:y,opacity:h.toFixed(3)})},dim(o,r,d,u,c,h,{draw:m=1,alpha:y=1,color:C=vt.line}={}){if(y<=.01||m<=.001||re(u,c)<12)return;let f=(w,P)=>{let K=re(w,P)||1,at=(P[0]-w[0])/K,Ft=(P[1]-w[1])/K;return[[w[0]+at*4,w[1]+Ft*4],[P[0]+at*6,P[1]+Ft*6]]},E=qt(m/.35);l.line(`${o}:ea`,f(r,u),{draw:E,alpha:y,color:C}),l.line(`${o}:eb`,f(d,c),{draw:E,alpha:y,color:C});let g=qt((m-.2)/.5),M=_n(u,c,.5);l.line(`${o}:m1`,[M,u],{draw:g,alpha:y,color:C}),l.line(`${o}:m2`,[M,c],{draw:g,alpha:y,color:C});let H=re(u,c),b=(c[0]-u[0])/H,F=(c[1]-u[1])/H,J=(w,P)=>{let K=(b-F)*4.5,at=(F+b)*4.5;l.line(`${o}:t${P}`,[[w[0]-K,w[1]-at],[w[0]+K,w[1]+at]],{draw:g>=1?1:0,alpha:y,color:vt.text})};J(u,"a"),J(c,"b");let v=Math.atan2(F,b)*180/Math.PI;v>90&&(v-=180),v<-90&&(v+=180);let z=re(r,u)||1,_=(u[0]-r[0])/z,R=(u[1]-r[1])/z;l.text(`${o}:l`,M[0]+_*11,M[1]+R*11+3.5,h,{draw:qt((m-.55)/.45),alpha:y,angle:v,anchor:"middle"})},callout(o,r,d,u,c,{draw:h=1,alpha:m=1,color:y=vt.line,textColor:C=vt.text,shelf:f=64,sub:E=""}={}){if(m<=.01||h<=.001)return;let g=Math.sign(u)||1,M=[r[0]+u,r[1]+c],H=[M[0]+g*f,M[1]];l.circle(`${o}:d`,r[0],r[1],2.2,{alpha:m,color:C,fill:C}),l.line(`${o}:l`,[r,M,H],{draw:qt(h/.6),alpha:m,color:y});let b=M[0]+g*2,F=g>0?"start":"end",J=qt((h-.45)/.55);l.text(`${o}:t`,b,M[1]-6,d,{draw:J,alpha:m,color:C,anchor:F}),E&&l.text(`${o}:s`,b,M[1]+13,E,{draw:J,alpha:m*.8,anchor:F,size:9})},tag(o,r,d,u,{draw:c=1,alpha:h=1}={}){if(h<=.01||c<=.001)return;let m=h*qt(c/.3);l.rect(`${o}:r`,r[0]-8,r[1]-8,16,16,{alpha:m,color:vt.text}),l.text(`${o}:n`,r[0],r[1]+3.5,d,{alpha:m,color:vt.bright,anchor:"middle",spacing:0}),l.text(`${o}:t`,r[0]+13,r[1]+3.5,u,{draw:qt((c-.3)/.7),alpha:h})},reticle(o,r,d,u,c,{draw:h=1,alpha:m=1,color:y=vt.warn,pulse:C=1,flip:f=!1}={}){if(m<=.01||h<=.001)return;let E=qt(h/.5),g=d*(1.25-.25*E);l.circle(`${o}:c`,r[0],r[1],g,{alpha:m*E*(.55+.45*C),color:y,width:1.2}),l.circle(`${o}:c2`,r[0],r[1],g+7,{alpha:m*E*.5,color:y,dash:"2 5"});for(let _=0;_<4;_++){let R=_*Math.PI/2,w=Math.cos(R),P=Math.sin(R);l.line(`${o}:x${_}`,[[r[0]+w*(g-5),r[1]+P*(g-5)],[r[0]+w*(g+12),r[1]+P*(g+12)]],{alpha:m*E,color:y})}if(!u&&!c)return;let M=f?-1:1,H=[r[0]+M*g*.87,r[1]-g*.5],b=[H[0]+M*28,H[1]-16],F=[b[0]+M*160,b[1]];l.line(`${o}:l`,[H,b,F],{draw:qt((h-.3)/.4),alpha:m,color:y});let J=qt((h-.55)/.45),v=b[0]+M*2,z=f?"end":"start";l.text(`${o}:t`,v,b[1]-7,u,{draw:J,alpha:m*(.6+.4*C),color:vt.bright,weight:600,anchor:z}),l.text(`${o}:s`,v,b[1]+14,c,{draw:J,alpha:m,size:9,anchor:z})}};return l}var ce={outline:"#818181",carEdge:"#A3A3A3",engineEdge:"#999999",side:"#F1F1F1",top:"#F1F1F1",warn:"#efb814"},Jt=1e4,On=Jt/4,Te=1.06,Fn=.5,Ve=new x.Color(ce.warn),Ge=Math.PI/180,Pn=matchMedia("(prefers-reduced-motion: reduce)"),le=()=>Pn.matches,bs=[.23,.47,.72,.995],Ae=(i,e=0,t=1)=>Math.min(t,Math.max(e,i));function vs(){if(document.getElementById("car-scene-styles"))return;let i=document.createElement("style");i.id="car-scene-styles",i.textContent=`
:where([data-car-scene]){position:relative;overflow:hidden}
[data-car-scene] canvas,[data-car-scene] .car-notes{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
[data-car-scene] .car-notes{overflow:visible;font-family:var(--car-notes-font,DegularMono,ui-monospace,monospace);text-transform:uppercase}
[data-car-scene] .car-notes text{paint-order:stroke;stroke:var(--car-paper,#f1f1f1);stroke-width:3px;stroke-linejoin:round}
[data-car-scene].car-ready [data-car-poster]{opacity:0;visibility:hidden}
[data-car-scene].car-fallback canvas,[data-car-scene].car-fallback .car-notes{display:none}
[data-car-poster]{transition:opacity .4s ease,visibility .4s}
:where([data-car-stop]){cursor:pointer}`,document.head.append(i)}var xs=i=>i<.25?["PURSUE AT ALL TIMES","RUN ATTACKS 24/7"]:i<.585?["EXPLOIT CONFIRMED","ATTACK PATH · VALIDATED"]:i<.755?["DEFENSES UNDER TEST","VALIDATION · IN PROGRESS"]:["RETEST PASSED","ATTACK PATH · CLOSED"];function Re(i,e,t){let n=(i.getAttribute(e)||"").trim().split(/[\s,]+/).map(Number);return n.length===4&&n.every(Number.isFinite)?n:t}function ws(i){let e=i.closest("[data-car-scroll]")||document.querySelector("[data-car-scroll]"),t=e?.querySelector("[data-car-pin]"),n=[...(e||document).querySelectorAll("[data-car-card]")],s=(e||document).querySelector("[data-car-timeline]"),a=[...(e||document).querySelectorAll("[data-car-stop]")],l=(e||document).querySelector("[data-car-caption]"),o=!1;function r(R){if(!l)return;let[w,P]=xs(R),K=l.querySelector("strong"),at=l.querySelector("span");K&&K.textContent!==w&&(K.textContent=w),at&&at.textContent!==P&&(at.textContent=P),l.hidden=!(o||i.clientWidth<640)||!o&&R<.25}let d=0;function u(){if(!t)return;let R=parseFloat(getComputedStyle(t).getPropertyValue("--car-pin-clearance"))||0;d=Math.min(0,innerHeight-t.offsetHeight+R),t.style.top=`${d}px`}let c=()=>{let R=e.nextElementSibling;return R?Math.max(0,-parseFloat(getComputedStyle(R).marginTop)||0):0},h=()=>Math.max(1,e.offsetHeight-(t?t.offsetHeight:innerHeight)-c());function m(){return e?Ae((d-e.getBoundingClientRect().top)/h()):0}function y(R){let w=Math.min(3,Math.floor(R*4)),P=R*3;n.forEach((K,at)=>{let Ft=at===w;K.classList.toggle("is-active",Ft),K.matches("button")&&K.setAttribute("aria-pressed",String(Ft));let ht=K.querySelector("[data-car-bar]");ht&&(ht.style.transformOrigin="left center",ht.style.transform=`scaleX(${Ae(P-at+.5)})`)}),s&&(s.style.setProperty("--car-line",R.toFixed(4)),s.style.setProperty("--car-progress",R.toFixed(4))),a.forEach((K,at)=>{K.classList.toggle("is-reached",at<=w),K.classList.toggle("is-active",at===w)})}function C(R){if(!e)return;let w=e.getBoundingClientRect().top+scrollY-d+h()*bs[R];window.lenis?.scrollTo?window.lenis.scrollTo(w,{immediate:le()}):scrollTo({top:w,behavior:le()?"auto":"smooth"})}n.forEach((R,w)=>R.addEventListener("click",()=>C(w))),a.forEach((R,w)=>{R.matches("button, a")||(R.setAttribute("role","button"),R.tabIndex=0),R.addEventListener("click",()=>C(w)),R.addEventListener("keydown",P=>{(P.key==="Enter"||P.key===" ")&&(P.preventDefault(),C(w))})}),a[0]?.closest('[aria-hidden="true"]')?.removeAttribute("aria-hidden"),vs();let f=document.createElement("canvas");f.setAttribute("aria-hidden","true");let E=document.createElementNS("http://www.w3.org/2000/svg","svg");E.setAttribute("class","car-notes"),E.setAttribute("aria-hidden","true"),i.append(f,E),u();let g=m(),M=g,H=!1,b=performance.now(),F=()=>{};function J(){g=m(),y(g),o&&r(g),F()}addEventListener("scroll",J,{passive:!0}),addEventListener("resize",()=>{u(),J()}),t&&new ResizeObserver(()=>{u(),J()}).observe(t),document.fonts?.ready.then(()=>{u(),J()}),y(g);function v(R){o||(o=!0,i.classList.add("car-fallback"),i.classList.remove("car-ready"),r(g),R&&console.warn("Car scene uses its static illustration.",R))}function z(){let R=new x.WebGLRenderer({canvas:f,antialias:!0,alpha:!0});R.setClearColor(0,0);let w=new x.Scene,P=new x.Group;w.add(P);let K=1;class at{constructor(S){this.r=S,this.rt=new x.WebGLRenderTarget(1,1,{minFilter:x.NearestFilter,magFilter:x.NearestFilter,depthTexture:new x.DepthTexture(1,1)}),this.mat=new x.ShaderMaterial({uniforms:{tId:{value:this.rt.texture},tDepth:{value:this.rt.depthTexture},uTexel:{value:new x.Vector2},uW:{value:2},uColor:{value:new x.Color(ce.outline)},uWarnCol:{value:Ve}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",fragmentShader:`
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
        }`,transparent:!0,depthTest:!1,depthWrite:!1});let T=new x.Mesh(new x.PlaneGeometry(2,2),this.mat);T.frustumCulled=!1,this.qs=new x.Scene,this.qs.add(T),this.qc=new x.OrthographicCamera(-1,1,1,-1,0,1)}setSize(S){let T=this.r.getDrawingBufferSize(new x.Vector2);this.rt.setSize(T.x,T.y),this.mat.uniforms.uTexel.value.set(1/T.x,1/T.y),this.mat.uniforms.uW.value=S*this.r.getPixelRatio()}render(S,T){let k=this.r;T.layers.set(K),k.setRenderTarget(this.rt),k.setClearColor(0,0),k.clear(),k.render(S,T),T.layers.set(0),k.setRenderTarget(null),k.clear(),k.render(S,T),k.autoClear=!1,k.render(this.qs,this.qc),k.autoClear=!0}}let Ft=new at(R),ht="varying vec3 vN; void main(){ vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",Le=`
  uniform vec3 uSide; uniform vec3 uTop; uniform vec3 uWarnCol; uniform float uOpacity; uniform float uWarn; varying vec3 vN;
  void main() {
    vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
    float t = smoothstep(0.3, 0.95, n.y);        // upward faces read a touch lighter, like the safety tops
    vec3 col = mix(mix(uSide, uTop, t), uWarnCol, uWarn * 0.08);
    gl_FragColor = vec4(col, uOpacity);
    #include <colorspace_fragment>
  }`,_e=1,ye=[];function Ie(p,S){let T=new Float32Array(S,p.pos,p.nv*3),k=new Uint32Array(S,p.idx,p.nf*3),rt=new Uint32Array(S,p.edge,p.ne*2),Z=new x.BufferGeometry;Z.setAttribute("position",new x.BufferAttribute(T,3)),Z.setIndex(new x.BufferAttribute(k,1)),Z.computeVertexNormals();let it=new Float32Array(p.ne*6);for(let tt=0;tt<p.ne;tt++){let pt=rt[tt*2]*3,At=rt[tt*2+1]*3;it.set([T[pt],T[pt+1],T[pt+2],T[At],T[At+1],T[At+2]],tt*6)}let ft=new x.Box3(new x.Vector3(...p.min),new x.Vector3(...p.max));if(!/^tire/.test(p.name))return{name:p.name,kind:"car",geo:Z,seg:it,box:ft};let st=ft.getCenter(new x.Vector3);Z.translate(-st.x,-st.y,-st.z);for(let tt=0;tt<it.length;tt+=3)it[tt]-=st.x,it[tt+1]-=st.y,it[tt+2]-=st.z;return{name:p.name,kind:"car",geo:Z,seg:it,box:ft,pivot:st.toArray(),roll:!0}}function Oe({name:p,geo:S,pivot:T,spin:k}){let rt=new x.EdgesGeometry(S,30).attributes.position.array;S.computeBoundingBox();let Z=S.boundingBox.clone();if(k){let it=Math.max(-Z.min.x,Z.max.x,-Z.min.y,Z.max.y);Z.min.x=Z.min.y=-it,Z.max.x=Z.max.y=it}return{name:p,kind:"engine",geo:S,seg:rt,pivot:T,spin:k,box:Z.translate(new x.Vector3(...T))}}function j({name:p,kind:S,geo:T,seg:k,box:rt,pivot:Z=[0,0,0],spin:it=0,roll:ft=!1}){let st={value:1},tt={value:0},pt=new x.ShaderMaterial({uniforms:{uSide:{value:new x.Color(ce.side)},uTop:{value:new x.Color(ce.top)},uWarnCol:{value:Ve},uOpacity:st,uWarn:tt},vertexShader:ht,fragmentShader:Le,side:x.DoubleSide,polygonOffset:!0,polygonOffsetFactor:1,polygonOffsetUnits:1,transparent:!0}),At=_e++,mt=new x.ShaderMaterial({uniforms:{uId:{value:new x.Vector2((At&255)/255,(At>>8&255)/255)},uOpacity:st,uWarn:tt},vertexShader:"void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:"uniform vec2 uId; uniform float uOpacity; uniform float uWarn; void main(){ gl_FragColor = vec4(uId, uOpacity, 1.0 - 0.45 * uWarn); }",side:x.DoubleSide}),Lt=new Zt;Lt.setPositions(k);let jt=new x.Color(S==="car"?ce.carEdge:ce.engineEdge),zt=new Yt({color:jt.clone(),linewidth:.6,worldUnits:!1,transparent:!0});ye.push(zt);let Bt=new x.Group,ot=new x.Group;ot.position.set(...Z);let Xt=new x.Mesh(T,pt),ge=new x.Mesh(T,mt);return ge.layers.set(K),ot.add(Xt,ge,new oe(Lt,zt)),Bt.add(ot),{name:p,kind:S,group:Bt,spinner:ot,spin:it,roll:ft,opacity:st,warn:tt,fill:pt,lineMat:zt,baseColor:jt,box:rt,center:rt.getCenter(new x.Vector3),size:rt.getSize(new x.Vector3)}}function N(p){let S=q(p);return S.v[1]*=.72,S}function q(p){let S=p.name,T=Math.sign(p.center.x)||1;return/^tire_cap/.test(S)?{v:[T*3,0,0],k:.35}:/^tire_rim/.test(S)?{v:[T*2.25,0,0],k:.3}:/^tire_\d/.test(S)?{v:[T*1.5,0,0],k:.25}:S==="car_hood"?{v:[0,2.6,.5],k:1}:/windshield|Object_26|Object_27/.test(S)?{v:[0,3.25,.3],k:.95}:S==="car_body"?{v:[0,1.85,0],k:.85}:S==="dor handels"?{v:[0,1.75,0],k:.8}:S==="car_doors"?{v:[0,1.35,0],k:.75}:/interior|Object_25/.test(S)?{v:[0,1,-.35],k:.7}:/front_light_cap|front_light_03/.test(S)?{v:[0,.35,2.2],k:.6}:/front_light|front_grill_frame/.test(S)?{v:[0,.1,1.85],k:.55}:S==="front_bumper"?{v:[0,-.25,1.6],k:.5}:S==="front_grill"?{v:[0,-.45,0],k:.45}:S==="back_lights"?{v:[0,.2,-1.9],k:.55}:S==="exhaust"?{v:[0,-.5,-1.6],k:.4}:S==="back_plate"?{v:[0,-1.65,0],k:.15}:S==="car_bottom"?{v:[0,-1.05,0],k:.1}:{v:p.center.clone().sub(new x.Vector3(0,1.2,0)).multiplyScalar(.6).toArray(),k:.5}}let L=new x.Vector3(1,.62,1.12).normalize(),$=new x.OrthographicCamera(-1,1,1,-1,.1,400),U={mix:0,wide:0},W={level:0},I={v:1},B={v:1},G={deg:-26},lt=[],Y=[],et=[],O=[],Q=[],nt=null,Mt=null,D=new x.Box3,ct=new x.Box3,ut=p=>lt.find(S=>S.name===p),Ct,bt,Pt={hw:1,hh:1},dt={hw:1,hh:1},Tt={hw:1,hh:1},Vt=p=>new URL(`../../${_t[`car/${p}`]}`,import.meta.url);async function se(){let[p,S]=await Promise.all([fetch(Vt("parts.json")).then(k=>{if(!k.ok)throw new Error(`parts.json ${k.status}`);return k.json()}),fetch(Vt("parts.bin")).then(k=>{if(!k.ok)throw new Error(`parts.bin ${k.status}`);return k.arrayBuffer()})]);Y=p.parts.filter(k=>k.group==="car").map(k=>j(Ie(k,S))),et=Hn().map(k=>j(Oe(k))),lt=[...Y,...et];for(let k of lt)P.add(k.group);O=et.filter(k=>k.spin),Q=Y.filter(k=>k.roll),nt=et.find(k=>k.name===qe);let T=k=>k.reduce((rt,Z)=>rt.union(Z.box),new x.Box3);D=T(Y),ct=T(et),Ct=D.getCenter(new x.Vector3),bt=ct.getCenter(new x.Vector3);for(let k of Y)k.move=N(k);[...Y].sort((k,rt)=>new x.Vector3(...rt.move.v).length()-new x.Vector3(...k.move.v).length()).forEach((k,rt,Z)=>{k.fadeRank=rt/(Z.length-1)}),nt.move={v:[0,Fn,0]},te(),Mt=Fe()}function te(){let p=new x.Vector3,S=new x.Vector3,T=new x.Matrix4().lookAt(L,new x.Vector3,new x.Vector3(0,1,0)).invert(),k=(Z,it,ft,st)=>{P.rotation.y=ft*Ge,P.updateMatrixWorld(!0),S.copy(st).applyMatrix4(P.matrixWorld).applyMatrix4(T);let tt=0,pt=0;for(let At of Z){let mt=At.box.clone();it&&At.move&&mt.translate(new x.Vector3(...At.move.v).multiplyScalar(it));for(let Lt=0;Lt<8;Lt++)p.set(Lt&1?mt.max.x:mt.min.x,Lt&2?mt.max.y:mt.min.y,Lt&4?mt.max.z:mt.min.z).applyMatrix4(P.matrixWorld).applyMatrix4(T),tt=Math.max(tt,Math.abs(p.x-S.x)),pt=Math.max(pt,Math.abs(p.y-S.y))}return{hw:tt,hh:pt}},rt=(Z,it,ft,st=[0,1])=>{let tt={hw:0,hh:0};for(let pt of it)for(let At of st){let mt=k(Z,At,pt,ft);tt.hw=Math.max(tt.hw,mt.hw),tt.hh=Math.max(tt.hh,mt.hh)}return tt};Pt=rt(Y,[-26,-18,-12,-4,10,20],Ct,[0,1,Te]),dt=rt(et,[16,20,24],bt,[0]),Tt=rt(et,[16,20,24],bt,[1]),P.rotation.y=G.deg*Ge}function Fe(){let p=gs({autoplay:!1}),S="inOutCubic",T=On;p.add(G,{deg:[{to:-12,duration:T,ease:"inOutSine"},{to:16,duration:T,ease:"inOutSine"},{to:24,duration:T,ease:"inOutSine"},{to:20,duration:T*.3,ease:"inOutSine"},{to:-26,duration:T*.7,ease:"inOutSine"}]},0);for(let k of Y){let[rt,Z,it]=k.move.v,ft=k.move.k,st=k.fadeRank;p.add(k.group.position,{x:rt,y:Z,z:it,duration:1400,ease:S},350+(1-ft)*500),p.add(k.group.position,{x:rt*Te,y:Z*Te,z:it*Te,duration:900,ease:"outSine"},T+st*150),p.add(k.opacity,{value:[{to:0,duration:450,ease:"inOutSine"}]},T+st*250),p.add(k.opacity,{value:[{to:1,duration:400,ease:"inOutSine"}]},T*3+1300+(1-st)*150),p.add(k.group.position,{x:0,y:0,z:0,duration:550,ease:S},T*3+1650+(1-ft)*100)}return p.add(B,{v:[{to:0,duration:450,ease:"inOutSine"}]},100),p.add(B,{v:[{to:1,duration:500,ease:"inOutSine"}]},Jt-520),p.add(U,{mix:[{to:1,duration:1900,ease:S}]},T+150),p.add(W,{level:[{to:1,duration:300,ease:"inOutSine"}]},T+100),p.add(I,{v:[{to:0,duration:700,ease:"inOutSine"}]},T*2),p.add(nt.group.position,{y:Fn,duration:1100,ease:S},T*2+900),p.add(U,{wide:[{to:1,duration:1100,ease:S}]},T*2+900),p.add(W,{level:[{to:0,duration:450,ease:"inOutSine"}]},T*3+50),p.add(nt.group.position,{y:0,duration:650,ease:S},T*3+350),p.add(U,{wide:[{to:0,duration:650,ease:S}]},T*3+350),p.add(I,{v:[{to:1,duration:800,ease:"inOutSine"}]},T*3+500),p.add(U,{mix:[{to:0,duration:850,ease:S}]},T*3+750),p.add({duration:1},Jt-1),p}let Rt=1,Dt=1,gt=0,Gt=matchMedia("(min-width: 901px)"),Ht={};function Pe(){Ht.car=Gt.matches?Re(i,"data-car-layout",[.23,.15,.93,1]):Re(i,"data-car-layout-mobile",[.02,.04,.98,.96]),Ht.engine=Gt.matches?Re(i,"data-engine-layout",[.36,.04,.86,.98]):Re(i,"data-engine-layout-mobile",[.04,.04,.96,.96]);let p=S=>{let T=parseFloat(i.getAttribute(S));return T>0?T:1};Ht.carZoom=p("data-car-zoom"),Ht.engineZoom=p("data-engine-zoom"),F()}Pe(),Gt.addEventListener("change",Pe),new MutationObserver(Pe).observe(i,{attributes:!0,attributeFilter:["data-car-layout","data-engine-layout","data-car-layout-mobile","data-engine-layout-mobile","data-car-zoom","data-engine-zoom"]});let an=()=>[Math.max(1,i.clientWidth),Math.max(1,i.clientHeight)];function De(){[Rt,Dt]=an(),R.setPixelRatio(Math.min(devicePixelRatio||1,2)),R.setSize(Rt,Dt,!1);for(let p of ye)p.resolution.set(Rt,Dt);Ft.setSize(.65),E.setAttribute("viewBox",`0 0 ${Rt} ${Dt}`),F()}new ResizeObserver(De).observe(i);function ze(){return!o&&H&&!document.hidden&&!!Mt}F=()=>{if(!ze()){cancelAnimationFrame(gt),gt=0;return}gt||(b=performance.now(),gt=requestAnimationFrame(cn))},f.addEventListener("webglcontextlost",p=>{p.preventDefault(),cancelAnimationFrame(gt),gt=0,R.dispose(),v()}),document.addEventListener("visibilitychange",F),Pn.addEventListener("change",F),new IntersectionObserver(p=>{H=p[p.length-1].isIntersecting,F()}).observe(i);let rn=new x.Vector3,ln=new x.Vector3;function cn(p){if(gt=0,!ze())return;let S=Ae((p-b)/1e3,0,.1);b=p;let[T,k]=an();(T!==Rt||k!==Dt||R.getPixelRatio()!==Math.min(devicePixelRatio||1,2))&&De(),M=le()?g:M+(g-M)*(1-Math.exp(-S*5)),Math.abs(M-g)<1e-4&&(M=g),Mt.seek(M*Jt);let rt=le()?0:2.5*Math.sin(p/9e3*Math.PI*2);P.rotation.y=(G.deg+rt)*Ge,P.updateMatrixWorld(!0),rn.copy(Ct).applyMatrix4(P.matrixWorld),ln.copy(bt).applyMatrix4(P.matrixWorld);let Z=rn.lerp(ln,U.mix);$.position.copy(Z).addScaledVector(L,60),$.lookAt(Z);let it=(ot,Xt,ge)=>{let hn=l&&Rt<640?Math.max(100,Dt-72):Dt,Xn=Rt*(ot[2]-ot[0]),fn=hn*(ot[3]-ot[1]);return{wpp:2*Math.max(Xt.hw/(Xn/fn),Xt.hh)*ge/fn,cx:Rt*(ot[0]+ot[2])/2,cy:hn*(ot[1]+ot[3])/2}},ft=it(Ht.car,Pt,1.06/Ht.carZoom),st=it(Ht.engine,dt,1.42/Ht.engineZoom),tt=it(Ht.engine,Tt,1.3/Ht.engineZoom),pt=U.mix,At=st.wpp*Math.pow(tt.wpp/st.wpp,U.wide),mt=ft.wpp*Math.pow(At/ft.wpp,pt),Lt=ft.cx+(st.cx-ft.cx)*pt,jt=ft.cy+(st.cy-ft.cy)*pt;$.left=-Lt*mt,$.right=(Rt-Lt)*mt,$.top=jt*mt,$.bottom=-(Dt-jt)*mt,$e=1/mt,$.updateProjectionMatrix();let zt=le()?0:1;for(let ot of O)ot.spinner.rotation.z-=S*ot.spin*I.v*zt;for(let ot of Q)ot.spinner.rotation.x+=S*3.2*B.v*zt;let Bt=zt?.5+.5*Math.cos(p/1e3*Math.PI*2*1.5):1;nt.warn.value=W.level*(.3+.7*Bt),nt.lineMat.color.copy(nt.baseColor).lerp(Ve,nt.warn.value);for(let ot of lt){let Xt=ot.opacity.value;ot.group.visible=Xt>.01,ot.fill.depthWrite=Xt>.98,ot.lineMat.opacity=Xt}Ft.render(w,$),jn(M*Jt,Bt),ze()&&!le()&&!gt&&(gt=requestAnimationFrame(cn))}let ie=In(E),Be=new x.Vector3,$e=1,ue=p=>(Be.copy(p).applyMatrix4(P.matrixWorld).project($),[(Be.x+1)/2*Rt,(1-Be.y)/2*Dt]),dn=(p,S,T)=>new x.Vector3(p,S,T),ee=(p,S,T)=>Math.min(1,Math.max(0,(p-S)/(T-S))),un=p=>p.center.clone().add(p.group.position),It=On,Gn=["front_windshield","car_hood","car_body","tire_04","front_bumper","back_lights"];function jn(p,S){ie.begin();let T=Rt<640;r(p/Jt);let k=D,rt=k.min.y+.01,Z=p<It*2?{draw:1,alpha:1-ee(p,220,620)}:{draw:ee(p,Jt-380,Jt-20),alpha:1};ie.line("cl",[ue(dn(0,rt,k.min.z-.9)),ue(dn(0,rt,k.max.z+.9))],{...Z,dash:"14 4 2 4",alpha:Z.alpha*.7});let it={draw:ee(p,650,1900),alpha:1-ee(p,It,It+380)};Gn.forEach((Lt,jt)=>{let zt=ut(Lt);if(!zt)return;let Bt=ue(zt.center),ot=ue(un(zt));Math.hypot(ot[0]-Bt[0],ot[1]-Bt[1])<6||(ie.line(`tr${jt}`,[Bt,ot],{...it,dash:"3 4",color:vt.warn}),ie.circle(`tr${jt}o`,Bt[0],Bt[1],2.5,{alpha:it.alpha*Math.min(1,it.draw*3),color:vt.text}))});let ft=un(nt),st=ue(ft),tt=p>=It*3+50,pt=p<It*2+850?["EXPLOIT CONFIRMED","ATTACK PATH · VALIDATED",It+200]:tt?["RETEST PASSED","ATTACK PATH · CLOSED",It*3+50]:["DEFENSES UNDER TEST","VALIDATION · IN PROGRESS",It*2+850],At={draw:Math.min(ee(p,It+150,It+900),.55+.45*ee(p,pt[2],pt[2]+600)),alpha:1-ee(p,It*3+650,It*3+950)},mt=Rt-st[0]-st[0];ie.reticle("fault",st,.36*$e,T?"":pt[0],T?"":pt[1],{...At,color:tt?vt.bright:vt.warn,pulse:tt?1:S,flip:T?mt<0:st[0]+.36*$e+220>Rt}),ie.end()}De(),se().then(()=>{i.classList.add("car-ready"),i.dataset.renderer="threejs",F()}).catch(p=>{cancelAnimationFrame(gt),gt=0,R.dispose(),v(p)}),i.carScene={get progress(){return M},get target(){return g},seek(p){g=M=Ae(Number(p)||0),F()},parts:()=>lt,timeline:()=>Mt}}let _=new IntersectionObserver(R=>{if(R.some(w=>w.isIntersecting)){_.disconnect();try{z()}catch(w){v(w)}}},{rootMargin:"500px"});_.observe(i)}function Dn(){document.querySelectorAll("[data-car-scene]").forEach(ws)}import*as A from"https://cdn.jsdelivr.net/npm/three@0.184.0/+esm";import{animate as je,createTimeline as Es,splitText as Ke,stagger as ke}from"https://cdn.jsdelivr.net/npm/animejs@4.5.0/+esm";var V={outline:"#333333",edge:"#7A7A7A",main:"#666666",det:"#8F8F8F",dash:"#CCCCCC",faint:"#E3E3E3",side:"#FFFFFF",top:"#E9E9E9",tone:"#FFFFFF"},Bn=8e3,Ce=320,St=Math.PI/180,de=i=>new A.Vector3(i[0],i[2],i[1]),Xe=new Map;function Ot(i,e=A.FrontSide){let t=i+e;return Xe.has(t)||Xe.set(t,new A.MeshBasicMaterial({color:i,side:e,polygonOffset:!0,polygonOffsetFactor:1,polygonOffsetUnits:1})),Xe.get(t)}var pe=new Map;function Ss(i,e,t){let n=`${i}|${e}|${t?1:0}`;if(!pe.has(n)){let s=new Yt({color:new A.Color(i),linewidth:e,dashed:!!t,dashSize:2.4,gapSize:2.8,worldUnits:!1,transparent:!!t});s.userData.base=e,pe.set(n,s)}return pe.get(n)}var Ms=new A.Vector3(1,1,1).normalize(),$n=1,Ts=1;function As(){let i=Ts++;return new A.ShaderMaterial({uniforms:{uId:{value:new A.Vector3((i&255)/255,(i>>8&255)/255,.5)}},vertexShader:"void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:"uniform vec3 uId; void main() { gl_FragColor = vec4(uId, 1.0); }",side:A.DoubleSide})}var Qe=class{constructor(e){this.renderer=e,this.rt=new A.WebGLRenderTarget(1,1,{minFilter:A.NearestFilter,magFilter:A.NearestFilter,depthTexture:new A.DepthTexture(1,1)}),this.mat=new A.ShaderMaterial({uniforms:{tId:{value:this.rt.texture},tDepth:{value:this.rt.depthTexture},uTexel:{value:new A.Vector2(1,1)},uW:{value:2},uColor:{value:new A.Color(V.outline)}},vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",fragmentShader:`
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
        }`,transparent:!0,depthTest:!1,depthWrite:!1}),this.quad=new A.Mesh(new A.PlaneGeometry(2,2),this.mat),this.quad.frustumCulled=!1,this.qscene=new A.Scene,this.qscene.add(this.quad),this.qcam=new A.OrthographicCamera(-1,1,1,-1,0,1)}setSize(e){let t=this.renderer.getDrawingBufferSize(new A.Vector2);this.rt.setSize(t.x,t.y),this.mat.uniforms.uTexel.value.set(1/t.x,1/t.y),this.mat.uniforms.uW.value=e*this.renderer.getPixelRatio()}render(e,t){let n=this.renderer;t.layers.set($n),n.setRenderTarget(this.rt),n.setClearColor(0,0),n.clear(),n.render(e,t),t.layers.set(0),n.setRenderTarget(null),n.clear(),n.render(e,t),n.autoClear=!1,n.render(this.qscene,this.qcam),n.autoClear=!0}};function Ze(i,e,t,n=64){let s=[];for(let a=0;a<n;a++){let l=a/n*Math.PI*2,o=t*Math.cos(l),r=t*Math.sin(l);s.push(e==="x"?[i[0],i[1]+o,i[2]+r]:e==="y"?[i[0]+o,i[1],i[2]+r]:[i[0]+o,i[1]+r,i[2]])}return s}function Rs(i,e){let t=new A.Matrix4;return e==="x"?t.makeRotationZ(-Math.PI/2):e==="y"&&t.makeRotationX(Math.PI/2),t.setPosition(de(i)),t}var He=class{constructor(e,t=null){this.group=e,this.idMat=t,this.segs=new Map}pushSegs(e,t,n,s){let a=`${e}|${t}|${n?1:0}`;this.segs.has(a)||this.segs.set(a,{color:e,width:t,dashed:n,arr:[]});let l=this.segs.get(a).arr;for(let o=0;o<s.length;o++)l.push(s[o])}addLine(e,t,n,s,a){let l=[],o=e.map(de);for(let r=0;r<o.length-1;r++)l.push(o[r].x,o[r].y,o[r].z,o[r+1].x,o[r+1].y,o[r+1].z);if(t&&o.length>2){let r=o[o.length-1],d=o[0];l.push(r.x,r.y,r.z,d.x,d.y,d.z)}this.pushSegs(n,s,a,l)}addEdges(e,t=V.edge,n=1,s=25){let a=new A.EdgesGeometry(e,s);this.pushSegs(t,n,!1,a.attributes.position.array),a.dispose()}mesh(e,t){let n=new A.Mesh(e,t);if(this.group.add(n),this.idMat){let s=new A.Mesh(e,this.idMat);s.layers.set($n),this.group.add(s)}return n}box(e,t,n,s,a,l,o={}){let r=new A.BoxGeometry(t-e,l-a,s-n);r.translate(...de([(e+t)/2,(n+s)/2,(a+l)/2]).toArray());let d=Ot(o.fx||V.side),u=Ot(o.fy||V.side);this.mesh(r,[d,d,Ot(o.top||V.top),Ot(V.side),u,u]),this.addEdges(r,V.edge,1,20)}cyl(e,t,n,s,a={}){let l=a.n||48,o=a.a0||0,r=a.r1??n,d=Rs(e,t),u=t==="x"?[e[0]+s,e[1],e[2]]:t==="y"?[e[0],e[1]+s,e[2]]:[e[0],e[1],e[2]+s],c=h=>(h.translate(0,s/2,0),h.applyMatrix4(d),h);if(a.hole){this.mesh(c(new A.CylinderGeometry(r,n,s,l,1,!0,o)),Ot(V.side)),this.mesh(c(new A.CylinderGeometry(a.hole,a.hole,s,l,1,!0,o)),Ot(V.side,A.DoubleSide));let h=new A.RingGeometry(a.hole,r,l);h.rotateX(-Math.PI/2),h.translate(0,s/2,0);let m=new A.RingGeometry(a.hole,n,l);m.rotateX(Math.PI/2),m.translate(0,-s/2,0),this.mesh(c(h),Ot(a.cap||V.side)),this.mesh(c(m),Ot(V.side));for(let[y,C]of[[e,n],[u,r]])this.addLine(Ze(y,t,C),!0,V.edge,1),this.addLine(Ze(y,t,a.hole),!0,V.det,.8)}else{let h=c(new A.CylinderGeometry(r,n,s,l,1,!1,o));this.mesh(h,[Ot(V.side),Ot(a.cap||V.side),Ot(V.side)]),this.addEdges(h,V.edge,1,25)}}cylZ(e,t,n,s,a,l={}){this.cyl([e,t,n],"z",a,s,l)}cylA(e,t,n,s,a={}){this.cyl(e,t,n,s,a)}ring(e,t,n,s={}){if(this.addLine(Ze(e,t,n),!0,s.stroke||V.det,s.w||.8,!!s.dash),s.fill){let a=new A.CircleGeometry(n,48);t==="z"?a.rotateX(-Math.PI/2):t==="x"&&a.rotateY(Math.PI/2),a.translate(...de(e).toArray()),this.mesh(a,Ot(s.fill,A.DoubleSide))}}poly(e,t={}){this.addLine(e,t.closed!==!1,t.stroke||V.det,t.w||.8,!!t.dash)}line(e,t,n={}){this.addLine([e,t],!1,n.stroke||V.dash,n.w||.8,n.dash===void 0?!0:!!n.dash)}finish(){for(let{color:e,width:t,dashed:n,arr:s}of this.segs.values()){let a=new Zt;a.setPositions(s);let l=new oe(a,Ss(e,t,n));n&&l.computeLineDistances(),this.group.add(l)}this.segs.clear()}},Je={guard(){let i=[45,135,225,315].map(s=>[32*Math.cos(s*St),32*Math.sin(s*St)]),e=[i[0],i[2]],t=[-61,0,18],n=[{anchor:[-61,0,1],lift:[-10,0,0],k:.35,label:{n:"02",text:"SCOPE RULES",side:"l",at:[-72,16,-8]},draw:s=>{s.box(-72,-50,-16,16,-16,18),[-20,20,60,100].forEach((a,l)=>{let o=a*St,r=10.5,d=12.5+l*1.4;s.poly([[t[0]+r*Math.cos(o),t[1]+r*Math.sin(o),18],[t[0]+d*Math.cos(o),t[1]+d*Math.sin(o),18]],{closed:!1,stroke:l===2?V.main:V.det,w:l===2?1.2:.8})}),s.cylA([-50,0,-2],"x",6,4)}},{anchor:[-61,0,22],lift:[-10,0,18],k:.8,label:{n:"01",text:"TEST PROFILE",side:"l",at:[-67,6,25]},draw:s=>{s.cylZ(t[0],t[1],18,7,8,{cap:V.top}),s.cylZ(t[0],t[1],25,3,4.5,{cap:V.top});let a=60*St;s.poly([[t[0]+4.8*Math.cos(a),t[1]+4.8*Math.sin(a),25],[t[0]+7.6*Math.cos(a),t[1]+7.6*Math.sin(a),25]],{closed:!1,stroke:V.main,w:1.4})}},{anchor:[-34,0,0],lift:[62,0,0],k:.55,label:{n:"03",text:"AGGRESSION LEVEL",side:"r",at:[-34,-15.5,15.5]},draw:s=>{s.cylA([-35,0,0],"x",22,2.2);for(let a of[-7,7])s.ring([-32.7,a,0],"x",1.4)}},{anchor:[-33,0,0],draw:s=>{s.cylA([-46,0,0],"x",29,26,{hole:23}),s.cylA([-20,0,0],"x",38,6,{hole:23});for(let[a,l]of i)s.ring([-14,a,l],"x",2.6)}},{anchor:[-32,0,0],lift:[62,0,0],k:.55,draw:s=>s.cylA([-33.9,-46,0],"y",2.2,92)},{anchor:[-13,0,0],lift:[88,0,0],k:.7,draw:s=>{s.cylA([-14,0,0],"x",38,2,{hole:26});for(let[a,l]of i)s.ring([-12,a,l],"x",2.6)}}];return e.forEach(([s,a],l)=>{n.push({anchor:[-3,s,a],lift:[114,0,0],k:.92,label:l===0?{n:"04",text:"EXECUTION LIMITS",side:"r",at:[6.5,s,a+5]}:null,draw:o=>{o.cylA([-12,s,a],"x",2.6,14),o.cylA([2,s,a],"x",5,4.5,{n:6})}})}),{parts:n,guides:s=>{s.line([-100,0,0],[128,0,0]);for(let[a,l]of e)s.line([-14,a,l],[116,a,l]);s.line([28,-58,0],[28,58,0]),s.line([-71,0,18],[-71,0,52])}}},bounds(){let i=[-16,0,16];return{parts:[{anchor:[0,-84,0],lift:[0,-26,0],k:.9,label:{n:"01",text:"TRAFFIC PROXY",side:"r",at:[0,-80,11]},draw:t=>{t.cylA([0,-96,0],"y",11,24,{hole:8})}},{anchor:[0,-67,0],lift:[0,-12,0],k:.7,draw:t=>{t.cylA([0,-72,0],"y",20,10,{n:6}),t.ring([0,-62,0],"y",11)}},{anchor:[0,-40,0],lift:[0,52,0],k:.4,label:{n:"02",text:"SCOPE ENFORCEMENT",side:"r",at:[10.6,-30,10.6]},draw:t=>{t.cylA([0,-60,0],"y",15,42,{hole:11});for(let n=-40;n<=130;n+=12){let s=15*Math.cos(n*St),a=15*Math.sin(n*St);t.poly([[s,-59,a],[s,-19,a]],{closed:!1,stroke:"#6E6E6E",w:.55})}for(let n=-56;n<=-22;n+=4.5){let s=[];for(let a=0;a<=24;a++){let l=(-45+a*7.5)*St;s.push([15*Math.cos(l),n,15*Math.sin(l)])}t.poly(s,{closed:!1,stroke:"#6E6E6E",w:.55})}}},{anchor:[0,-39,0],draw:t=>{t.cylA([0,-62,0],"y",22,46,{hole:18}),t.cylZ(0,-39,21,3,7,{cap:V.top}),t.ring([0,-39,24],"z",3)}},{anchor:[0,-11,0],lift:[0,56,0],k:.55,draw:t=>{t.cylA([0,-16,0],"y",20,10,{n:6}),t.ring([0,-6,0],"y",11)}},{anchor:[0,2,0],lift:[0,88,0],k:.78,label:{n:"03",text:"ALLOWED PATHS",side:"l",at:[-26,10,13]},draw:t=>{t.box(-26,26,-6,10,-13,13);for(let n of i)t.cylA([n,10,0],"y",6,12,{hole:4})}},{anchor:[16,24,0],lift:[0,108,0],k:.95,label:{n:"04",text:"EXCLUDED TARGETS",side:"l",at:[9,27,0]},draw:t=>{t.cylA([16,22,0],"y",7,5);let n=27.1;t.poly([[12,n,-4],[20,n,4]],{closed:!1,stroke:V.main,w:1.2}),t.poly([[12,n,4],[20,n,-4]],{closed:!1,stroke:V.main,w:1.2})}}],guides:t=>{t.line([0,-132,0],[0,140,0]);for(let n of[-16,16])t.line([n,10,0],[n,140,0])}}},health(){return{parts:[{anchor:[-1,0,-92],draw:t=>{t.cylA([-26,0,-92],"x",5,14),t.box(-12,10,-12,12,-104,-80),t.cylA([10,0,-92],"x",5,14,{hole:3}),t.cylA([-1,12,-92],"y",2.2,8)}},{anchor:[-1,0,-60],label:{n:"04",text:"ACTIVITY FEED",side:"l",at:[-5.5,0,-56]},draw:t=>{t.cylZ(-1,0,-80,42,4.5),t.cylZ(-1,0,-70,7,8,{n:6,cap:V.top})}},{anchor:[-1,21,-92],lift:[0,18,0],k:.9,label:{n:"03",text:"OPERATOR CONTROL",side:"l",at:[-1,23,-79]},draw:t=>{t.cylA([-1,20,-92],"y",13,3,{hole:10});for(let n of[45,135,225,315]){let s=n*St;t.poly([[-1+3.5*Math.cos(s),23.1,-92+3.5*Math.sin(s)],[-1+10*Math.cos(s),23.1,-92+10*Math.sin(s)]],{closed:!1,stroke:V.main,w:1})}t.cylA([-1,20,-92],"y",3.5,4.5,{cap:V.top})}},{anchor:[-5,0,0],lift:[0,0,10],k:.3,draw:t=>t.cylA([-12,0,0],"x",38,14)},{anchor:[3,0,0],lift:[24,0,10],k:.5,label:{n:"01",text:"CAMPAIGN HEALTH",side:"r",at:[4.2,-22,22]},draw:t=>{t.cylA([2,0,0],"x",34,2);let n=4.2;for(let a=0;a<=20;a++){let l=(225-a*13.5)*St,o=a%5===0,r=a>=17,d=o?24:27.5,u=30;t.poly([[n,-d*Math.cos(l),d*Math.sin(l)],[n,-u*Math.cos(l),u*Math.sin(l)]],{closed:!1,stroke:o||r?V.main:V.det,w:r?1.5:o?1:.7})}let s=[];for(let a=0;a<=40;a++){let l=(225-a*6.75)*St;s.push([n,-21*Math.cos(l),21*Math.sin(l)])}t.poly(s,{closed:!1,w:.6}),t.ring([n,0,-12],"x",6,{w:.6})}},{anchor:[5,0,0],lift:[42,0,10],k:.66,label:{n:"02",text:"LIVE STATUS",side:"r",at:[5.2,-25*Math.cos(100*St),25*Math.sin(100*St)]},draw:t=>{let n=100*St;t.poly([[5.2,6*Math.cos(n),-6*Math.sin(n)],[5.2,-25*Math.cos(n),25*Math.sin(n)]],{closed:!1,stroke:V.main,w:1.4}),t.cylA([4,0,0],"x",3,2.5,{cap:V.top})}},{anchor:[8,0,0],lift:[60,0,10],k:.8,draw:t=>{t.ring([8,0,0],"x",34,{stroke:V.det,w:.8}),t.poly([[8,10,24],[8,20,14]],{closed:!1,w:.7}),t.poly([[8,4,26],[8,8,22]],{closed:!1,w:.7})}},{anchor:[11,0,0],lift:[80,0,10],k:.95,draw:t=>t.cylA([9,0,0],"x",40,5,{hole:34})}],guides:t=>{t.line([-24,0,10],[100,0,10]),t.line([-1,0,-112],[-1,0,-28]),t.line([-1,10,-92],[-1,46,-92])}}},logs(){let i=[12,20,28],e=[{anchor:[0,0,22],label:{n:"04",text:"CAMPAIGN RECORD",side:"l",at:[-40,26,18]},draw:t=>{t.box(-40,40,-26,26,0,44,{top:V.side});for(let n of[34,38.5])t.poly([[-40,26.05,n],[40,26.05,n]],{closed:!1,stroke:V.main,w:.9}),t.poly([[40.05,-26,n],[40.05,26,n]],{closed:!1,stroke:V.main,w:.9});t.box(-30,-12,26,30,6,14,{top:V.top});for(let n=0;n<5;n++)for(let s=0;s<2;s++)t.ring([-27+n*3,30.05,8.5+s*3],"y",.8,{w:.6})}},{anchor:[49,0,24],lift:[22,0,0],k:.6,label:{n:"03",text:"AUDIT REPORTS",side:"r",at:[52,-6,30]},draw:t=>{t.cylA([40,0,24],"x",6,18);for(let n of[46,52])t.ring([n,0,24],"x",6,{w:.7});t.ring([58.05,0,24],"x",2.5,{w:.7})}}];return i.forEach((t,n)=>{e.push({anchor:[0,0,t+1],lift:[0,0,44+n*4],k:.4+n*.15,label:n===2?{n:"01",text:"ACTION LOG",side:"r",at:[34,-20,t+2]}:n===0?{n:"02",text:"DECISION TRACE",side:"l",at:[-34,20,t+1]}:null,draw:s=>{s.box(-34,34,-20,20,t,t+2),s.box(-24,-8,-12,4,t+2,t+4.5,{top:V.top}),s.box(4,18,-14,-2,t+2,t+4),s.box(6,14,6,14,t+2,t+3.5);for(let a of[8,12,16])s.poly([[-30,a,t+2],[-4,a,t+2]],{closed:!1,w:.6})}})}),e.push({anchor:[0,0,46],lift:[0,0,50],k:.85,draw:t=>t.box(-42,42,-28,28,44,48)}),e.push({anchor:[0,0,55],lift:[0,0,62],k:.95,draw:t=>{t.box(-26,-20,-4,4,48,56),t.box(20,26,-4,4,48,56),t.box(-26,26,-4,4,56,60,{top:V.top})}}),{parts:e,guides:t=>{for(let[n,s]of[[40,-26],[-40,26],[40,26]])t.line([n,s,44],[n,s,100]);t.line([40,0,24],[86,0,24])}}}};function ks(i){let e=new A.Group,t=new A.Group;e.add(t);let n=i.parts.map((s,a)=>{let l=new A.Group,o=new A.Group;l.add(o),t.add(l);let r=new He(o,As());s.draw(r,{e:{}}),r.finish();let d=null;return s.label&&(d=new A.Object3D,d.position.copy(de(s.label.at)),o.add(d)),{part:s,group:l,float:o,anchor:d,i:a,lift:de(s.lift||[0,0,0])}});if(i.guides){let s=new He(t);i.guides(s,{e:{}}),s.finish()}return{root:e,reveal:t,parts:n,fx:{cam:0,line:0}}}function tn(i,e){for(let t of i.parts)t.group.position.copy(t.lift).multiplyScalar(e),t.float.position.set(0,0,0)}function Cs(i,e){i.labelBox=document.createElement("div"),i.labelBox.className="ss-labels",i.labelBox.hidden=!0,e.appendChild(i.labelBox);for(let t of i.parts){let n=t.part.label;if(!n)continue;let s=document.createElement("div");s.className="ss-lbl",s.dataset.side=n.side,s.innerHTML=`<span class="n">${n.n}</span><span class="t">${n.text}</span>`,i.labelBox.appendChild(s),t.lbl={el:s,n:Ke(s.querySelector(".n"),{chars:!0,accessible:!1}).chars,t:Ke(s.querySelector(".t"),{chars:!0,accessible:!1}).chars,w:0,h:0}}}function Hs(i,e){let t=Es({autoplay:!1,onComplete:e});for(let{part:n,group:s,float:a,lift:l,i:o}of i.parts){if(!n.lift)continue;let r=n.k||0,d={},u={};for(let c of["x","y","z"]){let h=l[c];Math.abs(h)<1e-6||(d[c]=[{to:-.03*h,duration:150,ease:"inOutSine"},{to:h,duration:900,ease:"outExpo"}],u[c]=[{to:-.025*h,duration:860,ease:"inOutCubic"},{to:0,duration:190,ease:"outCubic"}])}t.add(s.position,d,450+(1-r)*550),t.add(s.position,u,4900+r*500),t.add(a.position,{y:[{to:.9,duration:800,ease:"inOutSine"},{to:-.7,duration:1e3,ease:"inOutSine"},{to:0,duration:800,ease:"inOutSine"}]},2050+o%5*110)}return t.add(i.reveal.rotation,{y:[{to:11*St,duration:1950,ease:"inOutCubic"}]},350),t.add(i.reveal.rotation,{y:[{to:0,duration:2e3,ease:"inOutCubic"}]},4800),t.add(i.fx,{cam:[{to:1,duration:1950,ease:"inOutCubic"}]},350),t.add(i.fx,{cam:[{to:0,duration:2e3,ease:"inOutCubic"}]},4800),t.add(i.fx,{line:[{to:1,duration:600,ease:"outCubic"}]},1750),t.add(i.fx,{line:[{to:0,duration:380,ease:"inCubic"}]},4480),i.parts.filter(n=>n.lbl).forEach((n,s)=>{let a=2050+s*110;t.add(n.lbl.n,{opacity:[0,1],translateX:["0.7em","0em"],duration:650,ease:"outExpo",delay:ke(24)},a),t.add(n.lbl.t,{opacity:[0,1],translateX:["0.7em","0em"],color:["#CCCCCC","#6B6B6B"],duration:750,ease:"outExpo",delay:ke(16)},a+70),t.add([...n.lbl.n,...n.lbl.t],{opacity:0,translateX:"-0.3em",duration:260,ease:"inQuad",delay:ke(7,{from:"last"})},4250+s*40)}),t.add({duration:1},Bn-1),t}function Ls(){let i=new A.OrthographicCamera(-1,1,1,-1,1100,1900);return i.position.copy(Ms).multiplyScalar(1500),i.up.set(0,1,0),i.lookAt(0,0,0),i.updateMatrixWorld(!0),i}function _s(i,e,t,n,s,a){let l=e.matrixWorldInverse,o=1/0,r=-1/0,d=1/0,u=-1/0,c=new A.Box3,h=new A.Vector3,m=i.reveal.rotation.y,y=i.root.rotation.y,C=i.parts.map(M=>[M.group.position.clone(),M.float.position.clone()]);i.root.rotation.y=0;for(let M of[0,1])for(let H of[-5,0,16]){tn(i,M),i.reveal.rotation.y=H*St,i.root.updateMatrixWorld(!0),c.makeEmpty();for(let b of i.parts)c.expandByObject(b.group);for(let b=0;b<8;b++)h.set(b&1?c.max.x:c.min.x,b&2?c.max.y:c.min.y,b&4?c.max.z:c.min.z).applyMatrix4(l),o=Math.min(o,h.x),r=Math.max(r,h.x),d=Math.min(d,h.y),u=Math.max(u,h.y)}i.reveal.rotation.y=m,i.root.rotation.y=y,i.parts.forEach((M,H)=>{M.group.position.copy(C[H][0]),M.float.position.copy(C[H][1])});let f=Math.max((r-o)/(t-2*s),(u-d)/(n-2*a))*.92,E=(o+r)/2,g=(d+u)/2;return{left:E-t/2*f,right:E+t/2*f,top:g+n/2*f,bottom:g-n/2*f}}function zn(i,e){i.left=e.left,i.right=e.right,i.top=e.top,i.bottom=e.bottom,i.updateProjectionMatrix()}function Is(i,e,t){let n=Math.min(window.devicePixelRatio||1,2);i.width=Math.round(e*n),i.height=Math.round(t*n);let s=i.getContext("2d");return s.setTransform(n,0,0,n,0,0),s.lineCap="butt",s.lineJoin="miter",s}var Ye=i=>Math.max(0,Math.min(1,i));function Os(i,e,t){let n=[],s=0;for(let l=1;l<e.length;l++){let o=Math.hypot(e[l][0]-e[l-1][0],e[l][1]-e[l-1][1]);n.push(o),s+=o}let a=s*t;i.beginPath(),i.moveTo(e[0][0],e[0][1]);for(let l=1;l<e.length&&a>0;l++){let o=n[l-1],r=Math.min(1,a/o);i.lineTo(e[l-1][0]+(e[l][0]-e[l-1][0])*r,e[l-1][1]+(e[l][1]-e[l-1][1])*r),a-=o}i.stroke()}var en=["guard","bounds","health","logs"],Fs=Object.fromEntries(en.map(i=>[i,Je[i]().parts.filter(e=>e.label).map(e=>({number:e.label.n,text:e.label.text})).sort((e,t)=>e.number.localeCompare(t.number))]));function Ps(){if(document.getElementById("safety-scene-styles"))return;let i=document.createElement("style");i.id="safety-scene-styles",i.textContent=`
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
@media (prefers-reduced-motion: reduce){.ss-gl,.ss-ov,.ss-label-host,[data-safety-chip]{transition:none!important}}`,document.head.append(i)}var nn=class{constructor(e){this.stage=e;let t=e.closest("[data-safety]")||e.parentElement;for(;t&&!t.querySelector("[data-safety-tab]");)t=t.parentElement;if(this.root=t||document,this.tabs=[...this.root.querySelectorAll("[data-safety-tab]")],!this.tabs.length){console.warn("safety-scene: no [data-safety-tab] rows found");return}this.keys=this.tabs.map((s,a)=>Je[s.dataset.safetyScene]?s.dataset.safetyScene:en[a%en.length]),this.host=e.querySelector("[data-safety-canvas]")||e,this.chip=this.root.querySelector("[data-safety-chip]"),this.bars=[...this.root.querySelectorAll("[data-safety-bar]")],this.captions=this.root.querySelector("[data-safety-captions]");let n=this.captions?.querySelector("[data-safety-caption]");n&&(this.captionTemplate=n.cloneNode(!0),this.captions.replaceChildren()),this.fallbackArt=this.root.querySelector("[data-safety-fallback]"),this.visible=!1,this.hovered=!1,this.focusWithin=!1,this.manualSelection=!1,this.pendingSwap=!1,this.selectionVersion=0,this.fallbackMode=!1,this.listAnimations=[],this.reduced=matchMedia("(prefers-reduced-motion: reduce)"),Ps(),this.mount()}get autoplay(){return!this.stage.hasAttribute("data-safety-no-autoplay")&&!this.manualSelection&&!this.hovered&&!this.focusWithin&&!this.reduced.matches}canRun(){return!!(this.scenes&&this.visible&&!document.hidden&&!this.reduced.matches&&!this.pendingSwap)}mount(){var l;let e=(o,r)=>{let d=document.createElement(o);return d.className=r,d.setAttribute("aria-hidden","true"),d};this.canvas=e("canvas","ss-gl"),this.overlay=e("canvas","ss-ov"),this.labelHost=e("div","ss-label-host"),this.host.append(this.canvas,this.overlay,this.labelHost),this.fallbackArt&&(this.fallbackArt.style.display="none");let t=this.tabs.find(o=>o.classList.contains("is-active"))||this.tabs[0],n=[...new Set([...t.querySelectorAll(".is-active")].map(o=>[...o.classList].find(r=>r!=="is-active")).filter(Boolean))];this.activeTargets=this.tabs.map(o=>[o,...n.flatMap(r=>[...o.getElementsByClassName(r)])]),this.active=this.tabs.indexOf(t);let s=this.tabs[0].parentElement;s.setAttribute("role","tablist"),s.setAttribute("aria-orientation","vertical"),s.hasAttribute("aria-label")||s.setAttribute("aria-label","Safety features"),(l=this.stage).id||(l.id="safety-stage"),this.stage.setAttribute("role","img"),this.split=this.tabs.map((o,r)=>{o.id||(o.id=`safety-tab-${r}`),o.setAttribute("role","tab"),o.setAttribute("aria-controls",this.stage.id),o.addEventListener("click",()=>this.select(r,!0,!0)),o.addEventListener("keydown",c=>{let h={ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1}[c.key],m;if(h)m=(r+h+this.tabs.length)%this.tabs.length;else if(c.key==="Home")m=0;else if(c.key==="End")m=this.tabs.length-1;else if(c.key==="Enter"||c.key===" ")m=r;else return;c.preventDefault(),this.select(m,!0,!0),this.tabs[m].focus({preventScroll:!0})});let d=o.querySelector("[data-safety-desc]")||o.querySelector("p"),u=o.querySelector("[data-safety-icon]")||o.querySelector('[class*="icon"]');return{desc:d?Ke(d,{words:!0}).words:[],icon:u}}),this.root.addEventListener("pointerenter",o=>{o.pointerType!=="touch"&&(this.hovered=!0,this.syncMotion())}),this.root.addEventListener("pointerleave",()=>{this.hovered=!1,this.syncMotion()}),this.root.addEventListener("focusin",()=>{this.focusWithin=!0,this.syncMotion()}),this.root.addEventListener("focusout",()=>queueMicrotask(()=>{this.focusWithin=this.root.contains(document.activeElement),this.syncMotion()})),this.select(this.active,!1),new ResizeObserver(()=>this.layout()).observe(this.stage),new IntersectionObserver(([o])=>{this.visible=o.isIntersecting,this.syncMotion()},{threshold:.05}).observe(this.root===document?this.stage:this.root),this.reduced.addEventListener("change",()=>{this.select(this.active,!1),this.syncMotion()}),document.addEventListener("visibilitychange",()=>this.syncMotion());let a=new IntersectionObserver(o=>{o.some(r=>r.isIntersecting)&&(a.disconnect(),this.start3D())},{rootMargin:"400px"});a.observe(this.stage)}start3D(){try{this.renderer=new A.WebGLRenderer({canvas:this.canvas,antialias:!0,alpha:!0}),this.renderer.setClearColor(0,0),this.post=new Qe(this.renderer),this.scene3=new A.Scene,this.camera=Ls(),this.drift=new A.Group,this.scene3.add(this.drift),this.scenes=this.keys.map(e=>{let t=ks(Je[e]());return t.root.visible=!1,this.drift.add(t.root),Cs(t,this.labelHost),t.tl=Hs(t,()=>{}),t}),this.driftAnim=je(this.drift.rotation,{y:[-4*St,4*St],duration:7e3,loop:!0,alternate:!0,autoplay:!1,ease:"inOutSine"}),this.stage.dataset.renderer="webgl",this.select(this.active,!1),this.layout(),this.syncMotion()}catch(e){console.warn("safety-scene: using the static illustration",e),this.showFallback()}}showFallback(){clearTimeout(this.swapT),this.selectionVersion++,this.pendingSwap=!1,cancelAnimationFrame(this.raf);for(let e of this.scenes||[])e.tl.pause();this.driftAnim?.pause(),this.renderer?.dispose(),this.renderer=null,this.scenes=null,this.fallbackMode=!0,this.stage.dataset.renderer="static";for(let e of[this.canvas,this.overlay,this.labelHost])e.hidden=!0;this.fallbackArt&&(this.fallbackArt.style.display=""),this.select(this.active,!1),this.layout()}setLineScale(e,t,n=1){for(let s of pe.values())s.resolution.set(e,t),s.linewidth=s.userData.base*n}layout(){let e=this.host.clientWidth,t=this.host.clientHeight;if(this.captions&&(this.captions.style.display=e<520||this.fallbackMode?"":"none"),!e||!t||!this.renderer||!this.scenes)return;this.W=e,this.H=t,this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,2)),this.renderer.setSize(this.W,this.H,!1),this.octx=Is(this.overlay,this.W,this.H),this.setLineScale(this.W,this.H,Math.max(1,this.W/700)),this.post.setSize(1.05*Math.max(1,this.W/700)),this.callouts=this.W>=520,this.labelHost.hidden=!this.callouts;let n=this.callouts?this.W*.2:Math.max(24,this.W*.09),s=Math.max(24,this.H*.1);this.frames=this.scenes.map(a=>_s(a,this.camera,this.W,this.H,n,s)),zn(this.camera,this.frames[this.active]),this.measureLabels(),this.reduced.matches&&tn(this.scenes[this.active],.6),this.paint()}measureLabels(){for(let e of this.scenes){let t=e.labelBox.hidden;e.labelBox.hidden=!1;for(let n of e.parts)n.lbl&&(n.lbl.w=n.lbl.el.offsetWidth,n.lbl.h=n.lbl.el.offsetHeight);e.labelBox.hidden=t}}syncMotion(){if(this.stage.dataset.motion=this.fallbackMode?"static":this.reduced.matches?"reduced":this.canRun()?"playing":"paused",!this.scenes)return;let e=this.canRun();e||this.finishListAnimations();for(let t of this.scenes)e&&t===this.scenes[this.active]&&t.root.visible?t.tl.completed?t.tl.restart():t.tl.play():t.tl.pause();e?(this.driftAnim.play(),this.loop()):(this.driftAnim.pause(),cancelAnimationFrame(this.raf),this.paint())}onCycleEnd(e,t){!this.canRun()||t!==this.selectionVersion||e!==this.scenes[this.active]||(this.autoplay?this.select((this.active+1)%this.tabs.length):e.tl.restart())}select(e,t=!0,n=!1){if(!Number.isInteger(e)||!this.tabs[e])return;clearTimeout(this.swapT),this.finishListAnimations();let s=++this.selectionVersion;for(let u of this.scenes||[])u.tl.pause();this.pendingSwap=!1,n&&(this.manualSelection=!0);let a=e!==this.active,l=this.active,o=t&&a&&!this.reduced.matches;if(this.active=e,this.activeTargets.forEach((u,c)=>u.forEach(h=>h.classList.toggle("is-active",c===e))),this.tabs.forEach((u,c)=>{u.setAttribute("aria-selected",String(c===e)),u.tabIndex=c===e?0:-1}),this.stage.setAttribute("aria-labelledby",this.tabs[e].id),this.captions&&this.renderCaptions(Fs[this.keys[e]]),this.chip&&(this.chip.textContent=String(e+1).padStart(2,"0")),this.bars.forEach((u,c)=>{u.style.width=(this.fallbackMode||this.reduced.matches)&&c===e?"100%":"0"}),!this.scenes)return;let r=[this.canvas,this.overlay,this.labelHost,this.chip].filter(Boolean),d=()=>{if(s!==this.selectionVersion||e!==this.active)return;this.pendingSwap=!1;for(let c of this.scenes)c.tl.pause(),c.tl.seek(0),c.root.visible=!1,c.labelBox.hidden=!0;let u=this.scenes[e];if(u.tl.onComplete=()=>this.onCycleEnd(u,s),u.root.visible=!0,u.labelBox.hidden=!1,this.frames&&zn(this.camera,this.frames[e]),this.reduced.matches){tn(u,.6),u.fx.line=1,u.fx.cam=.4;for(let c of u.parts)if(c.lbl)for(let h of[...c.lbl.n,...c.lbl.t])h.style.opacity=1,h.style.color=""}if(this.paint(),o){this.revealListItems(e,l);let c=[this.canvas,this.overlay,this.labelHost];c.forEach(h=>{h.classList.remove("ss-out"),h.classList.add("ss-pre")}),this.stage.offsetWidth,c.forEach(h=>h.classList.remove("ss-pre"))}r.forEach(c=>c.classList.remove("ss-out")),this.syncMotion()};o?(this.pendingSwap=!0,this.syncMotion(),r.forEach(u=>u.classList.add("ss-out")),this.prehideListItems(e,l),this.swapT=setTimeout(d,Ce)):d()}renderCaptions(e){let t=this.captionTemplate;if(!t){this.captions.innerHTML=e.map(n=>`<li><span class="caption-number">${n.number}</span><span class="caption-text">${n.text}</span></li>`).join("");return}this.captions.replaceChildren(...e.map(n=>{let s=t.cloneNode(!0),a=s.querySelector("[data-safety-caption-number]"),l=s.querySelector("[data-safety-caption-text]");return a&&(a.textContent=n.number),l&&(l.textContent=n.text),s}))}finishListAnimations(){for(let e of this.listAnimations)e.complete();this.listAnimations=[];for(let e of this.prehidden||[])e.style.opacity="",e.style.transform="";this.prehidden=[]}prehideListItems(e,t){let n=this.split[e],s=this.split[t];for(let a of n.desc)a.style.opacity="0",a.style.transform="translateX(0.8em)";s.icon&&(s.icon.style.opacity="0",s.icon.style.transform="translateX(0.9em)"),this.prehidden=[...n.desc,s.icon].filter(Boolean)}revealListItems(e,t){let n=this.split[e],s=this.split[t];this.prehidden=[],this.listAnimations=[n.desc.length&&je(n.desc,{opacity:[0,1],translateX:["0.8em","0em"],duration:850,ease:"outExpo",delay:ke(10,{start:220})}),s.icon&&je(s.icon,{opacity:[0,1],translateX:["0.9em","0em"],duration:800,ease:"outExpo",delay:120})].filter(Boolean)}loop(){cancelAnimationFrame(this.raf);let e=()=>{this.canRun()&&(this.paint(),this.raf=requestAnimationFrame(e))};this.raf=requestAnimationFrame(e)}paint(){if(!this.renderer||!this.frames||!this.scenes)return;let e=this.scenes[this.active];this.camera.zoom=1+.035*e.fx.cam,this.camera.updateProjectionMatrix();for(let s of pe.values())s.dashed&&(s.opacity=.45+.55*e.fx.cam);this.scene3.updateMatrixWorld(),this.post.render(this.scene3,this.camera);let t=this.octx;t.clearRect(0,0,this.W,this.H),this.callouts&&this.paintCallouts(e,t);let n=this.bars[this.active];n&&(n.style.width=(this.reduced.matches?100:Ye(e.tl.currentTime/Bn)*100)+"%")}paintCallouts(e,t){let n=this.W,s=this.H,a=Math.max(22,n*.035),l=new A.Vector3,o=[];for(let u of e.parts){if(!u.lbl)continue;let c=u.lift.lengthSq()>0?Ye(u.group.position.length()/u.lift.length()):1;u.anchor.getWorldPosition(l).project(this.camera);let h=(l.x+1)/2*n,m=(1-l.y)/2*s;o.push({p:u,a:Ye(c*1.4),x:h,y:m,ty:Math.max(96,Math.min(s-56,m))})}let r=26;for(let u of["l","r"]){let c=o.filter(h=>h.p.part.label.side===u).sort((h,m)=>h.ty-m.ty);for(let h=1;h<c.length;h++)c[h].ty-c[h-1].ty<r&&(c[h].ty=c[h-1].ty+r)}let d=e.fx.line;t.lineWidth=1;for(let{p:u,a:c,x:h,y:m,ty:y}of o){let{el:C,w:f,h:E}=u.lbl,g=u.part.label.side==="l",M=g?a:n-a-f;if(C.style.transform=`translate(${M.toFixed(1)}px, ${(y-E/2).toFixed(1)}px)`,C.style.opacity=c,d<=0||c<=.01)continue;let H=g?M+f+12:M-12;if(t.globalAlpha=c,g&&H<h-8||!g&&H>h+8){let b=Math.round(m)+.5,F=Math.round(y)+.5,J=Math.abs(F-b)<1?[[h,b],[H,b]]:(()=>{let v=Math.round(h+(H-h)*.35)+.5;return[[h,b],[v,b],[v,F],[H,F]]})();t.strokeStyle="#efb814",Os(t,J,d),d>.98&&(t.beginPath(),t.moveTo(Math.round(H)+.5,F-3.5),t.lineTo(Math.round(H)+.5,F+3.5),t.stroke())}t.beginPath(),t.arc(h,m,2.1*Math.min(1,d*3),0,Math.PI*2),t.fillStyle=V.outline,t.fill()}t.globalAlpha=1}};function Un(){document.querySelectorAll("[data-safety-stage]").forEach(i=>{i.safetyTabs=new nn(i)})}var Wn=matchMedia("(prefers-reduced-motion: reduce)");function Ds(i){let t=[...(i.querySelector("[data-slider-track]")||i).querySelectorAll("[data-slider-slide]")];if(t.length<2)return;let n=i;for(;n.parentElement&&!n.querySelector("[data-slider-prev], [data-slider-next], [data-slider-dot]");)n=n.parentElement;let s=n.querySelector("[data-slider-prev]"),a=n.querySelector("[data-slider-next]"),l=[...n.querySelectorAll("[data-slider-dot]")],o=Number(i.dataset.sliderScale)||.813576,r=Number(i.dataset.sliderOpacity??.5),d=t.length,u=t.find(v=>v.classList.contains("is-active"))||t[0],c=[...new Set([...u.querySelectorAll(".is-active")].map(v=>[...v.classList].find(z=>z!=="is-active")).filter(Boolean))],h=t.map(v=>[v,...c.flatMap(z=>[...v.getElementsByClassName(z)])]),m=t.indexOf(u),y=!1,C=t.map(v=>{let z=getComputedStyle(v).transform,_=new DOMMatrixReadOnly(z==="none"?void 0:z);return Math.abs(_.e+v.offsetWidth/2)<1.5?null:_.e}),f=t.map(v=>{let z=v.querySelector("[data-slider-video]"),_=z?z.matches("video")?z:z.querySelector("video"):v.querySelector("video");if(_){_.muted=!0,_.playsInline=!0,_.autoplay=!1,_.removeAttribute("autoplay"),_.pause();for(let R of[_,..._.querySelectorAll("source")]){let w=R.getAttribute("src");w&&!w.includes("#")&&R.setAttribute("src",`${w}#t=0.001`)}_.querySelector("source")&&!_.getAttribute("src")&&_.load()}return _}),E=null,g=()=>{if(E)return;E=new AbortController;let v=()=>{E.abort(),E=null,H()};for(let z of["pointerdown","touchend","keydown"])addEventListener(z,v,{passive:!0,capture:!0,signal:E.signal})};function M(){let v=innerWidth,z=t[m].offsetWidth;return v<=600?v*.89:v<=900?v*.76:z/2+Math.min(z*o,v*.40625)/2+v*.031746}function H(){f.forEach((v,z)=>{v&&(z===m&&y&&!document.hidden&&!Wn.matches?(v.preload="auto",v.play().catch(_=>{_.name==="NotAllowedError"&&g()})):v.pause())})}function b(v){m=(v%d+d)%d;let z=M();t.forEach((_,R)=>{let w=(R-m+d)%d;w>d/2&&(w-=d);let P=R===m,K=C[R]===null?`translateX(calc(-50% + ${w*z}px))`:`translateX(${C[R]+w*z}px)`;_.style.transform=`${K} scale(${P?1:o})`,_.style.opacity=P?"":String(r),_.style.zIndex=P?"2":"1",_.inert=!P,_.setAttribute("aria-hidden",String(!P))}),h.forEach((_,R)=>_.forEach(w=>w.classList.toggle("is-active",R===m))),l.forEach((_,R)=>{_.classList.toggle("is-active",R===m),_.setAttribute("aria-pressed",String(R===m))}),H()}s?.addEventListener("click",()=>b(m-1)),a?.addEventListener("click",()=>b(m+1)),s&&!s.hasAttribute("aria-label")&&s.setAttribute("aria-label","Previous"),a&&!a.hasAttribute("aria-label")&&a.setAttribute("aria-label","Next"),l.forEach((v,z)=>{v.matches("button, a")||(v.setAttribute("role","button"),v.tabIndex=0),v.hasAttribute("aria-label")||v.setAttribute("aria-label",`Show slide ${z+1}`),v.style.cursor="pointer",v.addEventListener("click",()=>b(z)),v.addEventListener("keydown",_=>{(_.key==="Enter"||_.key===" ")&&(_.preventDefault(),b(z))})}),i.addEventListener("keydown",v=>{v.key==="ArrowLeft"?(v.preventDefault(),b(m-1)):v.key==="ArrowRight"&&(v.preventDefault(),b(m+1))});let F=0,J=0;i.addEventListener("touchstart",v=>{F=v.touches[0].clientX,J=v.touches[0].clientY},{passive:!0}),i.addEventListener("touchend",v=>{let z=v.changedTouches[0].clientX-F,_=v.changedTouches[0].clientY-J;Math.abs(z)>50&&Math.abs(z)>Math.abs(_)&&b(m+(z<0?1:-1))},{passive:!0}),addEventListener("resize",()=>b(m)),new IntersectionObserver(([v])=>{y=v.isIntersecting,H()},{rootMargin:"100px"}).observe(i),document.addEventListener("visibilitychange",H),Wn.addEventListener("change",H),b(m),i.threatSlider={show:b,next:()=>b(m+1),prev:()=>b(m-1),get index(){return m}}}function Nn(){document.querySelectorAll("[data-slider]").forEach(Ds)}var me=(i,e=0,t=1)=>Math.min(t,Math.max(e,i)),sn=matchMedia("(prefers-reduced-motion: reduce)"),qn=matchMedia("(max-width: 767px)");function zs(i){let e=i.querySelector("[data-reveal-pin]")||i.firstElementChild,t=i.querySelector("[data-reveal-panel]");if(!e||!t){console.warn("reveal: needs a [data-reveal-panel] inside",i);return}let n=i.querySelector("[data-reveal-behind]")||i.querySelector("[data-burst-logo]"),s=i.querySelector("[data-reveal-pull]"),a=i.querySelector("[data-reveal-push]"),l=0,o=()=>{l=0;let d=!sn.matches&&!qn.matches,u=Math.min(0,innerHeight-e.offsetHeight);e.style.top=d?`${u}px`:"";let c=me((u-i.getBoundingClientRect().top)/Math.max(1,i.offsetHeight-e.offsetHeight)),h=d?me((c-.16)/.4):0,m=h*h*(3-2*h),y=d&&m*115<100,C=d&&h>.97;n&&(n.inert=y,n.setAttribute("aria-hidden",String(y))),t.inert=C,t.setAttribute("aria-hidden",String(C)),t.style.transform=d?`translate3d(${-m*115}vw, 0, 0)`:"",s&&(s.style.opacity=d?String(1-me(c/.12)):""),a&&(a.style.opacity=d?String(me((c-.07)/.1)):"",a.style.transform=d?`translateX(${(1-me((c-.06)/.12))*160}px)`:"")},r=()=>{l||(l=requestAnimationFrame(o))};addEventListener("scroll",r,{passive:!0}),addEventListener("resize",r),sn.addEventListener("change",r),qn.addEventListener("change",r),new ResizeObserver(r).observe(i),sn.matches||(t.style.willChange="transform"),o()}function Vn(){document.querySelectorAll("[data-reveal]").forEach(zs)}(()=>{if(customElements.get("a-burst-logo"))return;let i="M326.279 198.593L326.286 241.499H300.899V198.593H326.279ZM292.705 198.593V241.499H267.325V198.593H292.705ZM156.005 165.018H412.969L387.589 190.398H156.585C143.202 190.398 130.366 195.714 120.902 205.178L84.582 241.499H48.6885L103.365 186.822C117.326 172.861 136.261 165.018 156.005 165.018ZM152.445 131.443H446.544L421.163 156.823H153.024C133.016 156.823 113.827 164.772 99.6787 178.92L37.0996 241.499H1.20703L82.1416 160.564C100.787 141.919 126.076 131.443 152.445 131.443ZM278.099 0.5L155.361 123.237H151.158C139.762 123.237 128.448 125.177 117.703 128.974L111.394 131.202L242.205 0.5H278.099ZM326.279 123.237H300.899V36.5479L326.279 11.168V123.237ZM292.704 123.237H267.324V70.1221L292.704 44.7422V123.237ZM325.579 0.500977L202.844 123.237H166.95L289.687 0.5L325.579 0.500977Z",e=1e3,t=540,n=550,s=230,a=356/448,l=44,o=.063,r=500,d=26,u=224,c=121,h=2.5,m=1.5,y=-38,C=.42,f=[.4,.16,1,-.68,.26,.36,-1.1,-.17],E=f.map(j=>f.filter(N=>N<j).length+1),g=[-.3,1],M=[1,-1],H=[g,g,g,M,M,g,g,g],b=[1,1,1,-1,-1,1,1,1],F="http://www.w3.org/2000/svg";function J(j,N,q,L){let $=(U,W,I)=>3*U*I*(1-I)*(1-I)+3*W*I*I*(1-I)+I*I*I;return U=>{if(U<=0)return 0;if(U>=1)return 1;let W=0,I=1,B=U;for(let G=0;G<24;G++)B=(W+I)/2,$(j,q,B)<U?W=B:I=B;return $(N,L,B)}}let v=J(.65,0,.35,1),z=J(.16,1,.3,1),_=(j,N,q)=>Math.min(q,Math.max(N,j)),R=(j,N,q)=>_((j-N)/(q-N),0,1);function w(j){let N=v(R(j,.1,.48)),q=f.map(L=>{let $=(1-L)/2.1;return z(R(j,.58+$*.26,1.18+$*.26))});return{r:N,e:q}}function P(j){let N=j.match(/[MLHVCZ]|[\d.]+/g),q=[],L=()=>+N[$++],$=0,U=null,W=0,I=0,B=null;for(;$<N.length;)if(/[A-Z]/.test(N[$])&&(U=N[$++]),U==="M")W=L(),I=L(),B=[[W,I]],q.push(B),U="L";else if(U==="L")W=L(),I=L(),B.push([W,I]);else if(U==="H")W=L(),B.push([W,I]);else if(U==="V")I=L(),B.push([W,I]);else if(U==="C"){let G=[L(),L()],lt=[L(),L()],Y=[L(),L()];for(let et=1;et<=10;et++){let O=et/10,Q=1-O,nt=[Q*Q*Q,3*Q*Q*O,3*Q*O*O,O*O*O];B.push([nt[0]*W+nt[1]*G[0]+nt[2]*lt[0]+nt[3]*Y[0],nt[0]*I+nt[1]*G[1]+nt[2]*lt[1]+nt[3]*Y[1]])}[W,I]=Y}else U=null;return q.map(G=>{let lt=G[0],Y=G[G.length-1];return Math.hypot(lt[0]-Y[0],lt[1]-Y[1])<.01&&(G=G.slice(0,-1)),G.map(([et,O])=>[et-u,-(O-c)])})}let K=P(i);function at(j,N){let q=!1;for(let L=0,$=N.length-1;L<N.length;$=L++){let[U,W]=N[L],[I,B]=N[$];W>j[1]!=B>j[1]&&j[0]<(I-U)*(j[1]-W)/(B-W)+U&&(q=!q)}return q}let Ft=j=>j.reduce((N,q,L)=>{let $=j[(L+1)%j.length];return N+q[0]*$[1]-$[0]*q[1]},0),ht=j=>j[0].toFixed(1)+" "+j[1].toFixed(1);function Le(j,N,q,L){let $=O=>j.map(([Q,nt])=>N(Q,O+q,nt)),U=$(-d/2),W=$(d/2),I=U.length,B=[U,W];for(let O=0;O<I;O++){let Q=(O+1)%I;B.push([U[O],U[Q],W[Q],W[O]])}let G=O=>B.some(Q=>at(O,Q)),lt=B.map(O=>"M"+(Ft(O)<0?O.slice().reverse():O).map(ht).join("L")+"Z").join(""),Y={1:"",2:""},et=(O,Q,nt)=>{let Mt=Q[0]-O[0],D=Q[1]-O[1],ct=Math.hypot(Mt,D);if(ct<.05)return;let ut=Math.ceil(ct/h),Ct=-D/ct*.6,bt=Mt/ct*.6,Pt=0;for(let dt=0;dt<ut;dt++){let Tt=[O[0]+Mt*(dt+.5)/ut,O[1]+D*(dt+.5)/ut],Vt=G([Tt[0]+Ct,Tt[1]+bt])!==G([Tt[0]-Ct,Tt[1]-bt])?1:nt?2:0;Vt&&(Y[Vt]+=(Vt===Pt?"":"M"+ht([O[0]+Mt*dt/ut,O[1]+D*dt/ut]))+"L"+ht([O[0]+Mt*(dt+1)/ut,O[1]+D*(dt+1)/ut])),Pt=Vt}};for(let O=0;O<I;O++){let Q=(O+1)%I;et(U[O],U[Q],!L),et(W[O],W[Q],L),et(U[O],W[O],!1)}return{body:lt,sil:Y[1],crease:Y[2]}}function _e(j,N){let q=j.length,L=Ft(j)>0?1:-1;return j.map(($,U)=>{let W=j[(U+q-1)%q],I=j[(U+1)%q],B=[$[0]-W[0],$[1]-W[1]],G=[I[0]-$[0],I[1]-$[1]],lt=Math.hypot(...B)||1,Y=Math.hypot(...G)||1,et=[-B[1]/lt*L,B[0]/lt*L],O=[-G[1]/Y*L,G[0]/Y*L],Q=[et[0]+O[0],et[1]+O[1]],nt=Math.hypot(...Q)||1,Mt=Math.max(.35,(Q[0]*et[0]+Q[1]*et[1])/nt);return[$[0]+Q[0]/nt*(N/Mt),$[1]+Q[1]/nt*(N/Mt)]})}let ye=K.map(j=>_e(j,3.2)),Ie=`
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
  `;class Oe extends HTMLElement{static get observedAttributes(){return["label","spread"]}attributeChangedCallback(N){this.shadowRoot&&(N==="label"&&(this.labelEl.textContent=this.getAttribute("label")??"Introducing"),this.last="",this.wake())}connectedCallback(){this.shadowRoot||this.build(),this.motion=matchMedia("(prefers-reduced-motion: reduce)"),this.wake()}disconnectedCallback(){cancelAnimationFrame(this.raf),this.raf=0}build(){let N=this.attachShadow({mode:"open"});N.innerHTML=`<style>${Ie}</style><div class="box"><svg viewBox="0 0 ${e} ${t}" aria-hidden="true">
        <path class="axis"/><path class="cap-line"/><path class="guide"/><g class="parts"></g><g class="callouts"></g></svg>
        <div class="tags" aria-hidden="true"></div><p class="label"></p>
        <div class="scrub"><span class="cap"></span><input type="range" min="0" max="1000" value="0"
        aria-label="Logo animation, from the flat mark to the burst"><span class="cap"></span></div></div>`;let q=I=>N.querySelector(I),L=(I,B)=>{let G=document.createElementNS(F,"path");return G.setAttribute("class",I),B.appendChild(G),G};this.labelEl=q(".label"),this.labelEl.textContent=this.getAttribute("label")??"Introducing",this.g=q(".parts"),this.axisEl=q(".axis"),this.capEl=q(".cap-line"),this.guideEl=q(".guide");let $=q(".callouts"),U=q(".tags");this.parts=K.map((I,B)=>{let G=document.createElementNS(F,"g");this.g.appendChild(G);let lt=I.reduce((et,O)=>[et[0]+O[0]/I.length,et[1]+O[1]/I.length],[0,0]),Y=document.createElement("div");return Y.className="tag",Y.innerHTML=`<span class="n">${String(E[B]).padStart(2,"0")}</span>`,U.appendChild(Y),{pts:I,c:lt,out:f[B],side:b[B],aim:H[B],grp:G,depth:0,body:L("body",G),crease:L("crease",G),inset:L("crease",G),sil:L("sil",G),lead:L("lead",$),anchor:L("anchor",$),tag:Y}}),this.base=0,this.hover=null,this.sp={x:0,v:0},this.last="",this.prev=0;let W=q(".box");W.addEventListener("pointermove",I=>{if(I.pointerType==="touch"||this.dragging)return;let B=W.getBoundingClientRect();this.hover=_((I.clientX-B.left-o*B.width)/((1-2*o)*B.width),0,1),this.wake()}),W.addEventListener("pointerleave",()=>{this.hover=null,this.wake()}),this.range=q("input"),this.range.addEventListener("input",()=>{this.dragging=!0,this.hover=null,this.base=this.range.value/1e3,this.wake()}),this.range.addEventListener("change",()=>{this.dragging=!1}),this.draw(w(0))}wake(){!this.raf&&this.isConnected&&(this.prev=0,this.raf=requestAnimationFrame(N=>this.tick(N)))}tick(N){this.raf=0;let q=this.prev?Math.min(.05,(N-this.prev)/1e3):0;this.prev=N;let L=this.sp,$=(this.hover??this.base)*m;if(this.motion?.matches)L.x=$,L.v=0;else for(let B=0;B<4;B++){let G=100*($-L.x)-18*L.v;L.v+=G*q/4,L.x+=L.v*q/4}let U=Math.abs($-L.x)>1e-4||Math.abs(L.v)>1e-4;U||(L.x=$,L.v=0);let W=_(L.x,0,m);this.dragging||(this.range.value=Math.round(W/m*1e3));let I=W.toFixed(4)+"|"+this.getAttribute("spread");I!==this.last&&(this.draw(w(W)),this.last=I),U&&(this.raf=requestAnimationFrame(B=>this.tick(B)))}draw({r:N,e:q}){let L=q.reduce((D,ct)=>D+ct,0)/q.length,$=+(this.getAttribute("spread")??400)||400,U=y*N*Math.PI/180,W=C*N,I=Math.sqrt(1-W*W),B=Math.cos(U),G=Math.sin(U),lt=(D,ct,ut)=>[n+a*(B*D-G*ct),s+a*(W*(G*D+B*ct)-I*ut)],Y=[I*G,I*B,W],et=Y[1]>=0?d/2:-d/2,O=0,Q=0,nt="";if(this.parts.forEach((D,ct)=>{let ut=D.out*$*q[ct],Ct=Le(D.pts,lt,ut,Y[1]>=0);D.body.setAttribute("d",Ct.body),D.sil.setAttribute("d",Ct.sil),D.crease.setAttribute("d",Ct.crease),D.inset.setAttribute("d",N>.02?"M"+ye[ct].map(([gt,Gt])=>ht(lt(gt,et+ut,Gt))).join("L")+"Z":""),D.inset.style.opacity=N.toFixed(3),D.depth=Y[0]*D.c[0]+Y[1]*ut+Y[2]*D.c[1],O=Math.min(O,ut),Q=Math.max(Q,ut);let bt=_((q[ct]-.35)/.5,0,1),Pt=gt=>D.aim[0]*gt[0]+D.aim[1]*gt[1],dt=null,Tt=null;for(let[gt,Gt]of D.pts){let Ht=lt(gt,et+ut,Gt);(!dt||Pt(Ht)<Pt(dt))&&(dt=Ht,Tt=[gt,Gt])}Math.abs(ut)>1&&(nt+=`M${ht(lt(Tt[0],et,Tt[1]))}L${ht(dt)}`);let Vt=26*D.side,se=dt[0]+Vt*bt,te=dt[1];D.lead.setAttribute("d",bt>.01?`M${ht(dt)}L${ht([se,te])}`+(bt>.98?`M${ht([se,te-3.5])}L${ht([se,te+3.5])}`:""):""),D.anchor.setAttribute("d",bt>.01?`M${ht([dt[0]-2,te])}a2 2 0 1 0 4 0a2 2 0 1 0 -4 0`:""),D.lead.style.opacity=D.anchor.style.opacity=bt.toFixed(3);let Fe=6*D.side,Rt=(se+Fe)/e*100,Dt=te/t*100;D.tag.style.transform=`translate(${D.side>0?0:-100}%, -50%) translateX(${((1-bt)*.7*D.side).toFixed(2)}em)`,D.tag.style.left=Rt.toFixed(2)+"%",D.tag.style.top=Dt.toFixed(2)+"%",D.tag.style.opacity=bt.toFixed(3)}),L>.001){let D=lt(0,O-40*L,-121),ct=lt(0,Q+40*L,-121),ut=ct[0]-D[0],Ct=ct[1]-D[1],bt=Math.hypot(ut,Ct)||1,Pt=-Ct/bt*5,dt=ut/bt*5;this.axisEl.setAttribute("d",`M${ht(D)}L${ht(ct)}`),this.capEl.setAttribute("d",[D,ct].map(Tt=>`M${ht([Tt[0]-Pt,Tt[1]-dt])}L${ht([Tt[0]+Pt,Tt[1]+dt])}`).join(""))}else this.axisEl.setAttribute("d",""),this.capEl.setAttribute("d","");this.guideEl.setAttribute("d",nt),this.axisEl.style.opacity=this.capEl.style.opacity=this.guideEl.style.opacity=Math.min(1,L*1.6).toFixed(3),this.labelEl.style.opacity=(1-L).toFixed(3);let Mt=this.parts.slice().sort((D,ct)=>D.depth-ct.depth);Mt.some((D,ct)=>this.g.children[ct]!==D.grp)&&Mt.forEach(D=>this.g.appendChild(D.grp))}}customElements.define("a-burst-logo",Oe)})();var on;(()=>{let i={"--ab-accent":"#efb814","--ab-dot":"#efb814","--ab-label":"#001e3c","--ab-font":'DegularMono, "Degular Mono", "Courier New", monospace'},e=["--ab-bg","--ab-ink","--ab-crease","--ab-guide","--ab-grid","--ab-rail","--ab-label","--ab-accent","--ab-dot","--ab-font"],t=`
    :host { background: transparent; }
    .box { background: none; }
    input { height: 44px; }
    @media (min-width: 701px) { .label { translate: -24px 0; } }
    @media (max-width: 700px) {
      .box { height: 100%; aspect-ratio: auto; }
      .label { top: 16%; left: 50%; right: auto; transform: translate(-50%, -50%); margin: 0; font-size: 11px; }
      .tags, .callouts { display: none; }
      .scrub { top: 91%; }
    }`,n=matchMedia("(max-width: 700px)"),s=55,a=230/540*100,l=67.2,o=17.8,r=1.2;function d(y){let C=y.querySelector("[data-burst-fallback]");try{let f=document.createElement("a-burst-logo");f.setAttribute("label",y.dataset.burstLabel??"Introducing"),y.dataset.burstSpread&&f.setAttribute("spread",y.dataset.burstSpread),f.style.cssText="display:block;margin:0 auto";let E=getComputedStyle(y);for(let R of e){let w=E.getPropertyValue(R).trim()||i[R];w&&f.style.setProperty(R,w)}if(y.append(f),!f.shadowRoot?.querySelector("svg"))throw new Error("logo did not start");let g=Math.max(.5,Math.min(3,parseFloat(y.dataset.burstScale)||1)),M=document.createElement("style");M.textContent=t+(g===1?"":`
        @media (min-width: 701px) {
          .tags { transform: scale(${g}); transform-origin: ${s}% ${a}%; }
          .tag { font-size: calc(max(9px, 0.62cqw) / ${g}); }
          .label { right: calc(${l}% + ${((g-1)*o).toFixed(3)}%); }
        }`),f.shadowRoot.append(M);let H=g*r,b=`${550-350/H} ${230-230/H} ${700/H} ${540/H}`,F=`${550-550/g} ${230-230/g} ${1e3/g} ${540/g}`,J=()=>{f.shadowRoot.querySelector("svg").setAttribute("viewBox",n.matches?b:F),Object.assign(f.style,n.matches?{width:"100%",height:"min(100svh, 740px)",aspectRatio:"auto"}:{width:"min(100%, 185.19vh)",height:"auto",aspectRatio:"1000 / 540"})};n.addEventListener("change",J),J(),C&&(C.style.display="none");let v=f.shadowRoot.querySelector(".scrub"),z=y.closest("[data-burst-section]")||y.parentElement,_=()=>{if(n.matches){v.style.top="";return}let R=z.getBoundingClientRect(),w=f.getBoundingClientRect();v.style.top=`${(R.top+R.height*.93-w.top).toFixed(1)}px`};new ResizeObserver(_).observe(z),new ResizeObserver(_).observe(f),n.addEventListener("change",_),_(),m(f),h(f),y.burstLogo=f}catch(f){console.warn("burst-logo: showing the static mark",f),y.querySelector("a-burst-logo")?.remove(),C&&(C.style.display="")}}let u=.063,c=900;function h(y){let C=y.shadowRoot.querySelector(".box");C.style.touchAction="pan-y";let f=null,E=!1,g=0,M=b=>{let F=C.getBoundingClientRect();y.hover=Math.min(1,Math.max(0,(b.clientX-F.left-u*F.width)/((1-2*u)*F.width))),y.wake()},H=()=>{f=null,E=!1,y.hover=null,y.wake()};C.addEventListener("pointerdown",b=>{b.pointerType!=="touch"||b.target===y.range||(clearTimeout(g),f={x:b.clientX,y:b.clientY},E=!1)}),C.addEventListener("pointermove",b=>{if(b.pointerType!=="touch"||!f)return;let F=b.clientX-f.x,J=b.clientY-f.y;!E&&Math.abs(F)>8&&Math.abs(F)>Math.abs(J)&&(E=!0),E&&M(b)}),C.addEventListener("pointerup",b=>{if(!(b.pointerType!=="touch"||!f)){if(E){H();return}f=null,M(b),g=setTimeout(H,c)}}),C.addEventListener("pointercancel",b=>{b.pointerType==="touch"&&f&&H()})}function m(y){let C=!0,f=()=>y.isConnected&&C&&!document.hidden,E=y.wake,g=y.tick,M=()=>{cancelAnimationFrame(y.raf),y.raf=0,y.prev=0};y.wake=function(){f()&&E.call(this)},y.tick=function(b){if(!f()){M();return}g.call(this,b)};let H=()=>{f()?y.wake():(M(),y.hover=null,y.dragging=!1)};new IntersectionObserver(b=>{C=b[b.length-1].isIntersecting,H()}).observe(y),document.addEventListener("visibilitychange",H)}on=()=>document.querySelectorAll("[data-burst-logo]").forEach(d)})();pn({carScene:Dn,safetyScene:Un,threatSlider:Nn,reveal:Vn,burstLogo:on});
