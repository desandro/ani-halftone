/*jshint browser: true, devel: true, unused: true, undef: true */

( function( window ) {

var TAU = Math.PI * 2;
var ROOT_2 = Math.sqrt( 2 );

var img = new Image();
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
var imgData;
var spacing = 22 * 5.5;
var repeatFrames = 8;
var zoom;
img.onload = imgLoaded;

var isAdditive = true;

window.onload = function() {
  img.src = 'img/sub-grad2.jpg';
};

var w, h, diag, renderCanvases;

function imgLoaded() {
  w = canvas.width = img.width;
  h = canvas.height = img.height;

  ctx.drawImage( img, 0, 0 );
  imgData = ctx.getImageData( 0, 0, w, h ).data;

  zoom = 4000 / w;

  // zoom
  w *= zoom;
  h *= zoom;
  canvas.width = w;
  canvas.height = h;
  var side = Math.max( w, h );
  diag = side * ROOT_2;
  ctx.clearRect( 0, 0, w, h );

  //
  renderCanvases = {
    red: getRenderCanvas(),
    green: getRenderCanvas(),
    blue: getRenderCanvas()
  };

  // render each layout
  document.body.appendChild( canvas );
  render();

}

var frame = 0  ;

function render() {
  frame++;
  renderGrid( 1, 'red' );
  renderGrid( 5.5, 'green' );
  renderGrid( 3, 'blue' );
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = isAdditive ? 'black' : 'white';
  ctx.fillRect( 0, 0, w, h );
  ctx.globalCompositeOperation = isAdditive ? 'lighter' : 'darker';
  ctx.drawImage( renderCanvases.red.canvas, 0, 0 );
  ctx.drawImage( renderCanvases.green.canvas, 0, 0 );
  ctx.drawImage( renderCanvases.blue.canvas, 0, 0 );
  // setTimeout( render, 17 );
}

window.render = render;
window.ctx = ctx;

function getRenderCanvas() {
  var renderCanvas = document.createElement('canvas');
  renderCanvas.width = w;
  renderCanvas.height = h;
  return {
    canvas: renderCanvas,
    ctx: renderCanvas.getContext('2d')
  };
}

function renderGrid( angle, color ) {
  var renderCtx = renderCanvases[ color ].ctx;
  renderCtx.fillStyle = isAdditive ? 'black' : 'white';
  renderCtx.fillRect( 0, 0, w, h );
  var cols = Math.ceil( diag / spacing );
  var rows = Math.ceil( diag / spacing );
  var radius = spacing * ROOT_2 / 2;

  switch ( color ) {
    case 'red' :
      renderCtx.fillStyle = isAdditive ? 'rgb(255,0,0)' : 'rgb(0,255,255)';
      break;
    case 'green' :
      renderCtx.fillStyle = isAdditive ? 'rgb(0,255,0)' : 'rgb(255,0,255)';
      break;
    case 'blue' :
      renderCtx.fillStyle = isAdditive ? 'rgb(0,0,255)' : 'rgb(255,255,0)';
      break;
  }

  // var mod = ( frame % repeatFrames ) / repeatFrames || 1;
  for ( var row = 0; row < rows; row++ ) {
    for ( var col = 0; col < cols; col++ ) {
      var x1 = col * spacing + spacing / 2;
      var y1 = row * spacing + spacing / 2;
      // move by x
      x1 += ((frame % repeatFrames) / repeatFrames) * spacing;
      // offset for diagonal
      x1 -= ( diag - w ) / 2;
      y1 -= ( diag - h ) / 2;
      // shift to center
      x1 -= w / 2;
      y1 -= h / 2;
      // rotate grid
      var x2 = x1 * Math.cos( angle ) - y1 * Math.sin( angle );
      var y2 = x1 * Math.sin( angle ) + y1 * Math.cos( angle );
      // shift back
      x2 += w / 2;
      y2 += h / 2;
      if ( x2 > 0 && x2 < w && y2 > 0 && y2 < h ) {
        var x3 = x2 / zoom;
        var y3 = y2 / zoom;
        var pixelData = getPixelData( x3, y3 );
        var colorSize = pixelData[ color ] / 255;
        colorSize = isAdditive ? colorSize : 1 -colorSize;
        circle( renderCtx, x2, y2, colorSize * radius, angle );
        // rect( renderCtx, x2, y2, colorSize * spacing, angle );
      }
    }
  }
}

function circle( ctx, x, y, r ) {
  ctx.beginPath();
  ctx.arc( x, y, r, 0, TAU );
  ctx.fill();
  ctx.closePath();
}

function getPixelData( x, y ) {
  x = Math.round( x );
  y = Math.round( y );
  var pixelIndex = x + y * img.width;
  pixelIndex *= 4;
  return {
    red: imgData[ pixelIndex + 0 ],
    green: imgData[ pixelIndex + 1 ],
    blue: imgData[ pixelIndex + 2 ],
    alpha: imgData[ pixelIndex + 3 ]
  };
}

window.imgData = imgData;
window.getPixelData = getPixelData;

})( window );
