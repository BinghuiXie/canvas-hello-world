/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/js/canvas.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/js/canvas.js":
/*!**************************!*\
  !*** ./src/js/canvas.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var THRESHOLD = 50;
var INIT_HEIGHT_RATE = 0.5;
var POINT_INTERVAL = 5; /* 组成水面的点之间的距离 */
var MAX_INTERVAL_COUNT = 50;
var ACCELARATION_RATE = 0.01;
var SPRING_CONSTANT = 0.03;
var SPRING_FRICTION = 0.9;
var WAVE_SPREAD = 0.3;
var FRICTION_LOSS = 0.75;
var WATER_FRICTION_LOSS = 0.99;
var CRASH_LOSS = 0.9;
var INIT_LETTER_VERTICAL_POSITION = -100;
var WATER_DENSITY = 10; /* 水的密度 */
var GRAVITATIONAL_ACCELERATION = 9.8; /* 重力加速度 */
var WATER_INIT_SPEED = 1; /* 落入水面后的初始速度 */
var UNDER_WATER_GRAVITY = 0.4;
var GRAVITY = 1;

var _window = void 0,
    _canvas = void 0,
    c = void 0,
    _width = void 0,
    _height = void 0,
    points = void 0,
    letters = "HEELOWORLD",
    pointInterval = void 0,
    previousAxis = void 0,
    letterList = [],
    letters_interval = 0,
    _button = void 0;

function init() {
  initDependencies();
  setup();
  bindEventListeners();
  animate();
  initLetters();
}
function createSurface() {
  c.fillStyle = 'rgba(0, 0, 0, 1)';
  c.beginPath();
  c.moveTo(0, _height);

  for (var i = 0; i < points.length; i++) {
    points[i].renderPoint();
  }
  c.lineTo(_width, _height);
  c.closePath();
  c.fill();
}
function setup() {
  points = [];
  letterList = [];
  pointInterval = MAX_INTERVAL_COUNT;

  createSurfacePoints();
}
function initDependencies() {
  _window = window;
  _canvas = document.querySelector("canvas");
  _button = document.querySelector("button");
  c = _canvas.getContext("2d");
  _width = _window.innerWidth;
  _height = _window.innerHeight;
  points = [];
  letters_interval = _width / letters.length;

  _canvas.width = _width;
  _canvas.height = _height;
}
function handleWindowResize() {
  _canvas.width = _window.innerWidth;
  _canvas.height = _window.innerHeight;

  init();
}

function getAxis(event) {
  return {
    x: event.clientX,
    y: event.clientY
  };
}
function handleMouseMove(event) {

  var axis = getAxis(event);
  if (!previousAxis) {
    previousAxis = axis;
  }
  var index = Math.round(axis.x / letters_interval);
  getCurrentPoint(axis.x, axis.y, axis.y - previousAxis.y);

  var waterVelocity = axis.x - previousAxis.x;
  var letterVelocity = (axis.y - previousAxis.y) * WAVE_SPREAD;
  letterList.forEach(function (v, i) {
    i === index && axis.y > _height / 2 - THRESHOLD && axis.y < _height / 2 + THRESHOLD && v.updateWithManual(waterVelocity, letterVelocity);
  });

  previousAxis = axis;
}
function getCurrentPoint(x, y, velocityY) {
  if (y < _height / 2 - THRESHOLD || y > _height / 2 + THRESHOLD) {
    return;
  }
  var index = Math.round(x / pointInterval);

  points[index].update(y, velocityY);
}
function handleMouseEnter(event) {
  previousAxis = getAxis(event);
}
function handleReduceDensity() {
  letterList.forEach(function (item) {
    item.reduceDensity();
  });
}
function bindEventListeners() {
  _window.addEventListener("resize", handleWindowResize);
  _window.addEventListener("mouseenter", handleMouseEnter);
  _window.addEventListener("mousemove", handleMouseMove);
  _button.addEventListener("click", handleReduceDensity);
}
function createSurfacePoints() {
  var pointsNum = Math.round(_width / POINT_INTERVAL);
  /* 点与点之间的实际的距离（要除以点的数量 - 1 才可以） */
  pointInterval = _width / (pointsNum - 1);
  points.push(new Surface(0));

  for (var i = 1; i < pointsNum; i++) {
    /* i * pointInterval 是每一个点的横坐标 */
    var point = new Surface(i * pointInterval);
    /* 记录当前点前面的一个点 */
    var previousPoint = points[i - 1];

    point.setPreviousPoint(previousPoint);
    previousPoint.setNextPoint(point);

    points.push(point);
  }
}
function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, _width, _height);

  controlStatus();
  createSurface();

  c.globalCompositeOperation = 'xor';

  if (letterList.length) {
    letterList.forEach(function (letter) {
      letter.update(false);
    });
  }
}
function controlStatus() {
  for (var i = 0, count = points.length; i < count; i++) {
    points[i].updateSelf();
  }
  for (var _i = 0, _count = points.length; _i < _count; _i++) {
    points[_i].updateNeighbors();
  }
}
var Surface = function Surface(pointX) {
  this.x = pointX;
  this.initHeight = _height / 2;
  this.height = this.initHeight;
  this.fy = 0;
  this.force = { previous: 0, next: 0 };
  this.previousPoint = null;
  this.nextPoint = null;
};

