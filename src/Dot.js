'use strict';

var famous = require('famous');
var Consts = require('./Consts.js');

var FamousEngine = famous.core.FamousEngine;
var Node = famous.core.Node;
var Position = famous.components.Position;
var Rotation = famous.components.Rotation;
var DOMElement = famous.domRenderables.DOMElement;

function Dot(id) {
	Node.call(this);

	// Center dot.
	this
		.setMountPoint(0.5, 0.5)
		.setAlign(0.5, 0.5)
		.setOrigin(0.5,0.5)
		.setSizeMode('absolute', 'absolute')
		.setAbsoluteSize(Consts.DOT_SIZE, Consts.DOT_SIZE);

	this.domElement = new DOMElement(this, {
		properties: {
			background: Consts.DOT_COLOR__UNTOUCHED
		},
		classes: ['Dot']
	});

	this.domElement.setAttribute('role', 'gridcell');
	this.domElement.setAttribute('aria-selected', false);
	this.domElement.setAttribute('aria-live', 'polite');
	this.domElement.setAttribute('aria-rowindex', Number.parseInt(id / Consts.ROWS));
	this.domElement.setAttribute('aria-colindex', id % Consts.COLUMNS);

	this.id = id;

	let localStorageDots = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__dots')) || [];
	if (localStorageDots.length > 0) {
		let _state = localStorageDots[id];
		this.state = _state;
		switch (_state) {
		case Consts.DOT_STATE__PLACED:
				this.state = Consts.DOT_STATE__PLACED;
				this.domElement.setProperty('background', Consts.DOT_COLOR__PLACED);
				this.domElement.setAttribute('aria-readonly', true);
				this.domElement.setAttribute('aria-selected', true);
				break;
		case Consts.DOT_STATE__HOVERED:
				this.state = Consts.DOT_STATE__HOVERED;
				this.domElement.setProperty('background', Consts.DOT_COLOR__HOVERED);
				this.domElement.setAttribute('aria-readonly', false);
				this.domElement.setAttribute('aria-selected', true);
				break;
		case Consts.DOT_STATE__UNTOUCHED:
		default:
				this.state = Consts.DOT_STATE__UNTOUCHED;
				this.domElement.setProperty('background', Consts.DOT_COLOR__UNTOUCHED);
				this.domElement.setAttribute('aria-readonly', false);
				this.domElement.setAttribute('aria-selected', false);
				break;
		}
	} else {
		this.state = Consts.DOT_STATE__UNTOUCHED;
	}

	this.hover = function hover() {
		if (this.state === Consts.DOT_STATE__UNTOUCHED) {
			this.state = Consts.DOT_STATE__HOVERED;
			this.domElement.setProperty('background', Consts.DOT_COLOR__HOVERED);
			this.domElement.setAttribute('aria-selected', true);
			let _localStorageDots = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__dots'));
			_localStorageDots[id] = Consts.DOT_STATE__HOVERED;
			localStorage.setItem(Consts.DIMENSION + '__dots', JSON.stringify(_localStorageDots));
		}
	};

	this.unhover = function unhover() {
		if (this.state === Consts.DOT_STATE__HOVERED) {
			this.state = Consts.DOT_STATE__UNTOUCHED;
			this.domElement.setProperty('background', Consts.DOT_COLOR__UNTOUCHED);
			this.domElement.setAttribute('aria-selected', false);
			let _localStorageDots = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__dots'));
			_localStorageDots[id] = Consts.DOT_STATE__UNTOUCHED;
			localStorage.setItem(Consts.DIMENSION + '__dots', JSON.stringify(_localStorageDots));
		}
	};

	this.place = function place() {
		if (this.state === Consts.DOT_STATE__HOVERED) {
			this.state = Consts.DOT_STATE__PLACED;
			this.domElement.setProperty('background', Consts.DOT_COLOR__PLACED);
			this.domElement.setAttribute('aria-readonly', true);
			let _localStorageDots = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__dots'));
			_localStorageDots[id] = Consts.DOT_STATE__PLACED;
			localStorage.setItem(Consts.DIMENSION + '__dots', JSON.stringify(_localStorageDots));
		}
	};

	this.unplace = function unplace(delayArg) {
		var delay = delayArg || false;
		var self = this;
		if (this.state === Consts.DOT_STATE__PLACED) {
			if (delay) {
				var clock = FamousEngine.getClock();
				clock.setTimeout(function() {
					self.domElement.setProperty('background', Consts.DOT_COLOR__UNTOUCHED);
				}, Consts.DURATION * delayArg);
			} else {
				this.domElement.setProperty('background', Consts.DOT_COLOR__UNTOUCHED);
			}
			this.state = Consts.DOT_STATE__UNTOUCHED;
			this.domElement.setAttribute('aria-readonly', false);
			this.domElement.setAttribute('aria-selected', false);
			let _localStorageDots = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__dots'));
			_localStorageDots[id] = Consts.DOT_STATE__UNTOUCHED;
			localStorage.setItem(Consts.DIMENSION + '__dots', JSON.stringify(_localStorageDots));
		}
	};

	this.select = function select() {
		if (this.state !== Consts.DOT_STATE__PLACED) {
			this.state = Consts.DOT_STATE__PLACED;
			this.domElement.setProperty('background', Consts.DOT_COLOR__PLACED);
			this.domElement.setAttribute('aria-readonly', true);
			let _localStorageDots = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__dots'));
			_localStorageDots[id] = Consts.DOT_STATE__PLACED;
			localStorage.setItem(Consts.DIMENSION + '__dots', JSON.stringify(_localStorageDots));
		}
	};

	this.position = new Position(this);
	this.rotation = new Rotation(this);
	this.rotation.set(0, 0, 0, 0);

	this.addUIEvent('mousedown');
	this.addUIEvent('mousemove');
	this.addUIEvent('click');
	this.addUIEvent('mouseup');
}

Dot.prototype = Object.create(Node.prototype);
Dot.prototype.constructor = Dot;

/*jshint -W074 */
Dot.prototype.onReceive = function onReceive(type, ev) {
	switch (type) {
	case 'mousedown':
			this._parent.mousingDown(this.id);
			break;
	case 'mousemove':
			if (this._parent.mousing === true) {
				this._parent.dotState(this.id);
				this.emit('id', this.domElement.id).emit('state', this.domElement.state);
			}
			break;
	case 'click':
			this._parent.dotState(this.id);
			this.emit('id', this.domElement.id).emit('state', this.domElement.state);
			break;
	case 'mouseup':
			this._parent.mousingUp(this.id);
			break;
	default:
			return false;
	}
};/*jshint +W074 */

module.exports = Dot;
