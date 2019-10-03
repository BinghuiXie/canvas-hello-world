const  THRESHOLD                                =         50;
const  INIT_HEIGHT_RATE                         =         0.5;
const  POINT_INTERVAL                           =         5;                      /* 组成水面的点之间的距离 */
const  MAX_INTERVAL_COUNT                       =         50;
const  ACCELARATION_RATE                        =         0.01;
const  SPRING_CONSTANT                          =         0.03;
const  SPRING_FRICTION                          =         0.9;
const  WAVE_SPREAD                              =         0.3;
const  FRICTION_LOSS                            =         0.75;
const  WATER_FRICTION_LOSS                      =         0.99;
const  CRASH_LOSS                               =         0.9;
const  INIT_LETTER_VERTICAL_POSITION            =         -100;
const  WATER_DENSITY                            =         10;                     /* 水的密度 */
const  GRAVITATIONAL_ACCELERATION               =         9.8;                    /* 重力加速度 */
const  WATER_INIT_SPEED                         =         1;                      /* 落入水面后的初始速度 */
const  UNDER_WATER_GRAVITY                      =         0.4;
const  GRAVITY                                  =         1;

let
  _window,
  _canvas,
  c,
  _width,
  _height,
  points,
  letters = "HEELOWORLD",
  pointInterval,
  previousAxis,
  letterList = [],
  letters_interval = 0,
  _button;

function init () {
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
  
  for (let i = 0; i < points.length; i++) {
    points[i].renderPoint();
  }
  c.lineTo(_width, _height);
  c.closePath();
  c.fill();
}
function setup () {
  points = [];
  letterList = [];
  pointInterval = MAX_INTERVAL_COUNT;
  
  createSurfacePoints();
}
function initDependencies () {
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
function handleWindowResize () {
  _canvas.width = _window.innerWidth;
  _canvas.height = _window.innerHeight;
  
  init();
}

function getAxis(event) {
  return {
    x: event.clientX,
    y: event.clientY
  }
}
function handleMouseMove (event) {
  
  let axis = getAxis(event);
  if (!previousAxis) {
    previousAxis = axis
  }
  const index = Math.round(axis.x / letters_interval);
  getCurrentPoint(axis.x, axis.y, axis.y - previousAxis.y);
  
  const waterVelocity = axis.x - previousAxis.x;
  const letterVelocity = (axis.y - previousAxis.y) * WAVE_SPREAD;
  letterList.forEach((v, i) => {
    i === index
    && axis.y > _height / 2 - THRESHOLD
    && axis.y < _height / 2 + THRESHOLD
    && v.updateWithManual(waterVelocity, letterVelocity);
  });
  
  previousAxis = axis;
}
function getCurrentPoint(x, y, velocityY) {
  if(y < _height / 2 - THRESHOLD || y > _height / 2 + THRESHOLD){
    return;
  }
  const index = Math.round(x / pointInterval);
  
  points[index].update(y, velocityY)
}
function handleMouseEnter (event) {
  previousAxis = getAxis(event);
}
function handleReduceDensity () {
  letterList.forEach(item => {
    item.reduceDensity();
  })
}
function bindEventListeners () {
  _window.addEventListener("resize", handleWindowResize);
  _window.addEventListener("mouseenter", handleMouseEnter);
  _window.addEventListener("mousemove", handleMouseMove);
  _button.addEventListener("click", handleReduceDensity)
}
function createSurfacePoints () {
  const pointsNum = Math.round(_width / POINT_INTERVAL);
  /* 点与点之间的实际的距离（要除以点的数量 - 1 才可以） */
  pointInterval = _width / ( pointsNum - 1 );
  points.push(new Surface(0));
  
  for (let i = 1; i < pointsNum; i++) {
    /* i * pointInterval 是每一个点的横坐标 */
    const point = new Surface(i * pointInterval);
    /* 记录当前点前面的一个点 */
    const previousPoint = points[i - 1];
    
    point.setPreviousPoint(previousPoint);
    previousPoint.setNextPoint(point);
    
    points.push(point);
  }
}
function animate () {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, _width, _height);
  
  controlStatus ();
  createSurface();
  
  c.globalCompositeOperation = 'xor';
  
  if (letterList.length) {
    letterList.forEach(letter => {
      letter.update( false );
    })
  }
}
function controlStatus () {
  for(let i = 0, count = points.length; i < count; i++){
    points[i].updateSelf();
  }
  for(let i = 0, count = points.length; i < count; i++){
    points[i].updateNeighbors();
  }
}
let Surface = function (pointX) {
  this.x = pointX;
  this.initHeight = _height / 2;
  this.height = this.initHeight;
  this.fy = 0;
  this.force = {previous : 0, next : 0};
  this.previousPoint = null;
  this.nextPoint = null;
};

