
/**
 * Module dependencies.
 */

var uid2 = require('uid2');

var gEmitter = require("./global-emitter");
var Adapter = require('socket.io-adapter');
var Emitter = require('events').EventEmitter;
var debug = require('debug')('socket.io-cluster');

/**
 * Module exports.
 */

module.exports = adapter;

/**
 * Returns a Cluster Adapter class.
 *
 * @param {String} optional, Cluster uri
 * @return {ClusterAdapter} adapter
 * @api public
 */

function adapter(gEmitter, opts){
  opts = opts || {};

  // opts
  var prefix = opts.key || 'socket.io';

  // this server's key
  var uid = uid2(6);

  /**
   * Adapter constructor.
   *
   * @param {String} namespace name
   * @api public
   */

  function Cluster(nsp){
    Adapter.call(this, nsp);

    this.uid = uid;
    this.prefix = prefix;

    this.bmes = this.onmessage.bind(this);
    gEmitter.on(prefix + '#' + nsp.name + '#',this.bmes);
/*
    sub.subscribe(prefix + '#' + nsp.name + '#', function(err){
      if (err) self.emit('error', err);
    });
    sub.on('message', this.onmessage.bind(this));
*/
  }

  /**
   * Inherits from `Adapter`.
   */

  Cluster.prototype.__proto__ = Adapter.prototype;

  /**
   * Called with a subscription message
   *
   * @api private
   */

  Cluster.prototype.onmessage = function(auid, packet, opts){
    if (uid == auid) return debug('ignore same uid');

    if (packet && packet.nsp === undefined) {
      packet.nsp = '/';
    }

    if (!packet || packet.nsp != this.nsp.name) {
      return debug('ignore different namespace');
    }

    this.broadcast(this, packet, opts, true);
  };

  /**
   * Broadcasts a packet.
   *
   * @param {Object} packet to emit
   * @param {Object} options
   * @param {Boolean} whether the packet came from another node
   * @api public
   */

  Cluster.prototype.broadcast = function(packet, opts, remote){
    Adapter.prototype.broadcast.call(this, packet, opts);
    if (!remote) {
      if (opts.rooms) {
        opts.rooms.forEach(function(room) {
          gEmitter.emit(
            prefix + '#' + packet.nsp + '#' + room + '#',
            uid, packet, opts
          );
        });
      } else {
        gEmitter.emit(
          prefix + '#' + packet.nsp + '#',
          uid, packet, opts
        );
      }
    }
  };

  /**
   * Subscribe client to room messages.
   *
   * @param {String} client id
   * @param {String} room
   * @param {Function} callback (optional)
   * @api public
   */

  Cluster.prototype.add = function(id, room, fn){
    debug('adding %s to %s ', id, room);
    var self = this;
    this.sids[id] = this.sids[id] || {};
    this.sids[id][room] = true;
    this.rooms[room] = this.rooms[room] || {};
    this.rooms[room][id] = true;
    var channel = prefix + '#' + this.nsp.name + '#' + room + '#';
    gEmitter.on(
      prefix + '#' + this.nsp.name + '#' + room + '#',
      this.bmes
    );
    if(fn) process.nextTick(fn);
  };

  /**
   * Unsubscribe client from room messages.
   *
   * @param {String} session id
   * @param {String} room id
   * @param {Function} callback (optional)
   * @api public
   */

  Cluster.prototype.del = function(id, room, fn){
    debug('removing %s from %s', id, room);

    var self = this;
    this.sids[id] = this.sids[id] || {};
    this.rooms[room] = this.rooms[room] || {};
    delete this.sids[id][room];
    delete this.rooms[room][id];

    if (this.rooms.hasOwnProperty(room) && !Object.keys(this.rooms[room]).length) {
      delete this.rooms[room];
      gEmitter.removeEventListener(
        prefix + '#' + this.nsp.name + '#' + room + '#',
        this.bmes
      );
    }
    if(fn) process.nextTick(fn);
    /*
    else {
      if (fn) process.nextTick(fn.bind(null, null));
    }
    */
  };

  /**
   * Unsubscribe client completely.
   *
   * @param {String} client id
   * @param {Function} callback (optional)
   * @api public
   */

  Cluster.prototype.delAll = function(id, fn){
    debug('removing %s from all rooms', id);

    var self = this;
    var rooms = this.sids[id];

    if (!rooms) return process.nextTick(fn.bind(null, null));


    Object.keys(rooms).forEach(function(room){
      if (rooms.hasOwnProperty(room)) {
        delete self.rooms[room][id];
      }

      if (self.rooms.hasOwnProperty(room) && !Object.keys(self.rooms[room]).length) {
        delete self.rooms[room];
        gEmitter.removeEventListener(
          prefix + '#' + this.nsp.name + '#' + room + '#',
          self.bmes
        );
      }
    });
    delete self.sids[id];
    process.nextTick(fn);
  };

  Cluster.uid = uid;
  Cluster.prefix = prefix;

  return Cluster;

}
