// Generated by CoffeeScript 1.7.1
(function() {
  var depth, easeOutQuart, easing, pageHeight, pageWidth, parallaxWidth, planes, prevX, resize, tiltHeight, tiltWidth, transformKey, update, updatePlane,
    __hasProp = {}.hasOwnProperty;

  easeOutQuart = function(d) {
    return function(t) {
      return -(Math.pow(t / d - 1, 4) - 1);
    };
  };

  easing = easeOutQuart(1.8);

  depth = 1000;

  tiltWidth = 200;

  tiltHeight = 0;

  planes = {
    contact: {
      z: +500,
      offset: -tiltWidth,
      align: 'left'
    },
    projects: {
      z: +500,
      offset: -tiltWidth,
      align: 'right'
    },
    content: {
      z: 0
    },
    background: {
      z: -1500,
      cover: true
    }
  };

  transformKey = 'transform';

  pageWidth = void 0;

  pageHeight = void 0;

  parallaxWidth = void 0;

  if (document.body.style.webkitTransform != null) {
    transformKey = 'webkitTransform';
  }

  if (transformKey === 'webkitTransform' || transformKey === 'oTransform') {
    planes.contact.rescale = true;
    planes.projects.rescale = true;
  }

  resize = function() {
    var name, offset, plane, ratio, _results;
    pageWidth = $('body').outerWidth();
    pageHeight = $('body').outerHeight();
    parallaxWidth = pageWidth * 0.6;
    _results = [];
    for (name in planes) {
      if (!__hasProp.call(planes, name)) continue;
      plane = planes[name];
      if (plane.el == null) {
        plane.el = document.querySelector('.' + name);
      }
      ratio = 1.0 - plane.z / depth;
      if (plane.cover != null) {
        plane.el.style.width = (pageWidth * ratio + 2 * tiltWidth) + 'px';
        plane.el.style.height = (pageHeight * ratio + 2 * tiltHeight) + 'px';
        plane.el.style.left = pageWidth * (1.0 - ratio) / 2 - tiltWidth + 'px';
        plane.el.style.top = pageHeight * (1.0 - ratio) / 2 - tiltHeight + 'px';
      }
      if (plane.align != null) {
        if (plane.rescale) {
          offset = plane.offset + pageWidth * plane.z / depth / 2;
          plane.el.style[transformKey + 'Origin'] = plane.align;
        }
        _results.push(plane.el.style[plane.align] = (offset != null ? offset : plane.offset) + 'px');
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  update = function(x) {
    var name, plane, _results;
    _results = [];
    for (name in planes) {
      if (!__hasProp.call(planes, name)) continue;
      plane = planes[name];
      _results.push(updatePlane(name, plane, x));
    }
    return _results;
  };

  updatePlane = function(name, plane, x) {
    var transform, xt, _ref, _ref1, _ref2;
    xt = tiltWidth * Math.min(+1.0, Math.max(-1.0, (x != null ? x : prevX) / parallaxWidth * 2));
    if (plane.el == null) {
      plane.el = document.querySelector('.' + name);
    }
    transform = 'translate3d(' + Math.floor(((_ref = plane.x) != null ? _ref : 0) - xt) + 'px, ' + Math.floor((_ref1 = plane.y) != null ? _ref1 : 0) + 'px, ' + Math.floor((_ref2 = plane.z) != null ? _ref2 : 0) + 'px)';
    if (plane.rescale != null) {
      transform += ' scale(' + (1.0 - plane.z / depth) + ')';
    }
    if (plane.transform != null) {
      transform += ' ' + plane.transform;
    }
    return plane.el.style[transformKey] = transform;
  };

  prevX = void 0;

  $(document).mousemove(function(event) {
    var x;
    x = event.pageX - pageWidth / 2;
    if (x !== prevX) {
      update(x);
    }
    return prevX = x;
  });

  $(document).resize(resize);

  resize();

  update(0);


  /* KONAMI CODE */

  $.fn.konami = function(callback) {
    var code, numKeys;
    code = ",38,38,40,40,37,39,37,39,66,65$";
    numKeys = code.split(',').length;
    return this.each(function() {
      var kkeys;
      kkeys = [''];
      return $(this).keydown(function(e) {
        kkeys = kkeys.slice(Math.max(0, kkeys.length - numKeys));
        kkeys.push(e.keyCode);
        if ((kkeys.toString() + '$').indexOf(code) >= 0) {
          $(this).unbind('keydown', arguments.callee);
          return callback();
        }
      });
    });
  };

  $(document).konami(function() {
    var banana, bananas, pixelsPerMeter, simulate, t0;
    pixelsPerMeter = Math.sqrt(72);
    bananas = [];
    banana = function() {
      var plane;
      plane = {
        el: document.createElement('img'),
        transform: 'scale(0.25)',
        x: Math.random() * (pageWidth + 2 * tiltWidth) - tiltWidth,
        y: Math.random() * (pageHeight + 2 * tiltHeight) - tiltHeight - pageHeight,
        z: planes.background.z * (1 - Math.random()),
        dx: 50 * (Math.random() - 1),
        dy: 50 * (Math.random() - 1),
        dz: 50 * (Math.random() - 1),
        ddy: 9.82 * pixelsPerMeter,
        ddx: 0,
        ddz: 0
      };
      plane.el.style.position = 'absolute';
      plane.el.style.left = '0';
      plane.el.style.top = '0';
      plane.el.src = 'img/banan.png';
      document.body.appendChild(plane.el);
      planes['banana' + bananas.length] = plane;
      bananas.push(plane);
      updatePlane('banana', plane);
      bananas = bananas.filter(function(plane, i) {
        if (plane.y < 2 * pageHeight) {
          return true;
        }
        plane.el.parentNode.removeChild(plane.el);
        delete planes['banana' + i];
        return false;
      });
      return plane;
    };
    setInterval(banana, 10 / 1e3);
    banana();
    t0 = Number(new Date()) / 1e3;
    simulate = function() {
      var i, plane, t;
      t = Number(new Date()) / 1e3 - t0;
      t0 += t;
      for (i in bananas) {
        if (!__hasProp.call(bananas, i)) continue;
        plane = bananas[i];
        plane.x += t * (plane.dx + plane.ddx * t / 2);
        plane.y += t * (plane.dy + plane.ddy * t / 2);
        plane.z += t * (plane.dz + plane.ddz * t / 2);
        plane.dx += t * plane.ddx;
        plane.dy += t * plane.ddy;
        plane.dz += t * plane.ddz;
        updatePlane('banana', plane);
      }
      return requestAnimationFrame(simulate);
    };
    return simulate();
  });

}).call(this);