Surface.prototype = {
  setPreviousPoint (previousPoint) {
    this.previousPoint = previousPoint
  },
  setNextPoint (nextPoint) {
    this.nextPoint = nextPoint
  },
  renderPoint () {
    if(this.previousPoint){
      this.previousPoint.height += this.force.previous;
      this.previousPoint.fy += this.force.previous;
    }
    if(this.nextPoint){
      this.nextPoint.height += this.force.next;
      this.nextPoint.fy += this.force.next;
    }
    c.lineTo(this.x, _height - this.height)
  },
  update (y, velocityY) {
    this.fy = _height * ACCELARATION_RATE * ((_height - this.height - y) >= 0 ? -1 : 1) * Math.abs(velocityY);
  },
  updateSelf () {
    this.fy += SPRING_CONSTANT * (this.initHeight - this.height); /* 弹簧弹出的长度  */
    this.fy = this.fy * SPRING_FRICTION; /* 受摩擦力的影响，每次弹出的距离在减小 */
    this.height += this.fy;
  },
  updateNeighbors () {
    if(this.previousPoint){
      this.force.previous = WAVE_SPREAD * (this.height - this.previousPoint.height);
    }
    if(this.nextPoint){
      this.force.next = WAVE_SPREAD * (this.height - this.nextPoint.height);
    }
  }
};


function initLetters () {
  for (let i = 0; i < letters.length; i++) {
    letterList.push(new Letter(i, letters[i]))
  }
}
let Letter = function (index, text) {
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
  createLetters () {
    c.save();
    c.beginPath();
    c.font = "bold 60px 微软雅黑";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = 'rgba(0 ,0 ,0 ,1)';
    c.fillText(this.text, this.x, this.y);
    c.closePath();
    c.restore()
  },
  generateRandom (min, max) {
    return min + Math.floor(Math.random() * max)
  },
  generateRandomDecimal (min, max) {
    return min + Math.random() * (max - min + 1)
  },
  update () {
    this.createLetters();
    this.y += this.velocity.y;
    this.x += this.velocity.x;
    
    if (this.y > _height / 2) {
      /* 到了水面以下， 浸没 */
      this.volumeUnderwater = this.volume;
      this.buoyancy = WATER_DENSITY * this.volumeUnderwater * GRAVITATIONAL_ACCELERATION;
    } else if (
      this.y + this.size.height / 2 < _height / 2
      && this.y - this.size.height / 2 > _height / 2) {
      /* 浸入水面但还没有浸没 */
      const underWaterHeight = this.y + this.size.height - _height / 2;
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
    
    if (
      this.x + this.velocity.x + this.size.width > this.range.right
      || this.x - this.size.width + this.velocity.x < this.range.left
    ) {
      this.velocity.y *= CRASH_LOSS;
      this.velocity.x = -this.velocity.x * FRICTION_LOSS;
    }
  },
  updateWithManual (waterVelocity, letterVelocity) {
    this.velocity.x = waterVelocity * WAVE_SPREAD;
    if (letterVelocity < 0) {
      this.velocity.y = letterVelocity / GRAVITATIONAL_ACCELERATION
    } else {
      this.velocity.y = letterVelocity * (this.density) / GRAVITATIONAL_ACCELERATION
    }
    console.log(this.velocity);
  },
  reduceDensity () {
    this.density -= 0.5;
  }
};


init();