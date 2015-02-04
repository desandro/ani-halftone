/*jshint browser: true, devel: true, unused: true, undef: true */

( function( window ) {

var TAU = Math.PI * 2;
var ROOT_2 = Math.sqrt( 2 );

var img = new Image();
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
var imgData;
var zoom;
img.onload = imgLoaded;

var isAdditive = true;

var repeatFrames = 12;

window.onload = function() {
  img.src = '../img/bands6.jpg';
};

var w, h, diag, renderCanvases;

function imgLoaded() {
  w = canvas.width = img.width;
  h = canvas.height = img.height;


  ctx.drawImage( img, 0, 0 );
  imgData = ctx.getImageData( 0, 0, w, h ).data;

  zoom = 540 / w;

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

  var cm = w / 100;

  renderGrid( TAU / 4, 'red', 3 * cm, 'circle' );
  renderGrid( 0, 'green', 5 * cm, 'circle' );
  renderGrid( 4, 'blue', 3 * cm, 'circle' );

  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = isAdditive ? 'black' : 'white';
  ctx.fillRect( 0, 0, w, h );
  ctx.globalCompositeOperation = isAdditive ? 'lighter' : 'darker';
  ctx.drawImage( renderCanvases.red.canvas, 0, 0 );
  ctx.drawImage( renderCanvases.green.canvas, 0, 0 );
  ctx.drawImage( renderCanvases.blue.canvas, 0, 0 );
  setTimeout( render, 17 );
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

function renderGrid( angle, color, spacing, shape ) {
  var renderCtx = renderCanvases[ color ].ctx;
  renderCtx.fillStyle = isAdditive ? 'black' : 'white';
  renderCtx.fillRect( 0, 0, w, h );
  var cols = Math.ceil( diag / spacing );
  var rows = Math.ceil( diag / spacing );

  switch ( color ) {
    case 'red' :
      renderCtx.fillStyle = isAdditive ? 'rgb(255,0,0)' : 'rgb(0,255,255)';
      break;
    case 'green' :
      renderCtx.fillStyle = isAdditive ? 'rgb(0,255,0)' : 'rgb(255,0,255)';
      break;
    case 'blue' :
      renderCtx.fillStyle = isAdditive ? 'rgb(0,0,255)' : 'rgb(255,550,0)';
      break;
  }

  var renderShape = shapeRenders[ shape ];

  // var mod = ( frame % repeatFrames ) / repeatFrames || 1;
  for ( var row = 0; row < rows; row++ ) {
    for ( var col = 0; col < cols; col++ ) {
      if ( (color == 'red' ) && row % 2 ) {
        // continue
      }
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
      if ( x2 > -spacing && x2 < w + spacing && y2 > -spacing && y2 < h + spacing ) {
        var x3 = x2 / zoom;
        var y3 = y2 / zoom;
        var pixelData = getPixelData( x3, y3 );
        var colorSize = pixelData[ color ] / 255;
        colorSize = isAdditive ? colorSize : 1 -colorSize;
        // render dot
        var size = colorSize * spacing;
        // size *= color == 'green' ? 0.66 : 1;
        renderShape( renderCtx, x2, y2, size, angle, spacing );

      }
    }
  }
}

// hash of functions that render the shape
var shapeRenders = {

  circle: function( ctx, x, y, size ) {
    size *= ROOT_2 / 2;
    ctx.beginPath();
    ctx.arc( x, y, size, 0, TAU );
    ctx.fill();
    ctx.closePath();
  },
  
  line: function( ctx, x, y, size, angle, spacing ) {
    ctx.save();
    ctx.translate( x, y );
    ctx.rotate( angle );
    ctx.fillRect( -spacing, -size / 2, spacing+1, size  );
    ctx.restore();
  },

  square: function( ctx, x, y, size, angle ) {
    ctx.save();
    ctx.translate( x, y );
    ctx.rotate( angle );
    ctx.fillRect( -size / 2, -size / 2, size, size );
    ctx.restore();
  }

};

function getPixelData( x, y ) {
  x = Math.round( x );
  y = Math.round( y );
  x = Math.max( 0, Math.min( img.width, x ) );
  y = Math.max( 0, Math.min( img.height, y ) );
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
