// Scratch.3D v1.5.8 克隆模型时记录来源（cloneOf），供配套扩展"本体和克隆体"范围使用
(function(Scratch) {
  const { extensions } = Scratch;

  // ========== 多语言系统 ==========
  const translations = {
    'zh-cn': {
      extName: '3D场景引擎',
      init: '初始化3D场景',
      showCanvas: '显示3D画布',
      hideCanvas: '隐藏3D画布',
      setCameraZ: '将相机Z轴设为[Z]',
      enterFS: '进入全屏',
      exitFS: '退出全屏',
      clearScene: '清除3D场景',
      importModel: '导入模型[URL] 到[ID]',
      createCube: '创建立方体 宽[W] 高[H] 深[D] 模型[ID]',
      createSphere: '创建球体 半径[R] 模型[ID]',
      createCone: '创建锥体 半径[R] 高[H] 棱[S] 模型[ID]',
      createCylinder: '创建柱体 半径[R] 高[H] 棱[S] 模型[ID]',
      createPlane: '创建平面 图片[URL] 模型[ID]',
      cloneModel: '克隆模型[ID]',
      deleteModel: '删除模型[ID]',
      setColor: '设置模型[ID]颜色为[C]',
      resetColor: '恢复模型[ID]颜色',
      setDragRotate: '设置拖动旋转模式为[M] 模型[ID]',
      setSize: '将模型[ID]大小设为[S]',
      changeSize: '模型[ID]大小增加[S]',
      setMouseLook: '设置鼠标转动镜头为[M]',
      setX: '将模型[ID]X轴设为[X]',
      setY: '将模型[ID]Y轴设为[Y]',
      setZ: '将模型[ID]Z轴设为[Z]',
      changeX: '模型[ID]X轴增加[X]',
      changeY: '模型[ID]Y轴增加[Y]',
      changeZ: '模型[ID]Z轴增加[Z]',
      rotateX: '将模型[ID]X轴旋转[X]度',
      rotateY: '将模型[ID]Y轴旋转[Y]度',
      rotateZ: '将模型[ID]Z轴旋转[Z]度',
      setRotateX: '将模型[ID]X轴旋转角度设为[X]',
      setRotateY: '将模型[ID]Y轴旋转角度设为[Y]',
      setRotateZ: '将模型[ID]Z轴旋转角度设为[Z]',
    },
    'en': {
      extName: '3D Scene Engine',
      init: 'Initialize 3D Scene',
      showCanvas: 'Show 3D Canvas',
      hideCanvas: 'Hide 3D Canvas',
      setCameraZ: 'Set Camera Z to [Z]',
      enterFS: 'Enter Fullscreen',
      exitFS: 'Exit Fullscreen',
      clearScene: 'Clear 3D Scene',
      importModel: 'Import Model [URL] to [ID]',
      createCube: 'Create Cube W[W] H[H] D[D] Model[ID]',
      createSphere: 'Create Sphere R[R] Model[ID]',
      createCone: 'Create Cone R[R] H[H] S[S] Model[ID]',
      createCylinder: 'Create Cylinder R[R] H[H] S[S] Model[ID]',
      createPlane: 'Create Plane Image[URL] Model[ID]',
      cloneModel: 'Clone Model[ID]',
      deleteModel: 'Delete Model[ID]',
      setColor: 'Set Model[ID] Color [C]',
      resetColor: 'Reset Model[ID] Color',
      setDragRotate: 'Set Drag Rotate Mode [M] Model[ID]',
      setSize: 'Set Model[ID] Size to [S]',
      changeSize: 'Change Model[ID] Size by [S]',
      setMouseLook: 'Set Mouse Camera Look [M]',
      setX: 'Set Model[ID] X to [X]',
      setY: 'Set Model[ID] Y to [Y]',
      setZ: 'Set Model[ID] Z to [Z]',
      changeX: 'Change Model[ID] X by [X]',
      changeY: 'Change Model[ID] Y by [Y]',
      changeZ: 'Change Model[ID] Z by [Z]',
      rotateX: 'Rotate Model[ID] X by [X] degrees',
      rotateY: 'Rotate Model[ID] Y by [Y] degrees',
      rotateZ: 'Rotate Model[ID] Z by [Z] degrees',
      setRotateX: 'Set Model[ID] X Rotation to [X]',
      setRotateY: 'Set Model[ID] Y Rotation to [Y]',
      setRotateZ: 'Set Model[ID] Z Rotation to [Z]',
    }
  };

  function t(key) {
    const lang = (navigator.language || 'zh-cn').toLowerCase();
    const dict = translations[lang] || translations['zh-cn'] || translations['en'];
    return dict[key] || key;
  }

  const PX = 0.01;
  const DEFAULT_COLOR = 0x00695C;
  const WINDOW_W = 640;
  const WINDOW_H = 480;
  const FS_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAA6ElEQVR4AYSSwQ3DIBAEga//qSAlpJiUmGJSQirI32+sOWnR+gxypI2Xu2UMmPb5955VFr+cY0y08ffaSnH99t6pZ70ftXoOTzYgHn5utSKvuf/upSCvXSCQPeBey2cFXh8Qf/sMNANoRY19iroCzQBkNTdWQuEO5FvI+YAIoKeHqOmN+NyjNoXQIIzwCI/wWVMIZ4AUxiON8/MCUZgz8K+Uxw6Ka6+CA1Tj6WfiYOVjJTRU4I1MRH4G7snTR/iAMEArAD20Ag3IHQAIcpDmDAgBpKuMz2LLKGdO155J0NknPosDpo+8dwAAAP//PGE2mAAAAAZJREFUAwDolaA5r3NMQwAAAABJRU5ErkJggg==';

  class SceneManager {
    constructor() {
      this.ready = false;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.canvas = null;
      this.models = [];          // 所有模型
      this.nextId = 1;           // 克隆时的编号分配
      this.currentModel = null;  // 最近创建/操作的模型
      this._canvasVisible = true;
      this.dragRotateEnabled = false;
      this.dragRotateModelId = 1;
      this.mouseLookEnabled = false;
      this.cameraYaw = 0;
      this.cameraPitch = 0;
      this._threeLoaded = false;
      this._clock = null;
      this.windowEl = null;
      this.fullscreenBtn = null;
      this.tipEl = null;
      this._isFullscreen = false;
      this._fsTipTimer = null;
      this._escBound = false;
    }

    async _loadThree() {
      if (this._threeLoaded) return true;
      return new Promise((resolve) => {
        if (typeof THREE !== 'undefined') { this._threeLoaded = true; resolve(true); return; }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = () => { this._threeLoaded = true; resolve(true); };
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
      });
    }

    _loadGLTFLoader() {
      if (typeof THREE !== 'undefined' && THREE.GLTFLoader) return Promise.resolve(true);
      return new Promise((resolve) => {
        const sources = [
          'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js',
          'https://unpkg.com/three@0.128.0/examples/js/loaders/GLTFLoader.js',
        ];
        let i = 0;
        const tryNext = () => {
          if (i >= sources.length) { resolve(false); return; }
          const script = document.createElement('script');
          script.src = sources[i++];
          script.onload = () => {
            if (typeof THREE !== 'undefined' && THREE.GLTFLoader) resolve(true);
            else tryNext();
          };
          script.onerror = () => tryNext();
          document.head.appendChild(script);
        };
        tryNext();
      });
    }

    async init() {
      if (this.ready) return true;
      const loaded = await this._loadThree();
      if (!loaded) { alert('Three.js加载失败'); return false; }

      this._createWindow(WINDOW_W, WINDOW_H);
      const canvas = this.canvas;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x1a1a2e);

      this.camera = new THREE.PerspectiveCamera(50, WINDOW_W / WINDOW_H, 0.1, 1000);
      this.camera.position.set(0, 0, 5);

      this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
      dirLight.position.set(5, 5, 5);
      this.scene.add(dirLight);

      this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
      this.renderer.setPixelRatio(1);

      this.ready = true;
      this._clock = new THREE.Clock();
      this._animate();
      this.renderer.render(this.scene, this.camera);
      return true;
    }

    _createWindow(width, height) {
      const win = document.createElement('div');
      win.id = 'gandi-3d-window';
      win.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:' + width + 'px;height:' + height + 'px;background:#1a1a2e;border:2px solid #00695C;border-radius:8px;z-index:9999;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.5);';
      document.body.appendChild(win);
      this.windowEl = win;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;';
      win.appendChild(canvas);
      this.canvas = canvas;

      const btn = document.createElement('button');
      btn.id = 'gandi-3d-fs-btn';
      btn.style.cssText = 'position:absolute;right:12px;bottom:12px;width:44px;height:44px;padding:0;border:none;background:rgba(0,0,0,0.55);border-radius:8px;cursor:pointer;z-index:2;display:flex;align-items:center;justify-content:center;';
      btn.innerHTML = '<img src="' + FS_ICON + '" style="width:26px;height:26px;display:block;"/>';
      btn.addEventListener('click', (e) => { e.stopPropagation(); this.enterFullscreen(); });
      win.appendChild(btn);
      this.fullscreenBtn = btn;

      this._setupDragRotate(canvas);
      this._updateCanvasPointer();

      if (!this._escBound) {
        this._escBound = true;
        window.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && this._isFullscreen) this.exitFullscreen();
        });
        // 鼠标锁定被解除（按ESC等）→ 镜头转动状态自动复位
        document.addEventListener('pointerlockchange', () => {
          if (document.pointerLockElement !== canvas && this.mouseLookEnabled) {
            this.mouseLookEnabled = false;
            this._updateCanvasPointer();
          }
        });
      }
    }

    enterFullscreen() {
      if (this._isFullscreen || !this.windowEl) return;
      this._isFullscreen = true;
      this.windowEl.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#1a1a2e;z-index:99999;overflow:hidden;border:none;border-radius:0;';
      if (this.fullscreenBtn) this.fullscreenBtn.style.display = 'none';
      this._resize();
      this._showTip('按ESC退出全屏');
    }

    exitFullscreen() {
      if (!this._isFullscreen || !this.windowEl) return;
      this._isFullscreen = false;
      this.windowEl.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:' + WINDOW_W + 'px;height:' + WINDOW_H + 'px;background:#1a1a2e;border:2px solid #00695C;border-radius:8px;z-index:9999;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.5);';
      if (this.fullscreenBtn) this.fullscreenBtn.style.display = 'flex';
      this._resize();
      this._hideTip();
    }

    _showTip(text) {
      this._hideTip();
      const tip = document.createElement('div');
      tip.id = 'gandi-3d-fs-tip';
      tip.textContent = text;
      tip.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#fff;padding:10px 26px;border-radius:20px;font-size:15px;z-index:100000;pointer-events:none;box-shadow:0 4px 16px rgba(0,0,0,0.4);';
      document.body.appendChild(tip);
      this.tipEl = tip;
      this._fsTipTimer = setTimeout(() => { this._hideTip(); }, 3000);
    }

    _hideTip() {
      if (this._fsTipTimer) { clearTimeout(this._fsTipTimer); this._fsTipTimer = null; }
      if (this.tipEl) { this.tipEl.remove(); this.tipEl = null; }
    }

    _resize() {
      if (!this.ready || !this.canvas) return;
      let w, h;
      if (this._isFullscreen) {
        w = window.innerWidth;
        h = window.innerHeight;
      } else {
        w = WINDOW_W;
        h = WINDOW_H;
      }
      if (w === 0 || h === 0) return;
      this.canvas.width = w;
      this.canvas.height = h;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h, false);
    }

    _animate() {
      if (!this.ready) return;
      requestAnimationFrame(() => this._animate());
      this.renderer.render(this.scene, this.camera);
    }

    _setupDragRotate(canvas) {
      if (this._dragBound) return;
      this._dragBound = true;
      let dragging = false;
      let lastX = 0, lastY = 0;
      const onMouseDown = (e) => {
        if (!this.dragRotateEnabled) return;
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.style.cursor = 'grabbing';
      };
      const onMouseMove = (e) => {
        // MC风格镜头：鼠标移动即转镜头（pointer lock 下用 movementX/Y，无需按住）
        if (this.mouseLookEnabled && this.camera) {
          const dx = e.movementX || 0;
          const dy = e.movementY || 0;
          this.cameraYaw -= dx * 0.002;
          this.cameraPitch += dy * 0.002;
          this.cameraPitch = Math.max(-1.5, Math.min(1.5, this.cameraPitch));
          const dist = this.camera.position.length() || 5;
          this.camera.position.x = dist * Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch);
          this.camera.position.y = dist * Math.sin(this.cameraPitch);
          this.camera.position.z = dist * Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch);
          this.camera.lookAt(0, 0, 0);
          return;
        }
        if (!dragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        // 拖动旋转：拖动旋转指定模型
        if (this.dragRotateEnabled) {
          const m = this._getModel(this.dragRotateModelId);
          if (m) {
            m.rotation.y += dx * 0.01;
            m.rotation.x += dy * 0.01;
          }
        }
      };
      const onMouseUp = () => {
        if (dragging) {
          dragging = false;
          if (this.canvas) this.canvas.style.cursor = this.dragRotateEnabled ? 'grab' : 'default';
        }
      };
      canvas.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      // 保存清理函数：清除场景后可解绑，避免再次初始化时拖动失效
      this._dragCleanup = () => {
        canvas.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        this._dragBound = false;
        this._dragCleanup = null;
      };
    }

    _updateCanvasPointer() {
      if (!this.canvas) return;
      const active = this.dragRotateEnabled || this.mouseLookEnabled;
      this.canvas.style.pointerEvents = active ? 'auto' : 'none';
      this.canvas.style.cursor = active ? 'grab' : 'default';
    }

    // ========== 模型角色系统 ==========

    _getModel(id) {
      const n = Number(id);
      for (const m of this.models) {
        if (m.userData.id === n) return m;
      }
      return null;
    }

    // 创建/改变几何体：指定编号。已存在同编号自建几何体 → 替换其几何体；
    // 已存在同编号导入模型 → 移除重建；不存在 → 新建。
    _setPrimitive(id, newGeo, originalColor, material) {
      const n = Number(id) || 1;
      let mesh = this._getModel(n);
      if (mesh && mesh.userData.isPrimitive) {
        if (mesh.geometry) mesh.geometry.dispose();
        mesh.geometry = newGeo;
        mesh.userData.originalColor = originalColor;
        this.currentModel = mesh;
        return mesh;
      }
      if (mesh && mesh.parent) mesh.parent.remove(mesh);
      const mat = material || new THREE.MeshStandardMaterial({ color: DEFAULT_COLOR });
      const newMesh = new THREE.Mesh(newGeo, mat);
      newMesh.userData.isPrimitive = true;
      newMesh.userData.originalColor = originalColor;
      newMesh.userData.id = n;
      this.scene.add(newMesh);
      this.models = this.models.filter(m2 => m2.userData.id !== n);
      this.models.push(newMesh);
      this.nextId = Math.max(this.nextId, n + 1);
      this.currentModel = newMesh;
      return newMesh;
    }

    createCube(id, w, h, d) {
      if (!this.ready) return null;
      const geo = new THREE.BoxGeometry(w * PX, h * PX, d * PX);
      return this._setPrimitive(id, geo, DEFAULT_COLOR);
    }

    createSphere(id, r) {
      if (!this.ready) return null;
      const geo = new THREE.SphereGeometry(r * PX, 32, 32);
      return this._setPrimitive(id, geo, DEFAULT_COLOR);
    }

    createCone(id, r, h, s) {
      if (!this.ready) return null;
      const geo = new THREE.ConeGeometry(r * PX, h * PX, Math.max(3, s | 0));
      return this._setPrimitive(id, geo, DEFAULT_COLOR);
    }

    createCylinder(id, r, h, s) {
      if (!this.ready) return null;
      const geo = new THREE.CylinderGeometry(r * PX, r * PX, h * PX, Math.max(3, s | 0));
      return this._setPrimitive(id, geo, DEFAULT_COLOR);
    }

    createPlane(id, url) {
      if (!this.ready) return null;
      const geo = new THREE.PlaneGeometry(2, 2);
      const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      if (url && url !== ' ') {
        const loader = new THREE.TextureLoader();
        loader.load(url, (tex) => { mat.map = tex; mat.needsUpdate = true; }, undefined, () => {});
      }
      return this._setPrimitive(id, geo, 0xffffff, mat);
    }

    cloneModel(id) {
      if (!this.ready) return null;
      const src = this._getModel(id);
      if (!src) return null;
      const newId = this.nextId++;
      const clone = src.clone(true);
      clone.traverse((obj) => {
        if (obj.isMesh) {
          if (obj.geometry) obj.geometry = obj.geometry.clone();
          if (obj.material) obj.material = obj.material.clone();
        }
      });
      clone.userData.id = newId;
      clone.userData.isPrimitive = src.userData.isPrimitive;
      clone.userData.originalColor = src.userData.originalColor;
      clone.userData.cloneOf = src.userData.id; // 记录克隆来源（本体ID）
      clone.position.x += 0.2; // 避免与原模型完全重叠
      this.scene.add(clone);
      this.models.push(clone);
      this.currentModel = clone;
      return clone;
    }

    deleteModel(id) {
      const m = this._getModel(id);
      if (!m) return;
      if (m && m.parent) m.parent.remove(m);
      this._disposeObject(m);
      this.models = this.models.filter(x => x !== m);
      if (this.currentModel === m) this.currentModel = null;
    }

    _disposeObject(obj) {
      obj.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach(mm => mm.dispose());
            else child.material.dispose();
          }
        }
      });
    }

    importModelTo(id, url, onOk, onFail) {
      const n = Number(id) || 1;
      const loader = new THREE.GLTFLoader();
      loader.load(url, (gltf) => {
        const model = gltf.scene;
        const old = this._getModel(n);
        if (old && old.parent) old.parent.remove(old);
        model.userData.id = n;
        model.userData.isPrimitive = false;
        model.userData.originalColor = null;
        this.scene.add(model);
        this.models = this.models.filter(m2 => m2.userData.id !== n);
        this.models.push(model);
        this.nextId = Math.max(this.nextId, n + 1);
        this.currentModel = model;
        if (onOk) onOk();
      }, undefined, () => { if (onFail) onFail(); });
    }

    setColor(id, color) {
      const m = this._getModel(id);
      if (!m) return;
      m.traverse((obj) => {
        if (obj.isMesh && obj.material && obj.material.color) obj.material.color.set(color);
      });
    }

    resetColor(id) {
      const m = this._getModel(id);
      if (!m) return;
      const orig = m.userData.originalColor;
      m.traverse((obj) => {
        if (obj.isMesh && obj.material && obj.material.color) {
          obj.material.color.set(orig !== undefined && orig !== null ? orig : DEFAULT_COLOR);
        }
      });
    }

    setPosition(id, x, y, z) {
      const m = this._getModel(id);
      if (!m) return;
      if (x !== undefined && x !== null) m.position.x = x * PX;
      if (y !== undefined && y !== null) m.position.y = y * PX;
      if (z !== undefined && z !== null) m.position.z = z * PX;
    }

    changePosition(id, x, y, z) {
      const m = this._getModel(id);
      if (!m) return;
      if (x) m.position.x += x * PX;
      if (y) m.position.y += y * PX;
      if (z) m.position.z += z * PX;
    }

    rotate(id, axis, angle) {
      const m = this._getModel(id);
      if (!m) return;
      const rad = angle * Math.PI / 180;
      if (axis === 'x') m.rotation.x += rad;
      if (axis === 'y') m.rotation.y += rad;
      if (axis === 'z') m.rotation.z += rad;
    }

    setRotation(id, axis, angle) {
      const m = this._getModel(id);
      if (!m) return;
      const rad = angle * Math.PI / 180;
      if (axis === 'x') m.rotation.x = rad;
      if (axis === 'y') m.rotation.y = rad;
      if (axis === 'z') m.rotation.z = rad;
    }

    setSize(id, s) {
      const m = this._getModel(id);
      if (!m) return;
      const k = (Number(s) || 0) / 100;
      m.scale.setScalar(k);
    }

    changeSize(id, s) {
      const m = this._getModel(id);
      if (!m) return;
      const cur = (m.scale.x || 1) * 100;
      const newPct = cur + (Number(s) || 0);
      m.scale.setScalar(newPct / 100);
    }

    setDragRotateMode(enabled, id) {
      this.dragRotateEnabled = !!enabled;
      this.dragRotateModelId = Number(id) || 1;
      if (enabled && this.mouseLookEnabled) this.mouseLookEnabled = false;
      this._updateCanvasPointer();
    }

    setMouseLook(enabled) {
      if (enabled) {
        // 开启镜头转动：与拖动旋转模型互斥
        if (this.dragRotateEnabled) this.dragRotateEnabled = false;
        if (!this.canvas || !this.canvas.requestPointerLock) {
          alert('当前浏览器不支持鼠标锁定');
          return;
        }
        this.mouseLookEnabled = true;
        this._updateCanvasPointer();
        try {
          const p = this.canvas.requestPointerLock();
          if (p && p.catch) {
            p.catch(() => {
              this.mouseLookEnabled = false;
              this._updateCanvasPointer();
              alert('浏览器不允许锁定鼠标（沙箱限制），镜头转动不可用');
            });
          }
        } catch (e) {
          this.mouseLookEnabled = false;
          this._updateCanvasPointer();
          alert('浏览器不允许锁定鼠标（沙箱限制），镜头转动不可用');
        }
      } else {
        this.mouseLookEnabled = false;
        if (document.exitPointerLock && document.pointerLockElement) document.exitPointerLock();
        this._updateCanvasPointer();
      }
    }

    setCameraZ(z) { if (this.camera) this.camera.position.z = z; }
    show() { if (this.canvas) this.canvas.style.display = 'block'; }
    hide() { if (this.canvas) this.canvas.style.display = 'none'; }

    clear() {
      this._hideTip();
      if (document.exitPointerLock && document.pointerLockElement) document.exitPointerLock();
      if (this._dragCleanup) this._dragCleanup();
      if (this.models) {
        for (const m of this.models) this._disposeObject(m);
      }
      if (this.windowEl) { this.windowEl.remove(); this.windowEl = null; }
      this.canvas = null;
      this.fullscreenBtn = null;
      this._isFullscreen = false;
      this.models = [];
      this.nextId = 1;
      this.currentModel = null;
      this.dragRotateModelId = 1;
      this.mouseLookEnabled = false;
      this.cameraYaw = 0;
      this.cameraPitch = 0;
      this.ready = false;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
    }
  }

  class Scratch3D {
    constructor() {
      this.sceneMgr = new SceneManager();
    }

    getInfo() {
      return {
        id: 'valeglow-3d-7ccc',
        name: t('extName'),
        color1: '#00695C',
        color2: '#004D40',
        color3: '#00897B',
        blocks: [
          '---初始化',
          { opcode: 'initScene', blockType: 'command', text: t('init') },
          { opcode: 'showCanvas', blockType: 'command', text: t('showCanvas') },
          { opcode: 'hideCanvas', blockType: 'command', text: t('hideCanvas') },
          { opcode: 'setCameraZ', blockType: 'command', text: t('setCameraZ'), arguments: { Z: { type: 'number', defaultValue: 5 } } },
          { opcode: 'enterFullscreen', blockType: 'command', text: t('enterFS') },
          { opcode: 'exitFullscreen', blockType: 'command', text: t('exitFS') },
          { opcode: 'clearScene', blockType: 'command', text: t('clearScene') },

          '---模型',
          { opcode: 'importModel', blockType: 'command', text: t('importModel'), arguments: { URL: { type: 'string', defaultValue: 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf' }, ID: { type: 'number', defaultValue: 1 } } },
          { opcode: 'createCube', blockType: 'command', text: t('createCube'), arguments: { W: { type: 'number', defaultValue: 100 }, H: { type: 'number', defaultValue: 100 }, D: { type: 'number', defaultValue: 100 }, ID: { type: 'number', defaultValue: 1 } } },
          { opcode: 'createSphere', blockType: 'command', text: t('createSphere'), arguments: { R: { type: 'number', defaultValue: 50 }, ID: { type: 'number', defaultValue: 1 } } },
          { opcode: 'createCone', blockType: 'command', text: t('createCone'), arguments: { R: { type: 'number', defaultValue: 50 }, H: { type: 'number', defaultValue: 100 }, S: { type: 'number', defaultValue: 8 }, ID: { type: 'number', defaultValue: 1 } } },
          { opcode: 'createCylinder', blockType: 'command', text: t('createCylinder'), arguments: { R: { type: 'number', defaultValue: 50 }, H: { type: 'number', defaultValue: 100 }, S: { type: 'number', defaultValue: 12 }, ID: { type: 'number', defaultValue: 1 } } },
          { opcode: 'createPlane', blockType: 'command', text: t('createPlane'), arguments: { URL: { type: 'string', defaultValue: ' ' }, ID: { type: 'number', defaultValue: 1 } } },
          { opcode: 'cloneModel', blockType: 'command', text: t('cloneModel'), arguments: { ID: { type: 'number', defaultValue: 1 } } },
          { opcode: 'deleteModel', blockType: 'command', text: t('deleteModel'), arguments: { ID: { type: 'number', defaultValue: 1 } } },
          { opcode: 'setColor', blockType: 'command', text: t('setColor'), arguments: { ID: { type: 'number', defaultValue: 1 }, C: { type: 'color', defaultValue: '#00695C' } } },
          { opcode: 'resetColor', blockType: 'command', text: t('resetColor'), arguments: { ID: { type: 'number', defaultValue: 1 } } },

          '---操作',
          { opcode: 'setDragRotate', blockType: 'command', text: t('setDragRotate'), arguments: { M: { type: 'number', defaultValue: 0, menu: 'dragMenu' }, ID: { type: 'number', defaultValue: 1 } } },
          { opcode: 'setSize', blockType: 'command', text: t('setSize'), arguments: { ID: { type: 'number', defaultValue: 1 }, S: { type: 'number', defaultValue: 100 } } },
          { opcode: 'changeSize', blockType: 'command', text: t('changeSize'), arguments: { ID: { type: 'number', defaultValue: 1 }, S: { type: 'number', defaultValue: 10 } } },
          { opcode: 'setMouseLook', blockType: 'command', text: t('setMouseLook'), arguments: { M: { type: 'number', defaultValue: 0, menu: 'lookMenu' } } },
          { opcode: 'setX', blockType: 'command', text: t('setX'), arguments: { ID: { type: 'number', defaultValue: 1 }, X: { type: 'number', defaultValue: 0 } } },
          { opcode: 'setY', blockType: 'command', text: t('setY'), arguments: { ID: { type: 'number', defaultValue: 1 }, Y: { type: 'number', defaultValue: 0 } } },
          { opcode: 'setZ', blockType: 'command', text: t('setZ'), arguments: { ID: { type: 'number', defaultValue: 1 }, Z: { type: 'number', defaultValue: 0 } } },
          { opcode: 'changeX', blockType: 'command', text: t('changeX'), arguments: { ID: { type: 'number', defaultValue: 1 }, X: { type: 'number', defaultValue: 10 } } },
          { opcode: 'changeY', blockType: 'command', text: t('changeY'), arguments: { ID: { type: 'number', defaultValue: 1 }, Y: { type: 'number', defaultValue: 10 } } },
          { opcode: 'changeZ', blockType: 'command', text: t('changeZ'), arguments: { ID: { type: 'number', defaultValue: 1 }, Z: { type: 'number', defaultValue: 10 } } },
          { opcode: 'rotateX', blockType: 'command', text: t('rotateX'), arguments: { ID: { type: 'number', defaultValue: 1 }, X: { type: 'number', defaultValue: 15 } } },
          { opcode: 'rotateY', blockType: 'command', text: t('rotateY'), arguments: { ID: { type: 'number', defaultValue: 1 }, Y: { type: 'number', defaultValue: 15 } } },
          { opcode: 'rotateZ', blockType: 'command', text: t('rotateZ'), arguments: { ID: { type: 'number', defaultValue: 1 }, Z: { type: 'number', defaultValue: 15 } } },
          { opcode: 'setRotateX', blockType: 'command', text: t('setRotateX'), arguments: { ID: { type: 'number', defaultValue: 1 }, X: { type: 'number', defaultValue: 0 } } },
          { opcode: 'setRotateY', blockType: 'command', text: t('setRotateY'), arguments: { ID: { type: 'number', defaultValue: 1 }, Y: { type: 'number', defaultValue: 0 } } },
          { opcode: 'setRotateZ', blockType: 'command', text: t('setRotateZ'), arguments: { ID: { type: 'number', defaultValue: 1 }, Z: { type: 'number', defaultValue: 0 } } },
        ],
        menus: {
          dragMenu: {
            acceptReporters: true,
            items: [{ text: '开启', value: 1 }, { text: '关闭', value: 0 }]
          },
          lookMenu: {
            acceptReporters: true,
            items: [{ text: '开启', value: 1 }, { text: '关闭', value: 0 }]
          }
        }
      };
    }

    async initScene() { await this.sceneMgr.init(); }
    showCanvas() { this.sceneMgr.show(); }
    hideCanvas() { this.sceneMgr.hide(); }
    setCameraZ(args) { this.sceneMgr.setCameraZ(Number(args.Z)); }
    clearScene() { this.sceneMgr.clear(); }
    enterFullscreen() { this.sceneMgr.enterFullscreen(); }
    exitFullscreen() { this.sceneMgr.exitFullscreen(); }

    async importModel(args) {
      if (!this.sceneMgr.ready) return;
      const ok = await this.sceneMgr._loadGLTFLoader();
      if (!ok || typeof THREE === 'undefined' || !THREE.GLTFLoader) {
        alert('加载失败');
        return;
      }
      this.sceneMgr.importModelTo(args.ID, args.URL, null, () => { alert('加载失败'); });
    }

    createCube(args) { this.sceneMgr.createCube(args.ID, Number(args.W), Number(args.H), Number(args.D)); }
    createSphere(args) { this.sceneMgr.createSphere(args.ID, Number(args.R)); }
    createCone(args) { this.sceneMgr.createCone(args.ID, Number(args.R), Number(args.H), Number(args.S)); }
    createCylinder(args) { this.sceneMgr.createCylinder(args.ID, Number(args.R), Number(args.H), Number(args.S)); }
    createPlane(args) { this.sceneMgr.createPlane(args.ID, args.URL); }
    cloneModel(args) { this.sceneMgr.cloneModel(args.ID); }
    deleteModel(args) { this.sceneMgr.deleteModel(args.ID); }
    setColor(args) { this.sceneMgr.setColor(args.ID, args.C); }
    resetColor(args) { this.sceneMgr.resetColor(args.ID); }

    setDragRotate(args) {
      this.sceneMgr.setDragRotateMode(Number(args.M) === 1, args.ID);
    }
    setSize(args) { this.sceneMgr.setSize(args.ID, Number(args.S)); }
    changeSize(args) { this.sceneMgr.changeSize(args.ID, Number(args.S)); }
    setMouseLook(args) { this.sceneMgr.setMouseLook(Number(args.M) === 1); }

    setX(args) { this.sceneMgr.setPosition(args.ID, Number(args.X), null, null); }
    setY(args) { this.sceneMgr.setPosition(args.ID, null, Number(args.Y), null); }
    setZ(args) { this.sceneMgr.setPosition(args.ID, null, null, Number(args.Z)); }
    changeX(args) { this.sceneMgr.changePosition(args.ID, Number(args.X), 0, 0); }
    changeY(args) { this.sceneMgr.changePosition(args.ID, 0, Number(args.Y), 0); }
    changeZ(args) { this.sceneMgr.changePosition(args.ID, 0, 0, Number(args.Z)); }
    rotateX(args) { this.sceneMgr.rotate(args.ID, 'x', Number(args.X)); }
    rotateY(args) { this.sceneMgr.rotate(args.ID, 'y', Number(args.Y)); }
    rotateZ(args) { this.sceneMgr.rotate(args.ID, 'z', Number(args.Z)); }
    setRotateX(args) { this.sceneMgr.setRotation(args.ID, 'x', Number(args.X)); }
    setRotateY(args) { this.sceneMgr.setRotation(args.ID, 'y', Number(args.Y)); }
    setRotateZ(args) { this.sceneMgr.setRotation(args.ID, 'z', Number(args.Z)); }
  }

  const _scratch3dInstance = new Scratch3D();
  extensions.register(_scratch3dInstance);
  // 暴露给配套扩展（如"相对运动"）访问场景与模型
  window.__scratch3dScene = _scratch3dInstance;
})(Scratch);
