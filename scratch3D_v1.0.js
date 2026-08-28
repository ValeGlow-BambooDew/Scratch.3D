/**
 * Gandi 3D Scene Extension
 * 外置叠加 Canvas 方案，基于 Three.js 的 3D 场景引擎拓展
 *
 * 功能：
 *   - 在舞台上方悬浮一块独立 Canvas，用 Three.js 渲染 3D 场景
 *   - 导入 GLTF/GLB 3D 模型
 *   - 沿 Z 轴移动模型
 *   - 沿 X / Y / Z 轴旋转模型
 */

(function (Scratch) {
  const {
    runtime,
    ArgumentType,
    BlockType,
    TargetType,
    Cast,
    translate,
    extensions,
  } = Scratch;

  // ------------------------------------------------------------------
  // 多语言
  // ------------------------------------------------------------------
  translate.setup({
    zh: {
      extName: '3D场景引擎',
      'tag.init': '🚀 初始化',
      'tag.model': '📦 模型',
      'tag.operation': '🎮 操作',
      'block.initScene': '初始化3D场景',
      'block.showCanvas': '显示3D画布',
      'block.hideCanvas': '隐藏3D画布',
      'block.loadModel': '导入模型 [URL]',
      'block.createCube': '创建立方体 宽[X] 高[Y] 深[Z]',
      'block.createSphere': '创建球体 半径[R]',
      'block.createCone': '创建锥体 半径[R] 高[H] 棱[SEG]',
      'block.createCylinder': '创建柱体 半径[R] 高[H] 棱[SEG]',
      'block.setColor': '设置模型颜色为 [COLOR]',
      'block.restoreColor': '恢复模型颜色',
      'block.createPlane': '创建平面 图片[URL]',
      'block.setModelPositionX': '将模型X轴设为 [X]',
      'block.setModelPositionY': '将模型Y轴设为 [Y]',
      'block.setModelPositionZ': '将模型Z轴设为 [Z]',
      'block.changeModelPositionX': '模型X轴增加 [X]',
      'block.changeModelPositionY': '模型Y轴增加 [Y]',
      'block.changeModelPositionZ': '模型Z轴增加 [Z]',
      'block.setDragRotate': '设置拖动旋转模式为 [MODE]',
      'block.getModelX': '模型的X坐标',
      'block.getModelY': '模型的Y坐标',
      'menu.drag.on': '开启',
      'menu.drag.off': '关闭',
      'block.rotateX': '将模型绕X轴旋转 [ANGLE] 度',
      'block.rotateY': '将模型绕Y轴旋转 [ANGLE] 度',
      'block.rotateZ': '将模型绕Z轴旋转 [ANGLE] 度',
      'block.setRotationX': '将模型X轴旋转角度设为 [ANGLE]',
      'block.setRotationY': '将模型Y轴旋转角度设为 [ANGLE]',
      'block.setRotationZ': '将模型Z轴旋转角度设为 [ANGLE]',
      'block.getModelZ': '模型的Z坐标',
      'block.getRotationX': '模型的X轴旋转角度',
      'block.getRotationY': '模型的Y轴旋转角度',
      'block.getRotationZ': '模型的Z轴旋转角度',
      'block.setCameraZ': '将相机Z轴设为 [Z]',
      'default.url': 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
      'msg.loading': '模型加载中...',
      'msg.loaded': '模型加载完成',
      'msg.loadError': '模型加载失败',
      'msg.notReady': '3D场景未初始化',
      'msg.noModel': '没有已加载的模型',
    },
    en: {
      extName: '3D Scene Engine',
      'tag.init': '🚀 Init',
      'tag.model': '📦 Model',
      'tag.operation': '🎮 Operation',
      'block.initScene': 'init 3D scene',
      'block.showCanvas': 'show 3D canvas',
      'block.hideCanvas': 'hide 3D canvas',
      'block.loadModel': 'load model [URL]',
      'block.createCube': 'create cube w[X] h[Y] d[Z]',
      'block.createSphere': 'create sphere r[R]',
      'block.createCone': 'create cone r[R] h[H] seg[SEG]',
      'block.createCylinder': 'create cylinder r[R] h[H] seg[SEG]',
      'block.setColor': 'set model color to [COLOR]',
      'block.restoreColor': 'restore model color',
      'block.createPlane': 'create plane image [URL]',
      'block.setModelPositionX': 'set model X to [X]',
      'block.setModelPositionY': 'set model Y to [Y]',
      'block.setModelPositionZ': 'set model Z to [Z]',
      'block.changeModelPositionX': 'change model X by [X]',
      'block.changeModelPositionY': 'change model Y by [Y]',
      'block.changeModelPositionZ': 'change model Z by [Z]',
      'block.setDragRotate': 'set drag rotate mode to [MODE]',
      'block.getModelX': 'model X position',
      'block.getModelY': 'model Y position',
      'menu.drag.on': 'on',
      'menu.drag.off': 'off',
      'block.rotateX': 'rotate model around X by [ANGLE] degrees',
      'block.rotateY': 'rotate model around Y by [ANGLE] degrees',
      'block.rotateZ': 'rotate model around Z by [ANGLE] degrees',
      'block.setRotationX': 'set model X rotation to [ANGLE]',
      'block.setRotationY': 'set model Y rotation to [ANGLE]',
      'block.setRotationZ': 'set model Z rotation to [ANGLE]',
      'block.getModelZ': 'model Z position',
      'block.getRotationX': 'model X rotation',
      'block.getRotationY': 'model Y rotation',
      'block.getRotationZ': 'model Z rotation',
      'block.setCameraZ': 'set camera Z to [Z]',
      'default.url': 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
      'msg.loading': 'Loading model...',
      'msg.loaded': 'Model loaded',
      'msg.loadError': 'Failed to load model',
      'msg.notReady': '3D scene not initialized',
      'msg.noModel': 'No model loaded',
    },
  });

  // ------------------------------------------------------------------
  // Three.js 动态加载器
  // ------------------------------------------------------------------
  const THREE_JS_URL = 'https://cdn.jsdelivr.net/npm/three@0.148.0/build/three.min.js';
  const GLTFLoader_URL = 'https://cdn.jsdelivr.net/npm/three@0.148.0/examples/js/loaders/GLTFLoader.js';

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      // 已加载则直接返回
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === 'true') return resolve();
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.dataset.loaded = 'false';
      script.onload = () => {
        script.dataset.loaded = 'true';
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function ensureThreeJS() {
    if (window.THREE && window.THREE.GLTFLoader) return true;
    try {
      if (!window.THREE) await loadScript(THREE_JS_URL);
      if (!window.THREE.GLTFLoader) await loadScript(GLTFLoader_URL);
      return !!(window.THREE && window.THREE.GLTFLoader);
    } catch (e) {
      console.error('[3D Scene] Failed to load Three.js:', e);
      return false;
    }
  }

  // ------------------------------------------------------------------
  // 3D 场景管理器
  // ------------------------------------------------------------------
  class SceneManager {
    constructor() {
      this.ready = false;
      this.container = null;
      this.renderer = null;
      this.scene = null;
      this.camera = null;
      this.model = null;
      this.animationId = null;
      this.clock = null;
      this._resizeObserver = null;
      // 拖动旋转
      this.dragRotateEnabled = false;
      this._isDragging = false;
      this._lastMouseX = 0;
      this._lastMouseY = 0;
      this._dragRotateSpeed = 0.5;
      // 画布可见性状态（用于初始化前调用 hide 后恢复）
      this._canvasVisible = true;
      // 模型类型：'imported'（导入模型）或 'primitive'（标准几何体）
      this.modelType = null;
      // 导入模型的原始颜色备份
      this._originalColors = [];
      // 标准几何体默认颜色
      this._PRIMITIVE_COLOR = '#4a90d9';
    }

    /**
     * 初始化场景：创建悬浮 Canvas、设置场景/相机/灯光/渲染循环
     */
    async init() {
      if (this.ready) return true;

      const loaded = await ensureThreeJS();
      if (!loaded) {
        console.error('[3D Scene] Three.js not available');
        return false;
      }

      const THREE = window.THREE;

      // 1. 找到舞台容器
      const stageEl = this._findStageElement();
      if (!stageEl) {
        console.error('[3D Scene] Stage element not found');
        return false;
      }

      // 2. 创建悬浮容器
      const container = document.createElement('div');
      container.id = 'gandi-3d-scene-container';
      container.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10;
        overflow: hidden;
      `;
      stageEl.style.position = stageEl.style.position || 'relative';
      stageEl.appendChild(container);
      this.container = container;
      // 应用初始化前已设置的状态
      if (!this._canvasVisible) container.style.display = 'none';
      if (this.dragRotateEnabled) {
        container.style.pointerEvents = 'auto';
        container.style.cursor = 'grab';
      }
      // 2.5 绑定拖动旋转事件
      this._setupDragRotate(container);

      // 3. 获取舞台尺寸
      const rect = stageEl.getBoundingClientRect();
      const width = rect.width || 480;
      const height = rect.height || 360;

      // 4. 场景
      this.scene = new THREE.Scene();
      this.scene.background = null; // 透明背景，让 Scratch 舞台透出来

      // 5. 相机
      this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
      this.camera.position.set(0, 0, 5);

      // 6. 灯光
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      this.scene.add(directionalLight);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
      directionalLight2.position.set(-5, -3, -5);
      this.scene.add(directionalLight2);

      // 7. 渲染器
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        premultipliedAlpha: false,
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(window.devicePixelRatio || 1);
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      container.appendChild(this.renderer.domElement);

      // 8. 时钟
      this.clock = new THREE.Clock();

      // 9. 渲染循环
      this._animate();

      // 10. 监听舞台尺寸变化
      this._setupResizeObserver(stageEl);

      this.ready = true;
      console.log('[3D Scene] Scene initialized');
      return true;
    }

    /**
     * 查找 Gandi 舞台元素
     */
    _findStageElement() {
      // 尝试多种选择器适配不同版本
      const selectors = [
        '[class*="stage_stage"]',
        '[class*="stage-wrapper"]',
        '#stage',
        '.stage',
        '[class*="StageStage"]',
        '[class*="stage-canvas"]',
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) return el;
      }
      // 兜底：找包含 canvas 的较大容器
      const canvases = document.querySelectorAll('canvas');
      for (const c of canvases) {
        const parent = c.parentElement;
        if (parent && parent.getBoundingClientRect().width >= 400) {
          return parent;
        }
      }
      return null;
    }

    /**
     * 监听舞台尺寸变化，自动调整渲染器
     */
    _setupResizeObserver(stageEl) {
      if (window.ResizeObserver) {
        this._resizeObserver = new ResizeObserver(() => {
          this._resize();
        });
        this._resizeObserver.observe(stageEl);
      }
      // 同时监听 window resize
      window.addEventListener('resize', this._resize.bind(this));
    }

    _resize() {
      if (!this.ready || !this.container) return;
      const parent = this.container.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      if (width === 0 || height === 0) return;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }

    /**
     * 渲染循环
     */
    _animate() {
      if (!this.ready) return;
      this.animationId = requestAnimationFrame(() => this._animate());
      const delta = this.clock.getDelta();
      // 这里可以加模型动画更新
      this.renderer.render(this.scene, this.camera);
    }

    /**
     * 加载 GLTF/GLB 模型
     */
    loadModel(url) {
      return new Promise((resolve, reject) => {
        if (!this.ready) {
          reject(new Error(translate({ id: 'msg.notReady' })));
          return;
        }
        const THREE = window.THREE;
        const loader = new THREE.GLTFLoader();

        loader.load(
          url,
          (gltf) => {
            // 移除旧模型
            if (this.model) {
              this.scene.remove(this.model);
              this._disposeObject(this.model);
            }
            this.model = gltf.scene || gltf.scenes[0];

            // 自动缩放适配视野
            const box = new THREE.Box3().setFromObject(this.model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 0) {
              const scale = 2 / maxDim;
              this.model.scale.setScalar(scale);
            }

            // 居中
            const center = box.getCenter(new THREE.Vector3());
            this.model.position.sub(center.multiplyScalar(this.model.scale.x));

            this.scene.add(this.model);
            this.modelType = 'imported';
            this._saveOriginalColors();
            resolve(this.model);
          },
          (xhr) => {
            // 加载进度
            if (xhr.total) {
              console.log(`[3D Scene] Loading ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`);
            }
          },
          (error) => {
            console.error('[3D Scene] Model load error:', error);
            reject(error);
          }
        );
      });
    }

    // ---- 几何体创建 ----
    // px 到 Three.js 单位的转换比例：100px = 1 单位
    _PX_TO_UNIT() {
      return 0.01;
    }

    _createPrimitiveMesh(geometry) {
      const THREE = window.THREE;
      const material = new THREE.MeshStandardMaterial({
        color: 0x4a90d9,
        roughness: 0.5,
        metalness: 0.2,
      });
      return new THREE.Mesh(geometry, material);
    }

    _replaceModel(mesh) {
      if (!this.ready) return;
      // 移除旧模型
      if (this.model) {
        this.scene.remove(this.model);
        this._disposeObject(this.model);
      }
      this.model = mesh;
      this.scene.add(mesh);
      this.modelType = 'primitive';
      this._originalColors = [];
    }

    createCube(widthPx, heightPx, depthPx) {
      if (!this.ready) return;
      const THREE = window.THREE;
      const s = this._PX_TO_UNIT();
      const geometry = new THREE.BoxGeometry(
        widthPx * s,
        heightPx * s,
        depthPx * s
      );
      this._replaceModel(this._createPrimitiveMesh(geometry));
    }

    createSphere(radiusPx) {
      if (!this.ready) return;
      const THREE = window.THREE;
      const s = this._PX_TO_UNIT();
      const geometry = new THREE.SphereGeometry(radiusPx * s, 32, 24);
      this._replaceModel(this._createPrimitiveMesh(geometry));
    }

    createCone(radiusPx, heightPx, segments) {
      if (!this.ready) return;
      const THREE = window.THREE;
      const s = this._PX_TO_UNIT();
      const seg = Math.max(3, Math.floor(segments));
      const geometry = new THREE.ConeGeometry(radiusPx * s, heightPx * s, seg);
      this._replaceModel(this._createPrimitiveMesh(geometry));
    }

    createCylinder(radiusPx, heightPx, segments) {
      if (!this.ready) return;
      const THREE = window.THREE;
      const s = this._PX_TO_UNIT();
      const seg = Math.max(3, Math.floor(segments));
      const geometry = new THREE.CylinderGeometry(radiusPx * s, radiusPx * s, heightPx * s, seg);
      this._replaceModel(this._createPrimitiveMesh(geometry));
    }

    async createPlane(imageUrl) {
      if (!this.ready) return;
      const THREE = window.THREE;
      const s = this._PX_TO_UNIT();

      // 加载 PNG 纹理
      const textureLoader = new THREE.TextureLoader();
      const texture = await new Promise((resolve, reject) => {
        textureLoader.load(imageUrl, resolve, undefined, reject);
      });
      texture.encoding = THREE.sRGBEncoding;

      // 按图片原始比例创建平面，基准高度 100px
      const img = texture.image;
      const baseHeightPx = 100;
      const heightPx = baseHeightPx;
      const widthPx = (img.width / img.height) * baseHeightPx;

      const geometry = new THREE.PlaneGeometry(widthPx * s, heightPx * s);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        color: 0xffffff,
      });
      const mesh = new THREE.Mesh(geometry, material);

      this._replaceModel(mesh);

      // 计算碰撞箱（厚度为0，存储在 userData 中供后续碰撞检测使用）
      mesh.userData.boundingBox = new THREE.Box3().setFromObject(mesh);
      mesh.userData.hasCollision = true;
    }

    setColor(hexColor) {
      if (!this.ready || !this.model) return;
      this.model.traverse((child) => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => {
              if (m.color) m.color.set(hexColor);
            });
          } else if (child.material.color) {
            child.material.color.set(hexColor);
          }
        }
      });
    }

    _saveOriginalColors() {
      this._originalColors = [];
      if (!this.model) return;
      this.model.traverse((child) => {
        if (child.isMesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => {
            if (m.color) {
              this._originalColors.push({ material: m, hex: m.color.getHex() });
            }
          });
        }
      });
    }

    restoreColor() {
      if (!this.ready || !this.model) return;
      if (this.modelType === 'primitive') {
        this.model.traverse((child) => {
          if (child.isMesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m) => {
              if (m.color) {
                // 有纹理的材质恢复为白色（不影响贴图），无纹理的恢复为默认色
                m.color.set(m.map ? '#ffffff' : this._PRIMITIVE_COLOR);
              }
            });
          }
        });
      } else if (this.modelType === 'imported') {
        this._originalColors.forEach(({ material, hex }) => {
          material.color.setHex(hex);
        });
      }
    }

    /**
     * 释放对象资源
     */
    _disposeObject(obj) {
      obj.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    // ---- 拖动旋转 ----

    _setupDragRotate(container) {
      container.addEventListener('mousedown', (e) => {
        if (!this.dragRotateEnabled || !this.model) return;
        this._isDragging = true;
        this._lastMouseX = e.clientX;
        this._lastMouseY = e.clientY;
        e.preventDefault();
      });
      container.addEventListener('mousemove', (e) => {
        if (!this._isDragging || !this.model) return;
        const dx = e.clientX - this._lastMouseX;
        const dy = e.clientY - this._lastMouseY;
        this._lastMouseX = e.clientX;
        this._lastMouseY = e.clientY;
        this.model.rotation.y += dx * this._dragRotateSpeed * Math.PI / 180;
        this.model.rotation.x += dy * this._dragRotateSpeed * Math.PI / 180;
      });
      const stopDrag = () => {
        this._isDragging = false;
      };
      container.addEventListener('mouseup', stopDrag);
      container.addEventListener('mouseleave', stopDrag);
      container.addEventListener('touchstart', (e) => {
        if (!this.dragRotateEnabled || !this.model || e.touches.length !== 1) return;
        this._isDragging = true;
        this._lastMouseX = e.touches[0].clientX;
        this._lastMouseY = e.touches[0].clientY;
        e.preventDefault();
      }, { passive: false });
      container.addEventListener('touchmove', (e) => {
        if (!this._isDragging || !this.model || e.touches.length !== 1) return;
        const dx = e.touches[0].clientX - this._lastMouseX;
        const dy = e.touches[0].clientY - this._lastMouseY;
        this._lastMouseX = e.touches[0].clientX;
        this._lastMouseY = e.touches[0].clientY;
        this.model.rotation.y += dx * this._dragRotateSpeed * Math.PI / 180;
        this.model.rotation.x += dy * this._dragRotateSpeed * Math.PI / 180;
        e.preventDefault();
      }, { passive: false });
      container.addEventListener('touchend', stopDrag);
    }

    setDragRotateMode(enabled) {
      this.dragRotateEnabled = !!enabled;
      if (this.container) {
        this.container.style.pointerEvents = this.dragRotateEnabled ? 'auto' : 'none';
        this.container.style.cursor = this.dragRotateEnabled ? 'grab' : 'default';
      }
    }

    // ---- 变换操作 ----

    setPositionX(x) {
      if (!this.model) return;
      this.model.position.x = x * this._PX_TO_UNIT();
    }
    setPositionY(y) {
      if (!this.model) return;
      this.model.position.y = y * this._PX_TO_UNIT();
    }
    setPositionZ(z) {
      if (!this.model) return;
      this.model.position.z = z * this._PX_TO_UNIT();
    }

    changePositionX(delta) {
      if (!this.model) return;
      this.model.position.x += delta * this._PX_TO_UNIT();
    }
    changePositionY(delta) {
      if (!this.model) return;
      this.model.position.y += delta * this._PX_TO_UNIT();
    }
    changePositionZ(delta) {
      if (!this.model) return;
      this.model.position.z += delta * this._PX_TO_UNIT();
    }

    getPositionX() {
      return this.model ? this.model.position.x * 100 : 0;
    }
    getPositionY() {
      return this.model ? this.model.position.y * 100 : 0;
    }
    getPositionZ() {
      return this.model ? this.model.position.z * 100 : 0;
    }

    rotateX(degrees) {
      if (!this.model) return;
      this.model.rotation.x += this._degToRad(degrees);
    }

    rotateY(degrees) {
      if (!this.model) return;
      this.model.rotation.y += this._degToRad(degrees);
    }

    rotateZ(degrees) {
      if (!this.model) return;
      this.model.rotation.z += this._degToRad(degrees);
    }

    setRotationX(degrees) {
      if (!this.model) return;
      this.model.rotation.x = this._degToRad(degrees);
    }

    setRotationY(degrees) {
      if (!this.model) return;
      this.model.rotation.y = this._degToRad(degrees);
    }

    setRotationZ(degrees) {
      if (!this.model) return;
      this.model.rotation.z = this._degToRad(degrees);
    }

    getRotationX() {
      return this.model ? this._radToDeg(this.model.rotation.x) : 0;
    }

    getRotationY() {
      return this.model ? this._radToDeg(this.model.rotation.y) : 0;
    }

    getRotationZ() {
      return this.model ? this._radToDeg(this.model.rotation.z) : 0;
    }

    setCameraZ(z) {
      if (!this.camera) return;
      this.camera.position.z = z;
    }

    show() {
      this._canvasVisible = true;
      if (this.container) this.container.style.display = 'block';
    }

    hide() {
      this._canvasVisible = false;
      if (this.container) this.container.style.display = 'none';
    }

    _degToRad(deg) {
      return deg * Math.PI / 180;
    }

    _radToDeg(rad) {
      return rad * 180 / Math.PI;
    }

    /**
     * 销毁场景
     */
    dispose() {
      this.ready = false;
      if (this.animationId) cancelAnimationFrame(this.animationId);
      if (this._resizeObserver) this._resizeObserver.disconnect();
      if (this.model) this._disposeObject(this.model);
      if (this.renderer) {
        this.renderer.dispose();
        if (this.renderer.domElement && this.renderer.domElement.parentNode) {
          this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
      }
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
      this.model = null;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.container = null;
    }
  }

  // ------------------------------------------------------------------
  // 拓展类
  // ------------------------------------------------------------------
  class Gandi3DScene {
    constructor(_runtime) {
      this._runtime = _runtime;
      this.sceneMgr = new SceneManager();
      this._loadPromise = null;
    }

    getInfo() {
      return {
        id: 'gandi3DScene',
        name: translate({ id: 'extName' }),
        color1: '#6A5ACD',
        color2: '#483D8B',
        color3: '#2F2F4F',
        blocks: [
          // ---- 初始化 ----
          '---' + translate({ id: 'tag.init' }),
          {
            opcode: 'initScene',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.initScene' }),
          },
          {
            opcode: 'showCanvas',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.showCanvas' }),
          },
          {
            opcode: 'hideCanvas',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.hideCanvas' }),
          },
          {
            opcode: 'setCameraZ',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.setCameraZ' }),
            arguments: {
              Z: {
                type: ArgumentType.NUMBER,
                defaultValue: 5,
              },
            },
          },

          // ---- 模型 ----
          '---' + translate({ id: 'tag.model' }),
          {
            opcode: 'loadModel',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.loadModel' }),
            arguments: {
              URL: {
                type: ArgumentType.STRING,
                defaultValue: translate({ id: 'default.url' }),
              },
            },
          },
          {
            opcode: 'createCube',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.createCube' }),
            arguments: {
              X: { type: ArgumentType.NUMBER, defaultValue: 100 },
              Y: { type: ArgumentType.NUMBER, defaultValue: 100 },
              Z: { type: ArgumentType.NUMBER, defaultValue: 100 },
            },
          },
          {
            opcode: 'createSphere',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.createSphere' }),
            arguments: {
              R: { type: ArgumentType.NUMBER, defaultValue: 50 },
            },
          },
          {
            opcode: 'createCone',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.createCone' }),
            arguments: {
              R: { type: ArgumentType.NUMBER, defaultValue: 50 },
              H: { type: ArgumentType.NUMBER, defaultValue: 100 },
              SEG: { type: ArgumentType.NUMBER, defaultValue: 8 },
            },
          },
          {
            opcode: 'createCylinder',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.createCylinder' }),
            arguments: {
              R: { type: ArgumentType.NUMBER, defaultValue: 50 },
              H: { type: ArgumentType.NUMBER, defaultValue: 100 },
              SEG: { type: ArgumentType.NUMBER, defaultValue: 12 },
            },
          },
          {
            opcode: 'setColor',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.setColor' }),
            arguments: {
              COLOR: {
                type: ArgumentType.COLOR,
                defaultValue: '#4a90d9',
              },
            },
          },
          {
            opcode: 'restoreColor',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.restoreColor' }),
          },
          {
            opcode: 'createPlane',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.createPlane' }),
            arguments: {
              URL: {
                type: ArgumentType.STRING,
                defaultValue: '',
              },
            },
          },

          // ---- 操作 ----
          '---' + translate({ id: 'tag.operation' }),
          {
            opcode: 'setDragRotate',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.setDragRotate' }),
            arguments: {
              MODE: {
                type: ArgumentType.STRING,
                menu: 'DRAG_MENU',
                defaultValue: 'on',
              },
            },
          },
          {
            opcode: 'setModelPositionX',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.setModelPositionX' }),
            arguments: {
              X: {
                type: ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: 'setModelPositionY',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.setModelPositionY' }),
            arguments: {
              Y: {
                type: ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: 'setModelPositionZ',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.setModelPositionZ' }),
            arguments: {
              Z: {
                type: ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: 'changeModelPositionX',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.changeModelPositionX' }),
            arguments: {
              X: {
                type: ArgumentType.NUMBER,
                defaultValue: 0.5,
              },
            },
          },
          {
            opcode: 'changeModelPositionY',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.changeModelPositionY' }),
            arguments: {
              Y: {
                type: ArgumentType.NUMBER,
                defaultValue: 0.5,
              },
            },
          },
          {
            opcode: 'changeModelPositionZ',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.changeModelPositionZ' }),
            arguments: {
              Z: {
                type: ArgumentType.NUMBER,
                defaultValue: 0.5,
              },
            },
          },
          {
            opcode: 'rotateX',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.rotateX' }),
            arguments: {
              ANGLE: {
                type: ArgumentType.NUMBER,
                defaultValue: 15,
              },
            },
          },
          {
            opcode: 'rotateY',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.rotateY' }),
            arguments: {
              ANGLE: {
                type: ArgumentType.NUMBER,
                defaultValue: 15,
              },
            },
          },
          {
            opcode: 'rotateZ',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.rotateZ' }),
            arguments: {
              ANGLE: {
                type: ArgumentType.NUMBER,
                defaultValue: 15,
              },
            },
          },
          {
            opcode: 'setRotationX',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.setRotationX' }),
            arguments: {
              ANGLE: {
                type: ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: 'setRotationY',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.setRotationY' }),
            arguments: {
              ANGLE: {
                type: ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: 'setRotationZ',
            blockType: BlockType.COMMAND,
            text: translate({ id: 'block.setRotationZ' }),
            arguments: {
              ANGLE: {
                type: ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },

          // ---- 取值 ----
          {
            opcode: 'getModelX',
            blockType: BlockType.REPORTER,
            text: translate({ id: 'block.getModelX' }),
          },
          {
            opcode: 'getModelY',
            blockType: BlockType.REPORTER,
            text: translate({ id: 'block.getModelY' }),
          },
          {
            opcode: 'getModelZ',
            blockType: BlockType.REPORTER,
            text: translate({ id: 'block.getModelZ' }),
          },
          {
            opcode: 'getRotationX',
            blockType: BlockType.REPORTER,
            text: translate({ id: 'block.getRotationX' }),
          },
          {
            opcode: 'getRotationY',
            blockType: BlockType.REPORTER,
            text: translate({ id: 'block.getRotationY' }),
          },
          {
            opcode: 'getRotationZ',
            blockType: BlockType.REPORTER,
            text: translate({ id: 'block.getRotationZ' }),
          },
        ],
        menus: {
          DRAG_MENU: [
            {
              text: translate({ id: 'menu.drag.on' }),
              value: 'on',
            },
            {
              text: translate({ id: 'menu.drag.off' }),
              value: 'off',
            },
          ],
        },
      };
    }

    // ---- 积木实现 ----

    async initScene() {
      if (this.sceneMgr.ready) return;
      await this.sceneMgr.init();
    }

    showCanvas() {
      this.sceneMgr.show();
    }

    hideCanvas() {
      this.sceneMgr.hide();
    }

    setCameraZ(args) {
      const z = Cast.toNumber(args.Z);
      this.sceneMgr.setCameraZ(z);
    }

    async loadModel(args) {
      const url = Cast.toString(args.URL);
      if (!this.sceneMgr.ready) {
        await this.sceneMgr.init();
      }
      try {
        await this.sceneMgr.loadModel(url);
      } catch (e) {
        console.error('[3D Scene] loadModel failed:', e);
        alert('加载失败');
      }
    }

    async createCube(args) {
      if (!this.sceneMgr.ready) await this.sceneMgr.init();
      const x = Cast.toNumber(args.X);
      const y = Cast.toNumber(args.Y);
      const z = Cast.toNumber(args.Z);
      this.sceneMgr.createCube(x, y, z);
    }

    async createSphere(args) {
      if (!this.sceneMgr.ready) await this.sceneMgr.init();
      const r = Cast.toNumber(args.R);
      this.sceneMgr.createSphere(r);
    }

    async createCone(args) {
      if (!this.sceneMgr.ready) await this.sceneMgr.init();
      const r = Cast.toNumber(args.R);
      const h = Cast.toNumber(args.H);
      const seg = Cast.toNumber(args.SEG);
      this.sceneMgr.createCone(r, h, seg);
    }

    async createCylinder(args) {
      if (!this.sceneMgr.ready) await this.sceneMgr.init();
      const r = Cast.toNumber(args.R);
      const h = Cast.toNumber(args.H);
      const seg = Cast.toNumber(args.SEG);
      this.sceneMgr.createCylinder(r, h, seg);
    }

    setColor(args) {
      const color = Cast.toString(args.COLOR);
      this.sceneMgr.setColor(color);
    }

    restoreColor() {
      this.sceneMgr.restoreColor();
    }

    async createPlane(args) {
      if (!this.sceneMgr.ready) await this.sceneMgr.init();
      const url = Cast.toString(args.URL);
      try {
        await this.sceneMgr.createPlane(url);
      } catch (e) {
        console.error('[3D Scene] createPlane failed:', e);
        alert('加载失败');
      }
    }

    setDragRotate(args) {
      const mode = Cast.toString(args.MODE);
      this.sceneMgr.setDragRotateMode(mode === 'on');
    }
    setModelPositionX(args) {
      const x = Cast.toNumber(args.X);
      this.sceneMgr.setPositionX(x);
    }
    setModelPositionY(args) {
      const y = Cast.toNumber(args.Y);
      this.sceneMgr.setPositionY(y);
    }
    setModelPositionZ(args) {
      const z = Cast.toNumber(args.Z);
      this.sceneMgr.setPositionZ(z);
    }

    changeModelPositionX(args) {
      const x = Cast.toNumber(args.X);
      this.sceneMgr.changePositionX(x);
    }
    changeModelPositionY(args) {
      const y = Cast.toNumber(args.Y);
      this.sceneMgr.changePositionY(y);
    }
    changeModelPositionZ(args) {
      const z = Cast.toNumber(args.Z);
      this.sceneMgr.changePositionZ(z);
    }

    rotateX(args) {
      const angle = Cast.toNumber(args.ANGLE);
      this.sceneMgr.rotateX(angle);
    }

    rotateY(args) {
      const angle = Cast.toNumber(args.ANGLE);
      this.sceneMgr.rotateY(angle);
    }

    rotateZ(args) {
      const angle = Cast.toNumber(args.ANGLE);
      this.sceneMgr.rotateZ(angle);
    }

    setRotationX(args) {
      const angle = Cast.toNumber(args.ANGLE);
      this.sceneMgr.setRotationX(angle);
    }

    setRotationY(args) {
      const angle = Cast.toNumber(args.ANGLE);
      this.sceneMgr.setRotationY(angle);
    }

    setRotationZ(args) {
      const angle = Cast.toNumber(args.ANGLE);
      this.sceneMgr.setRotationZ(angle);
    }

    getModelX() {
      return this.sceneMgr.getPositionX();
    }
    getModelY() {
      return this.sceneMgr.getPositionY();
    }
    getModelZ() {
      return this.sceneMgr.getPositionZ();
    }

    getRotationX() {
      return this.sceneMgr.getRotationX();
    }

    getRotationY() {
      return this.sceneMgr.getRotationY();
    }

    getRotationZ() {
      return this.sceneMgr.getRotationZ();
    }
  }

  // ------------------------------------------------------------------
  // 注册
  // ------------------------------------------------------------------
  extensions.register(new Gandi3DScene(runtime));
})(Scratch);
