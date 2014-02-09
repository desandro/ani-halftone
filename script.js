/*jshint browser: true, devel: true, unused: true, undef: true */

( function( window ) {

var TAU = Math.PI * 2;
var ROOT_2 = Math.sqrt( 2 );

var img = new Image();
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
var imgData;
var spacing = 15;
var zoom = 2;
img.onload = imgLoaded;

window.onload = function() {
  img.src = 'portrait2.jpg';
};


var w, h, diag;

function imgLoaded() {
  w = canvas.width = img.width;
  h = canvas.height = img.height;

  ctx.drawImage( img, 0, 0 );
  imgData = ctx.getImageData( 0, 0, w, h ).data;

  // zoom
  w *= zoom;
  h *= zoom;
  canvas.width = w;
  canvas.height = h;
  var side = Math.max( w, h );
  diag = side * ROOT_2;
  ctx.clearRect( 0, 0, w, h );
  // render each layout
  var layers = {
    red: renderGrid( 1, 'red' ),
    green: renderGrid( 2, 'green' ),
    blue: renderGrid( 3, 'blue' )
  };
  ctx.fillStyle = 'black';
  ctx.fillRect( 0, 0, w, h );
  ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage( layers.red, 0, 0 );
  ctx.drawImage( layers.green, 0, 0 );
  ctx.drawImage( layers.blue, 0, 0 );
  document.body.appendChild( canvas );
}


function renderGrid( angle, color ) {
  var renderCanvas = document.createElement('canvas');
  renderCanvas.width = w;
  renderCanvas.height = h;
  var renderCtx = renderCanvas.getContext('2d');
  // renderCtx.fillStyle = 'black';
  // renderCtx.fillRect( 0, 0, w, h );
  var cols = Math.ceil( diag / spacing );
  var rows = Math.ceil( diag / spacing );
  var radius = spacing * ROOT_2 / 2;
  
  switch ( color ) {
    case 'red' :
      renderCtx.fillStyle = 'rgb(255,0,0)';
      break;
    case 'green' :
      renderCtx.fillStyle = 'rgb(0,255,0)';
      break;
    case 'blue' :
      renderCtx.fillStyle = 'rgb(0,0,255)';
      break;
  }
  
  for ( var row = 0; row < rows; row++ ) {
    for ( var col = 0; col < cols; col++ ) {
      var x1 = col * spacing + spacing / 2;
      var y1 = row * spacing + spacing / 2;
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
        circle( renderCtx, x2, y2, colorSize * radius );
        // rect( renderCtx, x2, y2, colorSize * spacing, angle );
      }
    }
  }
  return renderCanvas;
}

function circle( ctx, x, y, r ) {
  ctx.beginPath();
  ctx.arc( x, y, r, 0, TAU );
  ctx.fill();
  ctx.closePath();
}

function rect( ctx, x, y, size, angle ) {
  ctx.save();
  ctx.translate( x, y );
  ctx.rotate( angle );
  ctx.fillRect( -size, -size, size, size );
  ctx.restore();
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