Surface.prototype = {
  setPreviousPoint: function setPreviousPoint(previousPoint) {
    this.previousPoint = previousPoint;
  },
  setNextPoint: function setNextPoint(nextPoint) {
    this.nextPoint = nextPoint;
  },
  renderPoint: function renderPoint() {
    if (this.previousPoint) {
      this.previousPoint.height += this.force.previous;
      this.previousPoint.fy += this.force.previous;
    }
    if (this.nextPoint) {
      this.nextPoint.height += this.force.next;
      this.nextPoint.fy += this.force.next;
    }
    c.lineTo(this.x, _height - this.height);
  },
  update: function update(y, velocityY) {
    this.fy = _height * ACCELARATION_RATE * (_height - this.height - y >= 0 ? -1 : 1) * Math.abs(velocityY);
  },
  updateSelf: function updateSelf() {
    this.fy += SPRING_CONSTANT * (this.initHeight - this.height); /* 弹簧弹出的长度  */
    this.fy = this.fy * SPRING_FRICTION; /* 受摩擦力的影响，每次弹出的距离在减小 */
    this.height += this.fy;
  },
  updateNeighbors: function updateNeighbors() {
    if (this.previousPoint) {
      this.force.previous = WAVE_SPREAD * (this.height - this.previousPoint.height);
    }
    if (this.nextPoint) {
      this.force.next = WAVE_SPREAD * (this.height - this.nextPoint.height);
    }
  }
};

function initLetters() {
  for (var i = 0; i < letters.length; i++) {
    letterList.push(new Letter(i, letters[i]));
  }
}
var Letter = function Letter(index, text) {
  this.index = index;
  this.text = text;
  this.interval = _width / letters.length;
  this.range = {
    left: this.index * this.interval,
    right: (this.index + 1) * this.interval
  };
  this.y = INIT_LETTER_VERTICAL_POSITION;
  this.x = this.index * this.interval + this.interval / 2;
  this.size = {
    width: c.measureText(this.text).width,
    height: c.measureText(this.text).width
  };
  this.density = this.generateRandomDecimal(WATER_DENSITY - 1, WATER_DENSITY + 1);
  this.volume = this.size.width * this.size.height;
  this.volumeUnderwater = 0;
  this.quality = this.density * this.volume;
  this.gravityForce = this.quality * GRAVITATIONAL_ACCELERATION;
  this.buoyancy = 0;
  this.velocity = {
    x: this.generateRandom(-3, 3),
    y: this.generateRandom(1, 8) * this.density
  };
};
Letter.prototype = {
  createLetters: function createLetters() {
    c.save();
    c.beginPath();
    c.font = "bold 60px 微软雅黑";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = 'rgba(0 ,0 ,0 ,1)';
    c.fillText(this.text, this.x, this.y);
    c.closePath();
    c.restore();
  },
  generateRandom: function generateRandom(min, max) {
    return min + Math.floor(Math.random() * max);
  },
  generateRandomDecimal: function generateRandomDecimal(min, max) {
    return min + Math.random() * (max - min + 1);
  },
  update: function update() {
    this.createLetters();
    this.y += this.velocity.y;
    this.x += this.velocity.x;

    if (this.y > _height / 2) {
      /* 到了水面以下， 浸没 */
      this.volumeUnderwater = this.volume;
      this.buoyancy = WATER_DENSITY * this.volumeUnderwater * GRAVITATIONAL_ACCELERATION;
    } else if (this.y + this.size.height / 2 < _height / 2 && this.y - this.size.height / 2 > _height / 2) {
      /* 浸入水面但还没有浸没 */
      var underWaterHeight = this.y + this.size.height - _height / 2;
      this.volumeUnderwater = this.size.width * underWaterHeight;
      this.buoyancy = WATER_DENSITY * this.volumeUnderwater * GRAVITATIONAL_ACCELERATION;
    } else {
      /* 在水面上 */
      this.buoyancy = 0;
      this.volumeUnderwater = 0;
    }

    if (this.buoyancy) {
      /* 和水面接触以后 */
      getCurrentPoint(this.x, this.y, this.velocity.y + this.velocity.x * WAVE_SPREAD);
      this.velocity.x *= WATER_FRICTION_LOSS;
      if (this.density < WATER_DENSITY) {
        /* 物体密度小于水的密度, 上浮 */
        this.velocity.y = -(WATER_DENSITY - this.density) * GRAVITATIONAL_ACCELERATION;
        if (this.y - this.size.height < _height / 2) {
          this.velocity.y = 0;
          this.velocity.x = 0;
        }
      } else if (this.density > WATER_DENSITY) {
        /* 物体密度大于水的密度，下沉 */
        this.velocity.y = WATER_INIT_SPEED;
        this.velocity.y += UNDER_WATER_GRAVITY;
        if (this.y + this.velocity.y + this.size.height > _height) {
          /* 沉底 */
          this.y = _height - this.size.height;
          this.velocity.x *= FRICTION_LOSS;
        }
      } else {
        /* 悬浮或者漂浮 */
        this.velocity.y = 0;
      }
    } else {
      /* 在空中 */
      this.velocity.y += GRAVITY;
    }

    if (this.x + this.velocity.x + this.size.width > this.range.right || this.x - this.size.width + this.velocity.x < this.range.left) {
      this.velocity.y *= CRASH_LOSS;
      this.velocity.x = -this.velocity.x * FRICTION_LOSS;
    }
  },
  updateWithManual: function updateWithManual(waterVelocity, letterVelocity) {
    this.velocity.x = waterVelocity * WAVE_SPREAD;
    if (letterVelocity < 0) {
      this.velocity.y = letterVelocity / GRAVITATIONAL_ACCELERATION;
    } else {
      this.velocity.y = letterVelocity * this.density / GRAVITATIONAL_ACCELERATION;
    }
    console.log(this.velocity);
  },
  reduceDensity: function reduceDensity() {
    this.density -= 0.5;
  }
};

init();

/***/ })

/******/ });
//# sourceMappingURL=canvas.bundle.js.map