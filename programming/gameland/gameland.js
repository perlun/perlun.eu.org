// gameland.js - loads the WebAssembly binary and sets up the system for
// running the demo.
//
// Heavily inspired by https://www.hellorust.com/demos/feistel/index.html

fetch('gameland.wasm', { cache: 'no-cache' }).then(response =>
  response.arrayBuffer()
).then(bytes =>
  WebAssembly.instantiate(bytes, {})
).then(results => {
  let module = {};
  let mod = results.instance;
  module.alloc   = mod.exports.alloc;
  module.dealloc = mod.exports.dealloc;
  module.fill    = mod.exports.fill;
  module.clear   = mod.exports.clear;

  var width  = 320;
  var height = 200;

  mod.exports.prepare();

  let byteSize = width * height * 4;
  var pointer = module.alloc(byteSize);
  var buffer = new Uint8Array(mod.exports.memory.buffer, pointer, byteSize);

  var button = document.getElementById('run-wasm');
  var canvas = document.getElementById('screen');

  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    var pointer = module.alloc(byteSize);

    var usub = new Uint8ClampedArray(mod.exports.memory.buffer, pointer, byteSize);
    var img = new ImageData(usub, width, height);
    var running = false;

    var frame = 0;
    var running = false;

    function step(timestamp) {
      if (!running) return;

      frame = module.fill(pointer, width, height, frame);
      ctx.putImageData(img, 0, 0)

      if (frame != 65536) {
        window.requestAnimationFrame(step);
      } else {
        button.innerText = 'Restart';
        running = false;
      }
    }

    function clearCanvasAndRestart() {
      var elem = document.getElementById('screen');
      elem.style.display = 'block';

      running = false;
      window.requestAnimationFrame(function() {
        ctx.clearRect(0, 0, width, height);
        module.clear(pointer, width, height);
        frame = 0;
        running = true;
        window.requestAnimationFrame(step);
      });
    }

    function stopDemo() {
      var elem = document.getElementById('screen');
      elem.style.display = 'none';

      running = false;
      window.module.stop();
    }

    function fullscreenChanged() {
      if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
        stopDemo();

        document.removeEventListener('webkitfullscreenchange', fullscreenChanged, false);
        document.removeEventListener('mozfullscreenchange', fullscreenChanged, false);
        document.removeEventListener('fullscreenchange', fullscreenChanged, false);
        document.removeEventListener('MSFullscreenChange', fullscreenChanged, false);
      }
      else {
        clearCanvasAndRestart();
        window.module.play();
      }
    }

    // Imperative code starts here.
    button.addEventListener('click', function(e) {
      if (running) {
        stopDemo();
      } else {
        // FIXME: use fscreen instead of this mess.
        document.addEventListener('webkitfullscreenchange', fullscreenChanged, false);
        document.addEventListener('mozfullscreenchange', fullscreenChanged, false);
        document.addEventListener('fullscreenchange', fullscreenChanged, false);
        document.addEventListener('MSFullscreenChange', fullscreenChanged, false);

        var elem = document.getElementById('screen');

        if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        }
        else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        }
      }
    });

    window.module = new Modplayer();
    window.module.setrepeat(true);
    window.module.onReady = () => {
      document.getElementById('run-wasm').disabled = false;
    }
    window.module.load('music.mod');
  }
});
