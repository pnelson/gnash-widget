var Gnash = Gnash || (function() {

  function Gnash(id) {
    this.root = document.getElementById(id);
    this.makeCallback();
    this.getGrindStats();
  }

  Gnash.prototype.makeCallback = function() {

    var that = this;

    window.__gnash_pad = this.pad;
    window.__gnash_jsonp = function(data) {

      var stats = data.stats.reverse();
      var updated_at = new Date(data.updated_at).toISOString();

      var info = {
        labels : stats.map(that.date, that),
        datasets : [
          {
            fillColor: 'rgba(200,40,41,0.5)',
            strokeColor: '#c82829',
            pointColor: '#c82829',
            pointStrokeColor: '#fff',
            data: stats.map(that.duration)
          }
        ]
      };

      var options = {
        scaleOverride: true,
        scaleSteps: that.root.getAttribute('data-minutes') || 12,
        scaleStepWidth: 60,
        scaleStartValue: (that.root.getAttribute('data-start') || 40) * 60,
        scaleLabel: '<%= __gnash_pad(Math.floor((value / 60) % 60)) %>:<%= __gnash_pad(Math.floor(value % 60)) %>',
        pointDotRadius: 2,
        pointDotStrokeWidth: 0,
        datasetStrokeWidth: 1
      };

      var canvas = document.createElement('canvas');
      canvas.width = that.root.getAttribute('data-width') || 640;
      canvas.height = that.root.getAttribute('data-height') || 400;
      that.root.setAttribute('data-last-updated', updated_at);
      that.root.appendChild(canvas);

      new Chart(canvas.getContext('2d')).Line(info, options);

    };

  };

  Gnash.prototype.getGrindStats = function() {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://gnash.herokuapp.com/' +
                  this.root.getAttribute('data-user') +
                  '?year=' +
                  this.root.getAttribute('data-year') + 
                  '&callback=__gnash_jsonp';
    head.appendChild(script);
  };

  Gnash.prototype.date = function(stat) {
    var start = new Date(stat.start);
    return start.getFullYear() + '-'
        + this.pad(start.getMonth() + 1) + '-'
        + this.pad(start.getDate());
  };

  Gnash.prototype.duration = function(stat) {
    var start = new Date(stat.start);
    var finish = new Date(stat.finish);
    return (finish - start) / 1000;
  };

  Gnash.prototype.pad = function(n) {
    return n < 10 ? '0' + n : n;
  };

  return new Gnash('gnash-root');

})();
