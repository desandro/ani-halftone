/*jshint unused: false */

var TAU = Math.PI * 2;
var ROOT_2 = Math.sqrt( 2 );

var img = new Image();
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
var imgData;
var size = 1 / 24; /* proportion of img width */
var zoom;
img.onload = imgLoaded;

var w, h, diag;

window.onload = function() {
  // img.src = 'img/todd1.jpg';
  // img.src = '../boca-raton/img/boca-raton1.jpg';
  // img.src = '../shari/img/shari2.jpg';
  // img.src = '../jungle/img/jungle1.jpg';
  img.src = '../img/me-fri-halo1.jpg';
};

function imgLoaded() {
  w = canvas.width = img.width;
  h = canvas.height = img.height;

  zoom = 1120 / w;

  ctx.drawImage( img, 0, 0 );
  imgData = ctx.getImageData( 0, 0, w, h ).data;

  // apply zoom
  w *= zoom;
  h *= zoom;
  canvas.width = w;
  canvas.height = h;

  render();

  document.body.appendChild( canvas );
}


function render() {

  ctx.fillStyle = 'black';
  ctx.fillRect( 0, 0, w, h );
  var pixelSize = w * size;
  var cols = Math.ceil( w / pixelSize );
  var rows = Math.ceil( h / (pixelSize / 2) );
  var dotColor, squareColor, dotSize;
  var diamondOffset = pixelSize * 0.53;
  for ( var row = 0; row < rows; row++ ) {
    for ( var col = 0; col < cols; col++ ) {
      var x = ( col + 0.5 ) * pixelSize;
      x += row % 2 ? pixelSize / 2 : 0;

      var y = ( row + 0.5 ) * (pixelSize / 2);
      var pixelData = getPixelData( x / zoom, y / zoom );
      var hsl = rgb2hsl( pixelData.red, pixelData.green, pixelData.blue );
      // var hueColor = 'hsl(' + hsl.hue + ',100%,50%)';
      // var sat = ( hsl.sat * 0.5 + 0.5 ) * 100;
      var sat = 100;
      var hue = Math.round( Math.round( hsl.hue / 60 ) * 60);
      var hueColor = 'hsl(' + hsl.hue + ',' + sat + '%,50%)';
      
      if ( hsl.lum < 0.25 ) {
        // color dot on black
        squareColor = 'black';
        dotColor = hueColor;
        dotSize = hsl.lum / 0.25;
      } else if ( hsl.lum < 0.5 ) {
        // black dot on color
        squareColor = hueColor;
        dotColor = 'black';
        dotSize = ( 0.5 - hsl.lum )  / 0.25;
      } else if ( hsl.lum < 0.75 ) {
        // white dot on color
        squareColor = hueColor;
        dotColor = 'white';
        dotSize = ( hsl.lum - 0.5 )  / 0.25;
      } else {
        // color dot on white
        squareColor = 'white';
        dotColor = hueColor;
        dotSize = ( 1 - hsl.lum ) / 0.25;
      }

      dotSize = Math.max( dotSize, 0 );

      // ctx.fillStyle = 'rgb(' + pixelData.red + ',' + pixelData.green + ',' +
      //   pixelData.blue + ')';
      // ctx.fillStyle = 'hsl(' + hsl.hue + ',' + (hsl.sat*100) + '%,' +
      //   (hsl.lum*100) + '%)';
      // square
      ctx.fillStyle = squareColor;
      var rectX = x - pixelSize * 0.5;
      var rectY = y - pixelSize * 0.5;
      ctx.beginPath();
      ctx.moveTo( x, y - diamondOffset );
      ctx.lineTo( x + diamondOffset, y );
      ctx.lineTo( x, y + diamondOffset );
      ctx.lineTo( x - diamondOffset, y );
      ctx.lineTo( x, y - diamondOffset );
      ctx.fill();
      ctx.closePath();
      // ctx.fillRect( rectX, rectY, pixelSize, pixelSize );
      // dot
      var dotRadius = Math.sqrt( (pixelSize * pixelSize) / TAU ) * dotSize * 1 / ROOT_2;
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc( x, y, dotRadius, 0, TAU );
      ctx.fill();
      ctx.closePath();
    }
  }

}

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

// https://github.com/jfsiii/chromath/blob/master/src/chromath.js
function rgb2hsl( r, g, b ) {
  r /= 255;
  g /= 255;
  b /= 255;
  var M = Math.max(r, g, b);
  var m = Math.min(r, g, b);
  var C = M - m;
  var L = 0.5*(M + m);
  var S = (C === 0) ? 0 : C/(1-Math.abs(2*L-1));

  var h;
  if (C === 0) h = 0;
  else if (M === r) h = ((g-b)/C) % 6;
  else if (M === g) h = ((b-r)/C) + 2;
  else if (M === b) h = ((r-g)/C) + 4;

  var H = 60 * h;

  return { hue: H, sat: parseFloat(S), lum: parseFloat(L) };
  
  // } [H, parseFloat(S), parseFloat(L)];
}
