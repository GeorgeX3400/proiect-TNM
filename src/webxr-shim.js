// The Layers API is a performance optimisation for high-end headsets;
// Removing XRWebGLBinding before Three.js loads forces WebXRManager to use the standard XRWebGLLayer fallback path, which works on all WebXR implementations.

;(function () {
  if (typeof XRWebGLBinding !== 'undefined') {
    console.info(
      '[WebXR shim] Removing XRWebGLBinding to force XRWebGLLayer fallback.'
    );
    delete window.XRWebGLBinding;
    if (typeof globalThis !== 'undefined' && globalThis.XRWebGLBinding) {
      delete globalThis.XRWebGLBinding;
    }
  }
})();
