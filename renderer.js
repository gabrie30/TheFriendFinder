var fs = require('fs');

function renderer(response, view) {
  var path = "./views/" + view + ".html";

  var contents = fs.readFileSync(path, 'utf8');
  response.write(contents);
}

module.exports.renderer = renderer;